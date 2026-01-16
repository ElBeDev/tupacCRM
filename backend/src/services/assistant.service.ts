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
  top_p?: number;
  tools?: any[];
  fileIds?: string[];
  isWhatsAppResponder?: boolean;
  delegatesTo?: string[]; // IDs de asistentes a los que puede delegar
  specialty?: string; // Especialidad: 'erp', 'precios', 'stock', 'pedidos', 'reclamos', 'general'
}

export class AssistantService {
  async createAssistant(userId: string, data: CreateAssistantDTO) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    try {
      // Crear el asistente en OpenAI con todas las configuraciones
      const openaiAssistant = await openai.beta.assistants.create({
        name: data.name,
        description: data.description || undefined,
        instructions: data.instructions,
        model: data.model || 'gpt-4-turbo-preview',
        temperature: data.temperature ?? 0.7,
        top_p: data.top_p ?? 1,
        tools: (data.tools || []) as any,
      });

      console.log('✅ OpenAI Assistant created:', openaiAssistant.id, {
        name: openaiAssistant.name,
        model: openaiAssistant.model,
        temperature: openaiAssistant.temperature,
        instructions: openaiAssistant.instructions?.substring(0, 100) + '...'
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
          isWhatsAppResponder: data.isWhatsAppResponder || false,
          delegatesTo: data.delegatesTo || [],
          specialty: data.specialty || 'general',
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
    
    // Actualizar en OpenAI con todas las configuraciones
    if (assistant.openaiId) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.instructions !== undefined) updateData.instructions = data.instructions;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.temperature !== undefined) updateData.temperature = data.temperature;
      if (data.top_p !== undefined) updateData.top_p = data.top_p;
      if (data.tools !== undefined) updateData.tools = data.tools as any;

      await openai.beta.assistants.update(assistant.openaiId, updateData);
      
      console.log('✅ OpenAI Assistant updated:', assistant.openaiId, updateData);
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
        isWhatsAppResponder: data.isWhatsAppResponder,
        delegatesTo: data.delegatesTo,
        specialty: data.specialty,
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

  /**
   * Generate a response using the assistant (for WhatsApp auto-reply)
   * Now with multi-agent support - consults specialized agents when needed
   * Also supports Vision for image analysis
   */
  async generateResponse(
    assistantId: string, 
    message: string, 
    intent?: string,
    context?: { contactId?: string; conversationId?: string }
  ): Promise<string | null> {
    if (!openai) {
      console.warn('OpenAI API key not configured');
      return null;
    }

    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
    });

    if (!assistant || !assistant.openaiId) {
      console.warn('Assistant not found or no OpenAI ID');
      return null;
    }

    try {
      // ========================================
      // 📷 CHECK FOR IMAGES - Use Vision API
      // ========================================
      let hasImages = false;
      let parsedMessage: { text?: string; images?: string[] } | null = null;
      
      try {
        parsedMessage = JSON.parse(message);
        if (parsedMessage?.images && Array.isArray(parsedMessage.images) && parsedMessage.images.length > 0) {
          hasImages = true;
          console.log(`📷 Message contains ${parsedMessage.images.length} image(s), using Vision API`);
        }
      } catch {
        // Not JSON, regular text message
      }

      // ========================================
      // 🤖 MULTI-AGENT: Consultar especialistas según intención
      // ========================================
      let enrichedContext = '';
      const textMessage = hasImages ? (parsedMessage?.text || 'El cliente envió una imagen') : message;
      
      if (intent) {
        const specialistResponse = await this.consultSpecialist(intent, textMessage, context);
        if (specialistResponse) {
          enrichedContext = `\n\n[INFORMACIÓN DEL ESPECIALISTA]:\n${specialistResponse}\n\n[Usá esta información para responder al cliente de forma natural, sin mencionar que consultaste a otro asistente]`;
        }
      }

      // ========================================
      // 📷 VISION MODE: Use Chat Completions for images
      // ========================================
      if (hasImages && parsedMessage?.images) {
        console.log('📷 Processing with Vision API...');
        
        const content: any[] = [];
        
        // Add text
        const textContent = enrichedContext 
          ? `${parsedMessage.text || 'Describe esta imagen'}${enrichedContext}`
          : (parsedMessage.text || 'Describe esta imagen y responde según el contexto del negocio');
        
        content.push({ type: 'text', text: textContent });
        
        // Add images
        for (const imageData of parsedMessage.images) {
          content.push({
            type: 'image_url',
            image_url: {
              url: imageData,
              detail: 'high'
            }
          });
        }

        const visionResponse = await openai.chat.completions.create({
          model: 'gpt-4o', // Vision requires gpt-4o or gpt-4-turbo
          messages: [
            { role: 'system', content: assistant.instructions },
            { role: 'user', content }
          ],
          temperature: assistant.temperature || 0.7,
          max_tokens: 1000,
        });

        const responseText = visionResponse.choices[0].message.content;
        console.log('✅ Vision response generated');
        return responseText;
      }

      // ========================================
      // 💬 STANDARD MODE: Use Threads API for text
      // ========================================
      // Create a new thread for this conversation
      const thread = await openai.beta.threads.create();

      // Add the user message with enriched context if available
      const finalMessage = enrichedContext 
        ? `${message}${enrichedContext}`
        : message;

      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: finalMessage,
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.openaiId,
      });

      // Wait for completion (with timeout)
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          console.error('Assistant run failed:', runStatus.status);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        attempts++;
      }

      if (runStatus.status !== 'completed') {
        console.error('Assistant run timed out');
        return null;
      }

      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(m => m.role === 'assistant');

      if (assistantMessage && assistantMessage.content[0].type === 'text') {
        return assistantMessage.content[0].text.value;
      }

      return null;
    } catch (error) {
      console.error('Error generating response:', error);
      return null;
    }
  }

  /**
   * Consulta el ERP para obtener información de productos
   * Extrae nombres de productos del mensaje y busca en el ERP
   */
  private async queryERPForProducts(message: string): Promise<string | null> {
    try {
      const erpService = (await import('./erp.service')).default;
      
      // Extraer posibles nombres de productos del mensaje usando IA
      const extractResponse = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Eres un extractor de términos de búsqueda de productos. 
Tu trabajo es identificar QUÉ PRODUCTO está preguntando el cliente.

REGLAS:
1. Extrae la palabra clave del producto (singular, sin artículos)
2. Si menciona una marca o nombre popular, usa ese término
3. Incluye términos parciales o coloquiales
4. Responde SOLO con el término de búsqueda, nada más

EJEMPLOS:
"tienes coca?" -> coca
"tienes cocas?" -> coca
"hay pepsi?" -> pepsi
"quiero cerveza" -> cerveza
"me das un agua?" -> agua
"tienen fanta?" -> fanta
"hola" -> ninguno
"cuánto cuesta?" -> ninguno` 
          },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
        max_tokens: 50,
      });

      const productNames = extractResponse.choices[0].message.content?.trim().toLowerCase();
      
      console.log(`🔍 Extracción de productos: "${message}" -> "${productNames}"`);
      
      if (!productNames || productNames === 'ninguno' || productNames === 'ninguno.' || productNames.length === 0) {
        console.log('📋 No se detectaron nombres de productos específicos');
        return null;
      }

      console.log(`✅ Productos confirmados para búsqueda: ${productNames}`);
      
      // Buscar en el ERP (usar el primer término de búsqueda)
      const searchTerm = productNames.split(',')[0].trim();
      const products = await erpService.searchProductsByName(searchTerm);
      
      if (products.length === 0) {
        console.log('❌ No se encontraron productos en el ERP');
        return null;
      }

      console.log(`✅ Encontrados ${products.length} productos en el ERP`);
      
      // Formatear la información de los productos
      const formattedProducts = products.slice(0, 5).map((p) => erpService.formatProductInfo(p)).join('\n\n---\n\n');
      
      return formattedProducts;
    } catch (error) {
      console.error('❌ Error consultando ERP:', error);
      return null;
    }
  }

  /**
   * Consultar a un asistente especializado según la intención detectada
   * Ahora usa el campo delegatesTo para saber a qué asistentes puede consultar
   * Si es un pedido válido, lo crea automáticamente en el sistema
   * Los especialistas de Precios/Stock consultan el ERP real
   */
  async consultSpecialist(intent: string, message: string, context?: { contactId?: string; conversationId?: string }): Promise<string | null> {
    if (!openai) return null;

    // Mapear intención a especialidad del asistente
    const intentToSpecialty: Record<string, string> = {
      'consulta_precio': 'precios',
      'consulta_stock': 'stock',
      'pedido': 'pedidos',
      'pedido_incompleto': 'pedidos',
      'confirmacion': 'pedidos',
      'reclamo': 'reclamos',
    };

    const targetSpecialty = intentToSpecialty[intent];
    if (!targetSpecialty) {
      console.log(`🔍 No specialist needed for intent: ${intent}`);
      return null;
    }

    // Buscar el asistente especializado por su specialty
    const specialist = await prisma.assistant.findFirst({
      where: { 
        specialty: targetSpecialty,
        isActive: true
      },
    });

    if (!specialist) {
      console.warn(`⚠️ No specialist found with specialty: ${targetSpecialty}`);
      return null;
    }

    console.log(`🔗 Consulting specialist: ${specialist.name} (${specialist.specialty}) for intent: ${intent}`);

    try {
      // ========================================
      // 📊 CONSULTAR ERP SI ES PRECIO O STOCK
      // ========================================
      let erpData = '';
      
      if (specialist.specialty === 'precios' || specialist.specialty === 'stock' || specialist.specialty === 'erp') {
        const erpProducts = await this.queryERPForProducts(message);
        if (erpProducts) {
          erpData = `\n\n[DATOS DEL ERP]:\n${erpProducts}\n[FIN DATOS ERP]\n\nUsa esta información REAL del sistema para responder al cliente. Si no encontraste el producto exacto, sugiere alternativas similares de la lista.`;
        } else {
          erpData = '\n\n[NOTA]: No se encontraron productos en el ERP con ese nombre. Informa al cliente que no tenemos ese producto disponible actualmente.';
        }
      }

      // Usar Chat Completions para consulta rápida (sin threads)
      const response = await openai.chat.completions.create({
        model: specialist.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: specialist.instructions },
          { role: 'user', content: `El cliente escribió: "${message}"${erpData}\n\nProporciona la información relevante para ayudar a responderle.` }
        ],
        temperature: specialist.temperature || 0.3,
        max_tokens: 800,
        response_format: specialist.specialty === 'pedidos' ? { type: 'json_object' } : undefined,
      });

      const specialistResponse = response.choices[0].message.content;
      console.log(`✅ Specialist response: ${specialistResponse?.substring(0, 200)}...`);

      // Si es el Gestor de Pedidos, intentar crear el pedido si es válido
      if (specialist.specialty === 'pedidos' && specialistResponse && context?.contactId && context?.conversationId) {
        try {
          const orderData = JSON.parse(specialistResponse);
          
          if (orderData.pedido_valido && orderData.productos && orderData.productos.length > 0) {
            console.log('📦 Creating order from valid order data...');
            
            const orderService = (await import('./order.service')).default;
            
            const order = await orderService.createFromConversation({
              contactId: context.contactId,
              conversationId: context.conversationId,
              items: orderData.productos.map((p: any) => ({
                productName: p.nombre,
                quantity: p.cantidad || 1,
                notes: p.notas,
              })),
              notes: `Pedido por WhatsApp: ${orderData.resumen}`,
            });

            console.log(`✅ Order created: ${order.orderNumber}`);
            
            // Retornar info del pedido creado para que el asistente principal lo mencione
            return `PEDIDO CREADO: Número de orden ${order.orderNumber}. Productos: ${orderData.productos.map((p: any) => `${p.cantidad}x ${p.nombre}`).join(', ')}. El cliente debe ser informado que su pedido fue registrado y será preparado.`;
          } else if (!orderData.pedido_valido && orderData.faltantes && orderData.faltantes.length > 0) {
            return `PEDIDO INCOMPLETO: Faltan datos para: ${orderData.faltantes.join(', ')}. Pedí al cliente que complete la información.`;
          }
        } catch (parseError) {
          console.warn('Could not parse order data:', parseError);
        }
      }
      
      // Si es el Gestor de Reclamos, crear un ticket automáticamente
      if (specialist.specialty === 'reclamos' && context?.contactId) {
        try {
          const { ticketService } = await import('./ticket.service');
          
          // Crear ticket para este reclamo
          const ticket = await ticketService.createFromConversation({
            contactId: context.contactId,
            conversationId: context.conversationId,
            type: 'COMPLAINT',
            subject: `Reclamo: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
            description: message,
            priority: 'MEDIUM',
          });

          console.log(`📋 Ticket created: ${ticket.ticketNumber}`);
          
          // Agregar info del ticket a la respuesta
          return `${specialistResponse}\n\n[TICKET CREADO: ${ticket.ticketNumber}]`;
        } catch (ticketError) {
          console.warn('Could not create ticket:', ticketError);
        }
      }
      
      return specialistResponse;
    } catch (error) {
      console.error(`❌ Error consulting specialist ${specialist.name}:`, error);
      return null;
    }
  }

  async testAssistant(assistantId: string, userId: string, message: string) {
    if (!openai) throw new Error('OpenAI API key not configured');
    
    // Buscar asistente solo por ID - cualquier usuario autenticado puede probar
    let assistant = await prisma.assistant.findFirst({
      where: { id: assistantId },
    });
    
    if (!assistant) {
      throw new Error('Assistant not found');
    }
    
    // Si no tiene openaiId, crearlo en OpenAI automáticamente
    if (!assistant.openaiId) {
      console.log(`[Test] Creating OpenAI assistant for: ${assistant.name}`);
      const openaiAssistant = await openai.beta.assistants.create({
        name: assistant.name,
        instructions: assistant.instructions,
        model: assistant.model,
        temperature: assistant.temperature,
      });
      
      assistant = await prisma.assistant.update({
        where: { id: assistantId },
        data: { openaiId: openaiAssistant.id },
      });
      console.log(`[Test] OpenAI assistant created: ${openaiAssistant.id}`);
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
        temperature: assistant.temperature || 0.7,
        max_tokens: 4096,
      });

      const responseText = visionResponse.choices[0].message.content || 'Sin respuesta';

      await prisma.assistantTestMessage.create({
        data: { assistantId, role: 'assistant', content: responseText },
      });

      return { response: responseText };
    }

    // NUEVO: Si es el asistente principal (isWhatsAppResponder), usar el sistema multi-agente completo
    if (assistant.isWhatsAppResponder) {
      console.log(`[Test] Using multi-agent system for: ${assistant.name}`);
      
      try {
        // Crear una conversación temporal para la prueba
        let testContact = await prisma.contact.findFirst({
          where: { 
            phone: 'TEST_ASSISTANT'
          }
        });

        if (!testContact) {
          testContact = await prisma.contact.create({
            data: {
              name: 'Testing Assistant',
              phone: 'TEST_ASSISTANT',
              source: 'MANUAL',
            }
          });
        }

        let testConversation = await prisma.conversation.findFirst({
          where: {
            contactId: testContact.id,
            channel: 'WEB'
          },
          include: {
            messages: {
              orderBy: { sentAt: 'desc' },
              take: 10
            }
          }
        });

        if (!testConversation) {
          testConversation = await prisma.conversation.create({
            data: {
              contactId: testContact.id,
              channel: 'WEB',
              messages: {
                create: []
              }
            },
            include: {
              messages: {
                orderBy: { sentAt: 'desc' },
                take: 10
              }
            }
          });
        }

        // Detectar intención del mensaje con historial de conversación
        console.log('[Test] Detecting intent...');
        const smartTagService = (await import('./smart-tag.service')).default;
        
        // Obtener historial de conversación para contexto
        const conversationHistory = testConversation.messages.reverse().map(msg => ({
          role: msg.senderType === 'CONTACT' ? 'user' : 'assistant',
          content: msg.content
        }));
        
        const intentResult = await smartTagService.detectIntent(message, conversationHistory);
        const intent = intentResult?.intencion || undefined;
        console.log(`[Test] Intent detected: ${intent || 'none'}`);

        // Usar el sistema multi-agente completo con detección de intención
        const response = await this.generateResponse(
          assistant.id,
          message,
          intent,
          {
            contactId: testContact.id,
            conversationId: testConversation.id
          }
        );

        // Guardar la respuesta
        await prisma.assistantTestMessage.create({
          data: { assistantId, role: 'assistant', content: response || 'Sin respuesta' },
        });

        return { response: response || 'Sin respuesta' };
      } catch (error: any) {
        console.error('[Test] Multi-agent error:', error);
        // Si falla, caer al método simple
        console.log('[Test] Falling back to simple assistant method');
      }
    }

    // Sin imágenes, usar Assistants API normal (para especialistas o fallback)
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Crear run con temperature override si está definido en el asistente
    const runOptions: any = {
      assistant_id: assistant.openaiId,
    };
    
    // El run puede hacer override del temperature configurado en el asistente
    if (assistant.temperature !== null && assistant.temperature !== undefined) {
      runOptions.temperature = assistant.temperature;
    }

    const run = await openai.beta.threads.runs.create(thread.id, runOptions);

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
    // Cualquier usuario autenticado puede ver mensajes de prueba
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    return await prisma.assistantTestMessage.findMany({
      where: { assistantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async clearTestMessages(assistantId: string, userId: string) {
    // Cualquier usuario autenticado puede limpiar mensajes de prueba
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId },
    });
    
    if (!assistant) throw new Error('Assistant not found');
    
    await prisma.assistantTestMessage.deleteMany({
      where: { assistantId },
    });
    
    return { success: true };
  }

  // Sincronizar asistente local con OpenAI (obtener config actual de OpenAI)
  async syncAssistant(id: string, userId: string) {
    // Cualquier usuario autenticado puede sincronizar
    const assistant = await prisma.assistant.findFirst({
      where: { id },
    });

    if (!assistant) throw new Error('Assistant not found');
    if (!assistant.openaiId) throw new Error('Assistant not synced with OpenAI');

    try {
      // Obtener el asistente desde OpenAI
      const openaiAssistant = await openai.beta.assistants.retrieve(assistant.openaiId);
      
      console.log('[Sync] OpenAI Assistant config:', {
        id: openaiAssistant.id,
        name: openaiAssistant.name,
        model: openaiAssistant.model,
        temperature: openaiAssistant.temperature,
        instructions: openaiAssistant.instructions?.substring(0, 100) + '...',
      });

      // Verificar si hay diferencias
      const differences: string[] = [];
      
      if (openaiAssistant.name !== assistant.name) {
        differences.push(`name: DB="${assistant.name}" vs OpenAI="${openaiAssistant.name}"`);
      }
      if (openaiAssistant.model !== assistant.model) {
        differences.push(`model: DB="${assistant.model}" vs OpenAI="${openaiAssistant.model}"`);
      }
      if (openaiAssistant.instructions !== assistant.instructions) {
        differences.push(`instructions: different`);
      }
      if (openaiAssistant.temperature !== assistant.temperature) {
        differences.push(`temperature: DB=${assistant.temperature} vs OpenAI=${openaiAssistant.temperature}`);
      }

      // Si hay diferencias, actualizar OpenAI con los valores de la DB
      if (differences.length > 0) {
        console.log('[Sync] Differences found, updating OpenAI:', differences);
        
        const updateParams: any = {
          name: assistant.name,
          description: assistant.description || '',
          instructions: assistant.instructions,
          model: assistant.model,
        };

        if (assistant.temperature !== null && assistant.temperature !== undefined) {
          updateParams.temperature = assistant.temperature;
        }

        await openai.beta.assistants.update(assistant.openaiId, updateParams);
        console.log('[Sync] OpenAI updated successfully');
      }

      return {
        synced: true,
        differences: differences.length > 0 ? differences : null,
        wasUpdated: differences.length > 0,
        openaiConfig: {
          id: openaiAssistant.id,
          name: openaiAssistant.name,
          model: openaiAssistant.model,
          temperature: openaiAssistant.temperature,
          hasInstructions: !!openaiAssistant.instructions,
        }
      };
    } catch (error: any) {
      console.error('[Sync] Error syncing assistant:', error.message);
      throw new Error(`Failed to sync with OpenAI: ${error.message}`);
    }
  }

  // Obtener config actual del asistente en OpenAI
  async getOpenAIConfig(id: string, userId: string) {
    const assistant = await prisma.assistant.findFirst({
      where: { id, userId },
    });

    if (!assistant) throw new Error('Assistant not found');
    if (!assistant.openaiId) throw new Error('Assistant not synced with OpenAI');

    const openaiAssistant = await openai.beta.assistants.retrieve(assistant.openaiId);
    
    return {
      openaiId: openaiAssistant.id,
      name: openaiAssistant.name,
      description: openaiAssistant.description,
      model: openaiAssistant.model,
      instructions: openaiAssistant.instructions,
      temperature: openaiAssistant.temperature,
      top_p: openaiAssistant.top_p,
      tools: openaiAssistant.tools,
      created_at: openaiAssistant.created_at,
    };
  }
}

export default new AssistantService();
