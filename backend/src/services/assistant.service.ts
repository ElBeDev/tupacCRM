import OpenAI from 'openai';
import prisma from '../lib/prisma';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface CreateAssistantDTO {
  name: string;
  description?: string;
  instructions: string;
  model?: string;
  temperature?: number;
  tools?: any[];
  fileIds?: string[];
}

export class AssistantService {
  async createAssistant(userId: string, data: CreateAssistantDTO) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    try {
      const openaiAssistant = await openai.beta.assistants.create({
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        model: data.model || 'gpt-4-turbo-preview',
        tools: (data.tools || []) as any,
      });

      const assistant = await prisma.assistant.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          model: data.model || 'gpt-4-turbo-preview',
          temperature: data.temperature || 0.7,
          openaiId: openaiAssistant.id,
          tools: data.tools || [],
          fileIds: data.fileIds || [],
          isActive: true,
        },
      });

      return assistant;
    } catch (error: any) {
      console.error('Error creating assistant:', error);
      throw new Error('Failed to create assistant: ' + error.message);
    }
  }

  async listAssistants(userId: string) {
    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        testMessages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    return assistants;
  }

  async getAssistant(assistantId: string, userId: string) {
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
      include: { testMessages: { orderBy: { createdAt: 'asc' } } },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    return assistant;
  }

  async createAssistantWithAI(userId: string, conversation: string[]) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en diseño de asistentes de IA. Basándote en la conversación del usuario, genera una configuración completa para un asistente de OpenAI. Responde SOLO en formato JSON válido con esta estructura: {"name": "Nombre del asistente", "description": "Descripción breve", "instructions": "Instrucciones detalladas del sistema para el asistente", "model": "gpt-4-turbo-preview", "temperature": 0.7}',
          },
          ...conversation.map((msg, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg,
          })),
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const config = JSON.parse(response.choices[0].message.content || '{}');
      return await this.createAssistant(userId, config);
    } catch (error: any) {
      console.error('Error creating assistant with AI:', error);
      throw new Error('Failed to create assistant with AI: ' + error.message);
    }
  }

  async updateAssistant(assistantId: string, userId: string, data: Partial<CreateAssistantDTO>) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    if (assistant.openaiId) {
      await openai.beta.assistants.update(assistant.openaiId, {
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        model: data.model,
        tools: (data.tools || []) as any,
      });
    }
    
    const updated = await prisma.assistant.update({
      where: { id: assistantId },
      data: {
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        model: data.model,
        temperature: data.temperature,
        tools: data.tools,
        fileIds: data.fileIds,
      },
    });
    
    return updated;
  }

  async deleteAssistant(assistantId: string, userId: string) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    if (assistant.openaiId) {
      try {
        await openai.beta.assistants.del(assistant.openaiId);
      } catch (error) {
        console.warn('Failed to delete from OpenAI');
      }
    }
    
    await prisma.assistant.delete({ where: { id: assistantId } });
    return { success: true };
  }

  async testAssistant(assistantId: string, userId: string, message: string) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
    });
    
    if (!assistant || !assistant.openaiId) {
      throw new Error('Assistant not found');
    }

    // Intentar parsear el mensaje por si contiene imágenes
    let messageContent: any = message;
    let hasImages = false;
    
    try {
      const parsed = JSON.parse(message);
      if (parsed.images && Array.isArray(parsed.images)) {
        hasImages = true;
        messageContent = parsed;
      }
    } catch {
      // Es un mensaje de texto simple
    }

    // Guardar mensaje del usuario
    const displayMessage = hasImages ? messageContent.text || 'Imagen enviada' : message;
    await prisma.assistantTestMessage.create({
      data: { assistantId, role: 'user', content: displayMessage },
    });

    // Si hay imágenes, usar Chat Completions API con Vision
    if (hasImages && (assistant.model.includes('gpt-4o') || assistant.model.includes('gpt-4-turbo'))) {
      const content: any[] = [];
      
      if (messageContent.text) {
        content.push({ type: 'text', text: messageContent.text });
      }
      
      for (const imageData of messageContent.images) {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageData,
            detail: 'high'
          }
        });
      }

      const visionResponse = await openai.chat.completions.create({
        model: assistant.model,
        messages: [
          { role: 'system', content: assistant.instructions },
          { role: 'user', content }
        ],
        max_tokens: 4096,
      });

      const responseText = visionResponse.choices[0].message.content || 'Sin respuesta';

      await prisma.assistantTestMessage.create({
        data: { assistantId, role: 'assistant', content: responseText },
      });

      return { response: responseText };
    }

    // Sin imágenes, usar Assistants API normal
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.openaiId,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status !== 'completed') {
      throw new Error('Run failed with status: ' + runStatus.status);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(
      msg => msg.role === 'assistant' && msg.run_id === run.id
    );

    if (!assistantMessage) throw new Error('No response from assistant');

    const textContent = assistantMessage.content.find(
      content => content.type === 'text'
    );
    
    const responseText = textContent && 'text' in textContent 
      ? textContent.text.value 
      : 'No text response';

    await prisma.assistantTestMessage.create({
      data: { assistantId, role: 'assistant', content: responseText },
    });

    return { response: responseText, runId: run.id, threadId: thread.id };
  }

  async getTestMessages(assistantId: string, userId: string) {
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    return await prisma.assistantTestMessage.findMany({
      where: { assistantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async clearTestMessages(assistantId: string, userId: string) {
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, userId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    await prisma.assistantTestMessage.deleteMany({
      where: { assistantId },
    });
    
    return { success: true };
  }
}

export default new AssistantService();
