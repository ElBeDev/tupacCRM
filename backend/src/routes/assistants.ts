import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import assistantService from '../services/assistant.service';

const router = Router();

// Crear asistente (modo manual)
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { name, description, instructions, model, temperature, tools, fileIds } = req.body;

    if (!name || !instructions) {
      return res.status(400).json({ error: 'Name and instructions are required' });
    }

    const assistant = await assistantService.createAssistant(userId, {
      name,
      description,
      instructions,
      model,
      temperature,
      tools,
      fileIds,
    });

    res.status(201).json(assistant);
  } catch (error: any) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ error: error.message || 'Failed to create assistant' });
  }
});

// Crear asistente con IA (modo conversacional)
router.post('/create-with-ai', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: 'Conversation array is required' });
    }

    const assistant = await assistantService.createAssistantWithAI(userId, conversation);
    res.status(201).json(assistant);
  } catch (error: any) {
    console.error('Error creating assistant with AI:', error);
    res.status(500).json({ error: error.message || 'Failed to create assistant with AI' });
  }
});

// Listar asistentes del usuario
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const assistants = await assistantService.listAssistants(userId);
    res.json(assistants);
  } catch (error: any) {
    console.error('Error listing assistants:', error);
    res.status(500).json({ error: error.message || 'Failed to list assistants' });
  }
});

// Obtener un asistente específico
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const assistant = await assistantService.getAssistant(id, userId);
    res.json(assistant);
  } catch (error: any) {
    console.error('Error getting assistant:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to get assistant' });
  }
});

// Actualizar un asistente
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, description, instructions, model, temperature, tools, fileIds } = req.body;

    const assistant = await assistantService.updateAssistant(id, userId, {
      name,
      description,
      instructions,
      model,
      temperature,
      tools,
      fileIds,
    });

    res.json(assistant);
  } catch (error: any) {
    console.error('Error updating assistant:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to update assistant' });
  }
});

// Eliminar un asistente
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await assistantService.deleteAssistant(id, userId);
    res.json({ success: true, message: 'Assistant deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting assistant:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to delete assistant' });
  }
});

// Probar asistente con un mensaje
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await assistantService.testAssistant(id, userId, message);
    res.json(result);
  } catch (error: any) {
    console.error('Error testing assistant:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to test assistant' });
  }
});

// Obtener historial de mensajes de prueba
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const messages = await assistantService.getTestMessages(id, userId);
    res.json(messages);
  } catch (error: any) {
    console.error('Error getting test messages:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to get test messages' });
  }
});

// Limpiar historial de mensajes de prueba
router.delete('/:id/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await assistantService.clearTestMessages(id, userId);
    res.json({ success: true, message: 'Test messages cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing test messages:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to clear test messages' });
  }
});

export default router;
