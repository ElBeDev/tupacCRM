import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import aiService from '../services/ai.service';
import prisma from '../lib/prisma';

const router = Router();

// Analizar una conversación
router.post('/analyze-conversation', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Obtener mensajes de la conversación
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { sentAt: 'asc' },
          take: 20, // Últimos 20 mensajes
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = conversation.messages.map((m: any) => m.content);
    const analysis = await aiService.analyzeConversation(messages, {
      name: conversation.contact.name,
      email: conversation.contact.email,
      phone: conversation.contact.phone,
      currentScore: conversation.contact.score,
    });

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    res.status(500).json({ error: 'Failed to analyze conversation' });
  }
});

// Generar respuesta automática
router.post('/generate-response', authenticate, async (req, res) => {
  try {
    const { conversationId, customPrompt } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { sentAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = conversation.messages.map((m: any) => m.content);
    const response = await aiService.generateResponse(
      messages,
      {
        name: conversation.contact.name,
        email: conversation.contact.email,
      },
      customPrompt
    );

    res.json({ response });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Pre-calificar un lead
router.post('/qualify-lead', authenticate, async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    // Obtener contacto y sus conversaciones
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: { sentAt: 'asc' },
              take: 20,
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 1, // Última conversación
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const messages =
      contact.conversations[0]?.messages.map((m: any) => m.content) || [];
    
    const qualification = await aiService.qualifyLead(messages, {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      source: contact.source,
      currentScore: contact.score,
      currentStatus: contact.status,
    });

    // Actualizar contacto con la nueva calificación
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        score: qualification.score,
        status: qualification.status as any,
      },
    });

    res.json(qualification);
  } catch (error) {
    console.error('Error qualifying lead:', error);
    res.status(500).json({ error: 'Failed to qualify lead' });
  }
});

// Analizar sentimiento de un mensaje
router.post('/analyze-sentiment', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sentiment = await aiService.analyzeSentiment(message);
    res.json({ sentiment });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Generar resumen de conversaciones recientes
router.get('/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Obtener conversaciones recientes del usuario
    const conversations = await prisma.conversation.findMany({
      where: {
        contact: {
          assignedToId: userId,
        },
      },
      include: {
        contact: {
          select: {
            name: true,
          },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 5,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // Últimas 10 conversaciones
    });

    const summary = await aiService.summarizeConversations(conversations);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Obtener configuración de IA
router.get('/config', authenticate, async (req, res) => {
  try {
    // Buscar configuración activa primero, si no hay, buscar cualquiera
    let config = await prisma.aIConfig.findFirst({
      where: { isActive: true },
    });
    
    if (!config) {
      config = await prisma.aIConfig.findFirst();
    }

    res.json(config || {});
  } catch (error) {
    console.error('Error getting AI config:', error);
    res.status(500).json({ error: 'Failed to get AI config' });
  }
});

// Check AI status (OpenAI API key)
router.get('/status', authenticate, async (req, res) => {
  try {
    const connected = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    res.json({ connected });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({ error: 'Failed to check AI status' });
  }
});

// Test AI
router.post('/test', authenticate, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const analysis = await aiService.analyzeConversation(messages, {
      name: 'Test Contact',
      email: 'test@example.com',
    });

    res.json(analysis);
  } catch (error) {
    console.error('Error testing AI:', error);
    res.status(500).json({ error: 'Failed to test AI' });
  }
});

// Actualizar configuración de IA
router.put('/config/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, systemPrompt, model, temperature, maxTokens, isActive, autoReply, fallbackMessage } = req.body;

    const config = await prisma.aIConfig.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(model !== undefined && { model }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
        ...(isActive !== undefined && { isActive }),
        ...(autoReply !== undefined && { autoReply }),
        ...(fallbackMessage !== undefined && { fallbackMessage }),
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ error: 'Failed to update AI config' });
  }
});

export default router;
