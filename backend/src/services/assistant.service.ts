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

    await prisma.assistantTestMessage.create({
      data: { assistantId, role: 'user', content: message },
    });

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
