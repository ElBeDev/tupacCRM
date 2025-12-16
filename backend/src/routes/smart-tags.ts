import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import smartTagService from '../services/smart-tag.service';

const router = Router();

// Listar todos los smart tags activos
router.get('/', authenticate, async (req, res) => {
  try {
    const smartTags = await smartTagService.listSmartTags();
    res.json(smartTags);
  } catch (error: any) {
    console.error('Error listing smart tags:', error);
    res.status(500).json({ error: error.message || 'Failed to list smart tags' });
  }
});

// Obtener estadísticas de uso de tags
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await smartTagService.getTagStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting tag stats:', error);
    res.status(500).json({ error: error.message || 'Failed to get tag stats' });
  }
});

// Obtener un smart tag específico
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const smartTag = await smartTagService.getSmartTag(id);
    res.json(smartTag);
  } catch (error: any) {
    console.error('Error getting smart tag:', error);

    if (error.message === 'Smart Tag not found') {
      return res.status(404).json({ error: 'Smart Tag not found' });
    }

    res.status(500).json({ error: error.message || 'Failed to get smart tag' });
  }
});

// Crear un nuevo smart tag
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, color, icon, conditions, isAutomatic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const smartTag = await smartTagService.createSmartTag({
      name,
      description,
      color,
      icon,
      conditions,
      isAutomatic,
    });

    res.status(201).json(smartTag);
  } catch (error: any) {
    console.error('Error creating smart tag:', error);
    res.status(500).json({ error: error.message || 'Failed to create smart tag' });
  }
});

// Actualizar un smart tag
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, conditions, isAutomatic, isActive } = req.body;

    const smartTag = await smartTagService.updateSmartTag(id, {
      name,
      description,
      color,
      icon,
      conditions,
      isAutomatic,
      isActive,
    });

    res.json(smartTag);
  } catch (error: any) {
    console.error('Error updating smart tag:', error);

    if (error.message === 'Smart Tag not found') {
      return res.status(404).json({ error: 'Smart Tag not found' });
    }

    res.status(500).json({ error: error.message || 'Failed to update smart tag' });
  }
});

// Eliminar un smart tag
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await smartTagService.deleteSmartTag(id);
    res.json({ success: true, message: 'Smart Tag deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting smart tag:', error);

    if (error.message === 'Smart Tag not found') {
      return res.status(404).json({ error: 'Smart Tag not found' });
    }

    res.status(500).json({ error: error.message || 'Failed to delete smart tag' });
  }
});

// Evaluar y aplicar tags automáticos a un contacto
router.post('/evaluate/:contactId', authenticate, async (req, res) => {
  try {
    const { contactId } = req.params;
    const appliedTags = await smartTagService.evaluateAndApplyTags(contactId);
    res.json({ success: true, appliedTags });
  } catch (error: any) {
    console.error('Error evaluating tags:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate tags' });
  }
});

// Detectar intención de un mensaje usando IA
router.post('/detect-intent', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intent = await smartTagService.detectIntent(message);
    res.json(intent);
  } catch (error: any) {
    console.error('Error detecting intent:', error);
    res.status(500).json({ error: error.message || 'Failed to detect intent' });
  }
});

// Analizar mensaje y aplicar tags automáticamente a una conversación
router.post('/analyze-conversation/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await smartTagService.analyzeAndTagConversation(conversationId, message);
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing conversation:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze conversation' });
  }
});

// Analizar historial completo de una conversación
router.post('/analyze-history/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await smartTagService.analyzeConversationHistory(conversationId);
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing conversation history:', error);
    
    if (error.message === 'Conversation not found') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to analyze conversation history' });
  }
});

export default router;
