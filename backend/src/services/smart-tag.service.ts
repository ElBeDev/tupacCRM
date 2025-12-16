import prisma from '../lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt del asistente de Tupac para detectar intenciones
const TUPAC_INTENT_PROMPT = `Sos el asistente virtual de Tupac en Expansión, un mayorista de alimentos abierto a todo público.

Tu tarea es ANALIZAR el mensaje del cliente y detectar su INTENCIÓN. No respondas al cliente, solo clasifica.

INTENCIONES POSIBLES:
- "pedido": El cliente quiere pasar un pedido o agregar productos
- "consulta_precio": El cliente pregunta por precios de productos específicos
- "consulta_stock": El cliente pregunta por disponibilidad/stock
- "consulta_general": Pregunta sobre horarios, pagos, cómo comprar, ubicación
- "reclamo": El cliente tiene una queja, devolución o problema con un producto
- "saludo": Es solo un saludo inicial sin intención clara
- "lista_precios": El cliente pide lista de precios general
- "pedido_incompleto": El cliente menciona productos sin marca/presentación
- "fuera_horario": Mensaje que sugiere urgencia de retiro inmediato
- "confirmacion": El cliente confirma algo o dice que sí/ok
- "despedida": El cliente se despide o agradece
- "otro": No encaja en ninguna categoría

INFORMACIÓN DEL NEGOCIO:
- Horarios: Lun-Vie 7-12h y 13-17h, Sáb 7-16h, Feriados 7-14h
- No hay envíos, solo retiro en local
- Medios de pago: efectivo, tarjetas, transferencia, billeteras
- No hay mínimo de compra

Responde SOLO en formato JSON:
{
  "intencion": "<una de las intenciones>",
  "confianza": <0.0-1.0>,
  "productos_mencionados": ["producto1", "producto2"],
  "tiene_marca": <true/false>,
  "requiere_seguimiento": <true/false>,
  "prioridad": "alta|media|baja",
  "resumen": "Breve resumen del mensaje"
}`;

export interface CreateSmartTagDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  conditions?: any;
  isAutomatic?: boolean;
}

export interface UpdateSmartTagDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  conditions?: any;
  isAutomatic?: boolean;
  isActive?: boolean;
}

export class SmartTagService {
  async createSmartTag(data: CreateSmartTagDTO) {
    const smartTag = await prisma.smartTag.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#9D39FE',
        icon: data.icon,
        conditions: data.conditions,
        isAutomatic: data.isAutomatic || false,
        isActive: true,
      },
    });

    return smartTag;
  }

  async listSmartTags() {
    const smartTags = await prisma.smartTag.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return smartTags;
  }

  async getAllSmartTags() {
    const smartTags = await prisma.smartTag.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return smartTags;
  }

  async getSmartTag(id: string) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');
    return smartTag;
  }

  async updateSmartTag(id: string, data: UpdateSmartTagDTO) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');

    const updated = await prisma.smartTag.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        conditions: data.conditions,
        isAutomatic: data.isAutomatic,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  async deleteSmartTag(id: string) {
    const smartTag = await prisma.smartTag.findUnique({
      where: { id },
    });

    if (!smartTag) throw new Error('Smart Tag not found');

    await prisma.smartTag.delete({ where: { id } });
    return { success: true };
  }

  // Aplicar tags automáticos a un contacto basado en condiciones
  async evaluateAndApplyTags(contactId: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) return [];

    const automaticTags = await prisma.smartTag.findMany({
      where: { isAutomatic: true, isActive: true },
    });

    const appliedTags: string[] = [];

    for (const tag of automaticTags) {
      if (tag.conditions && this.evaluateConditions(contact, tag.conditions)) {
        appliedTags.push(tag.name);
      }
    }

    // Actualizar tags del contacto
    if (appliedTags.length > 0) {
      const existingTags = contact.tags || [];
      const combinedTags = [...existingTags, ...appliedTags];
      const newTags = Array.from(new Set(combinedTags));

      await prisma.contact.update({
        where: { id: contactId },
        data: { tags: newTags },
      });
    }

    return appliedTags;
  }

  // Evaluar condiciones de un tag
  private evaluateConditions(contact: any, conditions: any): boolean {
    if (!conditions || !conditions.field) return false;

    const { field, operator, value } = conditions;
    const contactValue = contact[field];

    if (contactValue === undefined || contactValue === null) return false;

    switch (operator) {
      case '==':
      case '=':
        return contactValue == value;
      case '!=':
        return contactValue != value;
      case '>':
        return contactValue > value;
      case '>=':
        return contactValue >= value;
      case '<':
        return contactValue < value;
      case '<=':
        return contactValue <= value;
      case 'contains':
        return String(contactValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith':
        return String(contactValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'endsWith':
        return String(contactValue).toLowerCase().endsWith(String(value).toLowerCase());
      default:
        return false;
    }
  }

  // Obtener estadísticas de uso de tags
  async getTagStats() {
    const contacts = await prisma.contact.findMany({
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};

    for (const contact of contacts) {
      for (const tag of contact.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return tagCounts;
  }

  // Detectar intención de un mensaje usando IA
  async detectIntent(message: string): Promise<{
    intencion: string;
    confianza: number;
    productos_mencionados: string[];
    tiene_marca: boolean;
    requiere_seguimiento: boolean;
    prioridad: 'alta' | 'media' | 'baja';
    resumen: string;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[SmartTag] OpenAI API key not configured, using fallback');
      return this.fallbackIntentDetection(message);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: TUPAC_INTENT_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      console.log('[SmartTag] Intent detected:', result);
      return result;
    } catch (error) {
      console.error('[SmartTag] Error detecting intent:', error);
      return this.fallbackIntentDetection(message);
    }
  }

  // Fallback para detección de intención sin IA
  private fallbackIntentDetection(message: string) {
    const lowerMessage = message.toLowerCase();
    
    let intencion = 'otro';
    let prioridad: 'alta' | 'media' | 'baja' = 'media';
    
    // Detección básica por palabras clave
    if (/hola|buen(os|as)|buenas/i.test(lowerMessage)) {
      intencion = 'saludo';
      prioridad = 'baja';
    } else if (/precio|cuanto|cuesta|vale/i.test(lowerMessage)) {
      intencion = 'consulta_precio';
      prioridad = 'media';
    } else if (/stock|hay|tienen|disponible|disponibilidad/i.test(lowerMessage)) {
      intencion = 'consulta_stock';
      prioridad = 'media';
    } else if (/pedido|quiero|necesito|dame|mand(a|e)|pon(e|ga)me/i.test(lowerMessage)) {
      intencion = 'pedido';
      prioridad = 'alta';
    } else if (/horario|cuando|abren|cierran|pago|tarjeta|efectivo|transferencia/i.test(lowerMessage)) {
      intencion = 'consulta_general';
      prioridad = 'baja';
    } else if (/lista|catalogo|precios/i.test(lowerMessage)) {
      intencion = 'lista_precios';
      prioridad = 'media';
    } else if (/reclamo|queja|problema|devol|malo|feo|podrido|vencido/i.test(lowerMessage)) {
      intencion = 'reclamo';
      prioridad = 'alta';
    } else if (/gracias|chau|nos vemos|hasta/i.test(lowerMessage)) {
      intencion = 'despedida';
      prioridad = 'baja';
    } else if (/^(si|ok|dale|listo|bien|perfecto|confirmo)$/i.test(lowerMessage.trim())) {
      intencion = 'confirmacion';
      prioridad = 'media';
    }

    return {
      intencion,
      confianza: 0.6,
      productos_mencionados: [],
      tiene_marca: false,
      requiere_seguimiento: intencion === 'pedido' || intencion === 'reclamo',
      prioridad,
      resumen: `Mensaje: "${message.substring(0, 50)}..."`
    };
  }

  // Analizar mensaje y aplicar tags automáticamente a una conversación
  async analyzeAndTagConversation(conversationId: string, message: string) {
    const intent = await this.detectIntent(message);
    
    // Mapear intención a tags
    const intentToTags: Record<string, string[]> = {
      'pedido': ['🛒 Pedido', 'Hot Lead'],
      'consulta_precio': ['💰 Consulta Precio'],
      'consulta_stock': ['📦 Consulta Stock'],
      'consulta_general': ['ℹ️ Info General'],
      'reclamo': ['⚠️ Reclamo', 'Urgente'],
      'lista_precios': ['📋 Pidió Lista'],
      'pedido_incompleto': ['🛒 Pedido', '⏳ Incompleto'],
      'fuera_horario': ['🌙 Fuera Horario'],
      'saludo': ['👋 Nuevo'],
      'confirmacion': ['✅ Confirmó'],
      'despedida': ['👋 Cerrado'],
      'otro': []
    };

    const tagsToApply = intentToTags[intent.intencion] || [];
    
    // Agregar tag de prioridad si es alta
    if (intent.prioridad === 'alta' && !tagsToApply.includes('Urgente')) {
      tagsToApply.push('🔥 Prioridad Alta');
    }

    // Buscar la conversación y su contacto
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true }
    });

    if (conversation && conversation.contact) {
      const existingTags = conversation.contact.tags || [];
      const newTags = Array.from(new Set([...existingTags, ...tagsToApply]));
      
      await prisma.contact.update({
        where: { id: conversation.contact.id },
        data: { tags: newTags }
      });
    }

    return {
      intent,
      appliedTags: tagsToApply,
      conversationId
    };
  }

  // Analizar múltiples mensajes de una conversación para contexto completo
  async analyzeConversationHistory(conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 10
        },
        contact: true
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Analizar los últimos mensajes del cliente
    const clientMessages = conversation.messages
      .filter((m: any) => !m.isFromMe)
      .map((m: any) => m.content)
      .reverse();

    if (clientMessages.length === 0) {
      return { intent: null, appliedTags: [], message: 'No client messages found' };
    }

    // Analizar el último mensaje del cliente
    const lastMessage = clientMessages[clientMessages.length - 1];
    return this.analyzeAndTagConversation(conversationId, lastMessage);
  }
}

export default new SmartTagService();
