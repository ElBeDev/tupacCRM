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

// Sincronizar asistente con OpenAI (verificar y actualizar configuración)
router.post('/:id/sync', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await assistantService.syncAssistant(id, userId);
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing assistant:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to sync assistant' });
  }
});

// Obtener configuración actual del asistente en OpenAI
router.get('/:id/openai-config', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const config = await assistantService.getOpenAIConfig(id, userId);
    res.json(config);
  } catch (error: any) {
    console.error('Error getting OpenAI config:', error);
    
    if (error.message === 'Assistant not found') {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to get OpenAI config' });
  }
});

// Templates del Marketplace
const MARKETPLACE_TEMPLATES: Record<string, { name: string; description: string; instructions: string; model: string; temperature: number }> = {
  '1': {
    name: 'Asistente de Ventas',
    description: 'IA especializada en cerrar ventas y hacer seguimiento de leads',
    instructions: `Eres un asistente de ventas experto. Tu objetivo es:
- Identificar las necesidades del cliente
- Presentar soluciones de manera persuasiva
- Manejar objeciones con empatía
- Guiar al cliente hacia el cierre de la venta
- Hacer seguimiento proactivo de leads
- Usar técnicas de venta consultiva
Siempre sé profesional, amable y orientado a resultados.`,
    model: 'gpt-4o',
    temperature: 0.7,
  },
  '2': {
    name: 'Soporte al Cliente 24/7',
    description: 'Responde automáticamente preguntas frecuentes de tus clientes',
    instructions: `Eres un asistente de soporte al cliente. Tu objetivo es:
- Resolver dudas y problemas de los clientes de manera eficiente
- Proporcionar información clara y precisa
- Escalar casos complejos cuando sea necesario
- Mantener un tono amable y profesional
- Ofrecer soluciones alternativas cuando la primera no funcione
- Hacer seguimiento para asegurar la satisfacción del cliente
Siempre prioriza la experiencia del cliente.`,
    model: 'gpt-4o',
    temperature: 0.5,
  },
  '3': {
    name: 'Generador de Contenido',
    description: 'Crea contenido para redes sociales y marketing',
    instructions: `Eres un experto en creación de contenido. Tu objetivo es:
- Crear contenido atractivo para redes sociales
- Escribir copies persuasivos para marketing
- Generar ideas creativas de contenido
- Adaptar el tono según la plataforma (Instagram, LinkedIn, Twitter, etc.)
- Incluir llamados a la acción efectivos
- Optimizar para engagement y conversiones
Sé creativo, original y siempre alineado con la marca.`,
    model: 'gpt-4o',
    temperature: 0.8,
  },
  '4': {
    name: 'Análisis de Sentimientos',
    description: 'Analiza el sentimiento de las conversaciones con clientes',
    instructions: `Eres un analista de sentimientos. Tu objetivo es:
- Analizar el tono emocional de los mensajes
- Identificar si el cliente está satisfecho, neutral o insatisfecho
- Detectar señales de urgencia o frustración
- Proporcionar insights sobre la experiencia del cliente
- Sugerir acciones basadas en el análisis
Sé objetivo y preciso en tus análisis.`,
    model: 'gpt-4o',
    temperature: 0.3,
  },
  '5': {
    name: 'Traductor Multiidioma',
    description: 'Traduce automáticamente conversaciones a 100+ idiomas',
    instructions: `Eres un traductor profesional. Tu objetivo es:
- Traducir mensajes manteniendo el contexto y tono original
- Adaptar expresiones idiomáticas al idioma destino
- Mantener la formalidad apropiada según el contexto
- Indicar cuando una traducción literal no transmite el significado correcto
Sé preciso y natural en tus traducciones.`,
    model: 'gpt-4o',
    temperature: 0.3,
  },
  '6': {
    name: 'Recordatorios Inteligentes',
    description: 'Sistema automático de recordatorios y seguimiento',
    instructions: `Eres un asistente de productividad. Tu objetivo es:
- Ayudar a gestionar tareas y recordatorios
- Hacer seguimiento de compromisos pendientes
- Sugerir momentos óptimos para seguimientos
- Organizar prioridades de manera efectiva
Sé proactivo y ayuda a mantener la organización.`,
    model: 'gpt-4o',
    temperature: 0.5,
  },
};

// Instalar template del Marketplace
router.post('/marketplace/install/:templateId', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { templateId } = req.params;

    const template = MARKETPLACE_TEMPLATES[templateId];
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const assistant = await assistantService.createAssistant(userId, {
      name: template.name,
      description: template.description,
      instructions: template.instructions,
      model: template.model,
      temperature: template.temperature,
    });

    res.status(201).json({ 
      success: true, 
      message: `${template.name} instalado correctamente`,
      assistant 
    });
  } catch (error: any) {
    console.error('Error installing marketplace template:', error);
    res.status(500).json({ error: error.message || 'Failed to install template' });
  }
});

// Listar templates del Marketplace
router.get('/marketplace/templates', async (_req, res) => {
  try {
    const templates = Object.entries(MARKETPLACE_TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
    }));
    res.json(templates);
  } catch (error: any) {
    console.error('Error listing marketplace templates:', error);
    res.status(500).json({ error: error.message || 'Failed to list templates' });
  }
});

export default router;
