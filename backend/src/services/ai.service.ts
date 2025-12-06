import OpenAI from 'openai';
import prisma from '../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: 'information' | 'purchase' | 'complaint' | 'other';
  urgency: 'high' | 'medium' | 'low';
  suggestedScore: number;
  suggestedStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';
  summary: string;
  suggestedResponse?: string;
}

export class AIService {
  /**
   * Analiza un mensaje o conversación usando OpenAI
   */
  async analyzeConversation(messages: string[], contactInfo?: any): Promise<AIAnalysisResult> {
    try {
      const config = await this.getActiveConfig();
      
      const conversationText = messages.join('\n');
      const contextInfo = contactInfo ? `\nInformación del contacto: ${JSON.stringify(contactInfo)}` : '';

      const prompt = `${config.systemPrompt}

Analiza la siguiente conversación de un lead y proporciona un análisis detallado:

Conversación:
${conversationText}${contextInfo}

Responde en formato JSON con la siguiente estructura:
{
  "sentiment": "positive|neutral|negative",
  "intent": "information|purchase|complaint|other",
  "urgency": "high|medium|low",
  "suggestedScore": <número 0-100>,
  "suggestedStatus": "NEW|CONTACTED|QUALIFIED|PROPOSAL|WON|LOST",
  "summary": "Resumen breve de la conversación",
  "suggestedResponse": "Respuesta sugerida para continuar la conversación"
}`;

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as AIAnalysisResult;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      // Fallback en caso de error
      return {
        sentiment: 'neutral',
        intent: 'information',
        urgency: 'medium',
        suggestedScore: 50,
        suggestedStatus: 'CONTACTED',
        summary: 'Error al analizar la conversación',
      };
    }
  }

  /**
   * Genera una respuesta automática basada en el contexto
   */
  async generateResponse(
    conversationHistory: string[],
    contactInfo?: any,
    customPrompt?: string
  ): Promise<string> {
    try {
      const config = await this.getActiveConfig();
      
      const context = conversationHistory.join('\n');
      const contactContext = contactInfo ? `\nContacto: ${JSON.stringify(contactInfo)}` : '';

      const prompt = customPrompt || `Genera una respuesta profesional y amigable para continuar esta conversación de ventas:

${context}${contactContext}

La respuesta debe ser:
- Natural y conversacional
- Enfocada en ayudar al cliente
- No más de 2-3 oraciones
- Sin saludos redundantes si ya hay contexto`;

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: 200,
      });

      return response.choices[0].message.content || 'No pude generar una respuesta.';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Lo siento, estoy teniendo problemas para responder en este momento. Un agente se pondrá en contacto contigo pronto.';
    }
  }

  /**
   * Pre-califica un lead basándose en la conversación
   */
  async qualifyLead(
    conversationHistory: string[],
    contactInfo: any
  ): Promise<{
    score: number;
    status: string;
    reasons: string[];
    nextSteps: string[];
  }> {
    try {
      const config = await this.getActiveConfig();
      
      const context = conversationHistory.join('\n');

      const prompt = `Analiza esta conversación y califica este lead según su potencial de conversión:

Información del contacto:
${JSON.stringify(contactInfo, null, 2)}

Conversación:
${context}

Proporciona un análisis en formato JSON:
{
  "score": <número 0-100>,
  "status": "NEW|CONTACTED|QUALIFIED|PROPOSAL|WON|LOST",
  "reasons": ["razón 1", "razón 2", ...],
  "nextSteps": ["acción 1", "acción 2", ...]
}

Criterios de evaluación:
- Score 80-100: Lead muy caliente, listo para cerrar
- Score 60-79: Lead calificado, interesado
- Score 40-59: Lead tibio, necesita seguimiento
- Score 0-39: Lead frío, baja prioridad`;

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Error qualifying lead:', error);
      return {
        score: 50,
        status: 'CONTACTED',
        reasons: ['Error al analizar'],
        nextSteps: ['Revisar manualmente'],
      };
    }
  }

  /**
   * Analiza el sentimiento de un mensaje
   */
  async analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un analizador de sentimientos. Responde solo con: positive, neutral, o negative',
          },
          {
            role: 'user',
            content: `Analiza el sentimiento de este mensaje: "${message}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const sentiment = response.choices[0].message.content?.toLowerCase().trim();
      if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
        return sentiment;
      }
      return 'neutral';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral';
    }
  }

  /**
   * Obtiene la configuración de IA activa
   */
  private async getActiveConfig() {
    const config = await prisma.aIConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      // Configuración por defecto
      return {
        model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
        systemPrompt:
          'Eres un asistente de ventas profesional y amigable. Tu objetivo es ayudar a calificar leads y cerrar ventas de manera efectiva.',
        temperature: 0.7,
        maxTokens: 1000,
      };
    }

    return config;
  }

  /**
   * Genera un resumen de múltiples conversaciones
   */
  async summarizeConversations(conversations: any[]): Promise<string> {
    try {
      const config = await this.getActiveConfig();
      
      const conversationsText = conversations
        .map((conv, index) => {
          const messages = conv.messages?.slice(0, 5).map((m: any) => m.content).join('\n') || '';
          return `Conversación ${index + 1} (${conv.contact?.name || 'Sin nombre'}):\n${messages}`;
        })
        .join('\n\n');

      const prompt = `Resume estas conversaciones recientes de leads en 3-4 puntos clave:

${conversationsText}

Enfócate en:
- Tendencias comunes
- Leads más prometedores
- Problemas o dudas recurrentes
- Oportunidades de mejora`;

      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: 300,
      });

      return response.choices[0].message.content || 'No se pudo generar el resumen.';
    } catch (error) {
      console.error('Error summarizing conversations:', error);
      return 'Error al generar resumen de conversaciones.';
    }
  }
}

export default new AIService();
