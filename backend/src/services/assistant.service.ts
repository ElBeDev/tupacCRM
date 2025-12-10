import OpenAI from 'openai';
import prisma from '../lib/prisma';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export interface CreateAssistantDTO {
  name: string;
  description?: string;
  instructions: string;
  model?: string;
  temperature?: number;
  tools?: Array<{ type: string }>;
  fileIds?: string[];
}

export interface TestMessageDTO {
  message: string;
  assistantId: string;
}

export class AssistantService {
  /**
   * Crear un asistente (con OpenAI)
   */
  async createAssistant(userId: string, data: CreateAssistantDTO) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Crear asistente en OpenAI
      const openaiAssistant = await openai.beta.assistants.create({
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        model: data.model || 'gpt-4-turbo-preview',
        tools: data.tools || [],
        file_ids: data.fileIds || [],
      });

      // Guardar en base de datos
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
      throw new Error(`Failed to create assistant: ${error.message}`);
    }
  }

  /**
   * Crear un asistente usando IA (modo conversacional)
   */
  async createAssistantWithAI(userId: string, conversation: string[]) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Usar GPT para generar la configuración del asistente basado en la conversación
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en diseño de asistentes de IA. Basándote en la conversación del usuario, genera una configuración completa para un asistente de OpenAI.

Responde SOLO en formato JSON válido con esta estructura:
{
  "name": "Nombre del asistente",
  "description": "Descripción breve",
  "instructions": "Instrucciones detalladas del sistema para el asistente",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7
}`,
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
      
      // Crear el asistente con la configuración generada
      return await this.createAssistant(userId, config);
    } catch (error: any) {
      console.error('Error creating assistant with AI:', error);
      throw new Error(`Failed to create assistant with AI: ${error.message}`);
    }
  }

  /**
   * Listar asistentes del usuario
   */
  async listAssistants(userId: string) {
    try {
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
    } catch (error: any) {
      console.error('Error listing assistants:', error);
      throw new Error(`Failed to list assistants: ${error.message}`);
    }
  }

  /**
   * Obtener un asistente específico
   */
  async getAssistant(assistantId: string, userId: string) {
    try {
      const assistant = await prisma.assistant.findFirst({
        where: {
          id: assistantId,
          userId,
        },
        include: {
          testMessages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      return assistant;
    } catch (error: any) {
      console.error('Error getting assistant:', error);
      throw new Error(`Failed to get assistant: ${error.message}`);
    }
  }

  /**
   * Actualizar un asistente
   */
  async updateAssistant(
    assistantId: string,
    userId: string,
    data: Partial<CreateAssistantDTO>
  ) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const assistant = await prisma.assistant.findFirst({
        where: { id: assistantId, userId },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      // Actualizar en OpenAI si existe openaiId
      if (assistant.openaiId) {
        await openai.beta.assistants.update(assistant.openaiId, {
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          model: data.model,
          tools: data.tools,
          file_ids: data.fileIds,
        });
      }

      // Actualizar en base de datos
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
    } catch (error: any) {
      console.error('Error updating assistant:', error);
      throw new Error(`Failed to update assistant: ${error.message}`);
    }
  }

  /**
   * Eliminar un asistente
   */
  async deleteAssistant(assistantId: string, userId: string) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const assistant = await prisma.assistant.findFirst({
        where: { id: assistantId, userId },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      // Eliminar en OpenAI si existe openaiId
      if (assistant.openaiId) {
        await openai.beta.assistants.del(assistant.openaiId);
      }

      // Eliminar en base de datos
      await prisma.assistant.delete({
        where: { id: assistantId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting assistant:', error);
      throw new Error(`Failed to delete assistant: ${error.message}`);
    }
  }

  /**
   * Probar un asistente con un mensaje (streaming)
   */
  async testAssistant(assistantId: string, userId: string, message: string) {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const assistant = await prisma.assistant.findFirst({
        where: { id: assistantId, userId },
      });

      if (!assistant || !assistant.openaiId) {
        throw new Error('Assistant not found');
      }

      // Guardar mensaje del usuario
      await prisma.assistantTestMessage.create({
        data: {
          assistantId,
          role: 'user',
          content: message,
        },
      });

      // Crear thread para esta conversación
      const thread = await openai.beta.threads.create();

      // Agregar mensaje al thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: message,
      });

      // Ejecutar el asistente
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.openaiId,
      });

      // Esperar a que termine
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }

      // Obtener mensajes
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(
        msg => msg.role === 'assistant' && msg.run_id === run.id
      );

      if (!assistantMessage) {
        throw new Error('No response from assistant');
      }

      // Extraer contenido de texto
      const textContent = assistantMessage.content.find(
        content => content.type === 'text'
      );
      
      const responseText = textContent && 'text' in textContent 
        ? textContent.text.value 
        : 'No text response';

      // Guardar respuesta del asistente
      await prisma.assistantTestMessage.create({
        data: {
          assistantId,
          role: 'assistant',
          content: responseText,
        },
      });

      return {
        response: responseText,
        runId: run.id,
        threadId: thread.id,
      };
    } catch (error: any) {
      console.error('Error testing assistant:', error);
      throw new Error(`Failed to test assistant: ${error.message}`);
    }
  }

  /**
   * Obtener historial de mensajes de prueba
   */
  async getTestMessages(assistantId: string, userId: string) {
    try {
      const assistant = await prisma.assistant.findFirst({
        where: { id: assistantId, userId },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      const messages = await prisma.assistantTestMessage.findMany({
        where: { assistantId },
        orderBy: { createdAt: 'asc' },
      });

      return messages;
    } catch (error: any) {
      console.error('Error getting test messages:', error);
      throw new Error(`Failed to get test messages: ${error.message}`);
    }
  }

  /**
   * Limpiar historial de mensajes de prueba
   */
  async clearTestMessages(assistantId: string, userId: string) {
    try {
      const assistant = await prisma.assistant.findFirst({
        where: { id: assistantId, userId },
      });

      if (!assistant) {
        throw new Error('Assistant not found');
      }

      await prisma.assistantTestMessage.deleteMany({
        where: { assistantId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error clearing test messages:', error);
      throw new Error(`Failed to clear test messages: ${error.message}`);
    }
  }
}

export default new AssistantService();
