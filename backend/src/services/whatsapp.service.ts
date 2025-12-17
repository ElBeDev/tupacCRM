import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  WAMessage,
  proto,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import prisma from '../lib/prisma';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { AIService } from './ai.service';
import { SmartTagService } from './smart-tag.service';

class WhatsAppService {
  private sock: WASocket | null = null;
  private io: Server | null = null;
  private qrCode: string | null = null;
  private isConnected: boolean = false;
  private sessionName: string = 'main';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isInitializing: boolean = false;
  private shouldReconnect: boolean = true;
  private aiService: AIService;
  private smartTagService: SmartTagService;

  constructor(io?: Server) {
    this.io = io || null;
    this.aiService = new AIService();
    this.smartTagService = new SmartTagService();
    // Ensure session directory exists
    const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', this.sessionName);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }
  }

  async initialize() {
    if (this.isInitializing) {
      console.log('⏳ Already initializing, skipping...');
      return;
    }

    if (this.isConnected) {
      console.log('✅ Already connected');
      return;
    }

    try {
      this.isInitializing = true;
      this.reconnectAttempts = 0;
      console.log('🔄 Initializing WhatsApp connection...');

      const sessionPath = `./whatsapp-sessions/${this.sessionName}`;
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      // Fetch latest Baileys version
      const { version } = await fetchLatestBaileysVersion();
      console.log(`📱 Using WA v${version.join('.')}`);

      this.sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: 'silent' }),
        browser: ['TupacCRM', 'Chrome', '1.0.0'],
        printQRInTerminal: false, // We handle QR ourselves
        markOnlineOnConnect: false,
      });

      // Handle connection updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          console.log('📱 QR Code generated');
          
          // Emit QR code to frontend
          if (this.io) {
            this.io.emit('whatsapp:qr', { qr });
          }

          // Save to database
          await prisma.whatsAppSession.upsert({
            where: { sessionName: this.sessionName },
            update: { qrCode: qr, updatedAt: new Date() },
            create: { sessionName: this.sessionName, qrCode: qr },
          });
        }

        if (connection === 'close') {
          this.isConnected = false;
          this.isInitializing = false;
          
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log('❌ Connection closed');
          console.log('📊 Status code:', statusCode);
          console.log('🔄 Should reconnect:', shouldReconnect);

          await prisma.whatsAppSession.upsert({
            where: { sessionName: this.sessionName },
            update: { isActive: false, lastSeen: new Date() },
            create: { 
              sessionName: this.sessionName, 
              isActive: false, 
              lastSeen: new Date() 
            },
          });

          if (this.io) {
            this.io.emit('whatsapp:disconnected', { reason: statusCode });
          }

          // Handle reconnection logic
          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(5000 * this.reconnectAttempts, 30000); // Max 30s delay
            console.log(`🔄 Reconnecting in ${delay/1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.initialize();
            }, delay);
          } else if (statusCode === DisconnectReason.loggedOut) {
            console.log('❌ Logged out. Please delete session and scan QR again.');
            this.reconnectAttempts = 0;
            this.qrCode = null;
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Max reconnect attempts reached. Please try connecting again manually.');
            this.reconnectAttempts = 0;
            if (this.io) {
              this.io.emit('whatsapp:max-retry', { message: 'Max retry attempts reached' });
            }
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp connected successfully!');
          this.isConnected = true;
          this.qrCode = null;
          this.reconnectAttempts = 0;
          this.isInitializing = false;

          const phoneNumber = this.sock?.user?.id?.split(':')[0];

          await prisma.whatsAppSession.upsert({
            where: { sessionName: this.sessionName },
            update: {
              isActive: true,
              phoneNumber,
              qrCode: null,
              lastSeen: new Date(),
            },
            create: {
              sessionName: this.sessionName,
              isActive: true,
              phoneNumber,
              qrCode: null,
              lastSeen: new Date(),
            },
          });

          if (this.io) {
            this.io.emit('whatsapp:connected', { phoneNumber });
          }
        }
      });

      // Save credentials when updated
      this.sock.ev.on('creds.update', saveCreds);

      // Handle incoming messages
      this.sock.ev.on('messages.upsert', async (m) => {
        await this.handleIncomingMessages(m.messages);
      });

    } catch (error) {
      console.error('❌ Error initializing WhatsApp:', error);
      this.isInitializing = false;
      this.isConnected = false;
      
      // Emit error to frontend
      if (this.io) {
        this.io.emit('whatsapp:error', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      // Retry logic with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(5000 * this.reconnectAttempts, 30000);
        console.log(`🔄 Retrying in ${delay/1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.initialize();
        }, delay);
      } else {
        console.log('❌ Max retry attempts reached. Please try again manually.');
        this.reconnectAttempts = 0;
      }
    }
  }

  private async handleIncomingMessages(messages: WAMessage[]) {
    for (const message of messages) {
      try {
        if (!message.message || message.key.fromMe) continue;

        const from = message.key.remoteJid || '';
        const phoneNumber = from.split('@')[0];
        const messageContent = this.extractMessageContent(message.message);

        // Log full JID for debugging
        console.log(`📩 Message from ${phoneNumber} (JID: ${from}): ${messageContent}`);
        console.log(`📋 Participant: ${message.key.participant || 'N/A'}, pushName: ${message.pushName || 'N/A'}`);

        // Find or create contact
        let contact = await prisma.contact.findUnique({ where: { phone: phoneNumber } });
        
        if (!contact) {
          // Get first admin/manager to auto-assign
          const assignUser = await prisma.user.findFirst({
            where: {
              isActive: true,
              role: { in: ['ADMIN', 'MANAGER'] }
            },
            orderBy: { createdAt: 'asc' }
          });

          contact = await prisma.contact.create({
            data: {
              name: message.pushName || phoneNumber,
              phone: phoneNumber,
              whatsappJid: from, // Save full JID for replies
              source: 'WHATSAPP',
              status: 'NEW',
              assignedToId: assignUser?.id, // Auto-assign to first admin/manager
            },
          });
          
          console.log(`👤 New contact auto-assigned to user: ${assignUser?.email || 'none'}, JID: ${from}`);
        } else if (!contact.whatsappJid) {
          // Update existing contact with JID if missing
          await prisma.contact.update({
            where: { id: contact.id },
            data: { whatsappJid: from }
          });
          contact.whatsappJid = from;
          console.log(`📝 Updated contact ${contact.name} with JID: ${from}`);
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            contactId: contact.id,
            channel: 'WHATSAPP',
            status: { in: ['OPEN', 'PENDING'] },
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              contactId: contact.id,
              channel: 'WHATSAPP',
              status: 'OPEN',
            },
          });
        }

        // Save message
        const savedMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderType: 'CONTACT',
            content: messageContent,
            messageType: 'TEXT',
            metadata: {
              waMessageId: message.key.id,
              timestamp: typeof message.messageTimestamp === 'number' ? message.messageTimestamp : Number(message.messageTimestamp),
            },
          },
        });

        // Update conversation last message time
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });

        console.log(`✅ Message saved to conversation ${conversation.id}`);

        // ========================================
        // 🤖 AI INTEGRATION - Auto-analyze message
        // ========================================
        try {
          // Get last 10 messages for context
          const recentMessages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { sentAt: 'desc' },
            take: 10,
          });

          const messageTexts = recentMessages.reverse().map((m: any) => m.content);

          console.log('🤖 Analyzing conversation with AI...');
          const aiAnalysis = await this.aiService.analyzeConversation(
            messageTexts,
            {
              name: contact.name,
              phone: contact.phone,
              currentStatus: contact.status,
              currentScore: contact.score,
            }
          );

          console.log('🎯 AI Analysis:', {
            sentiment: aiAnalysis.sentiment,
            intent: aiAnalysis.intent,
            score: aiAnalysis.suggestedScore,
            status: aiAnalysis.suggestedStatus,
          });

          // Update contact with AI insights
          const updatedContact = await prisma.contact.update({
            where: { id: contact.id },
            data: {
              score: aiAnalysis.suggestedScore,
              status: aiAnalysis.suggestedStatus,
            },
          });

          console.log(`📊 Contact updated: ${contact.name} → ${aiAnalysis.suggestedStatus} (Score: ${aiAnalysis.suggestedScore})`);

          // Emit AI analysis to frontend
          if (this.io) {
            this.io.emit('ai:analysis', {
              conversationId: conversation.id,
              contactId: contact.id,
              analysis: aiAnalysis,
            });
          }

          // ========================================
          // 🏷️ SMART TAGS - Auto-detect intent and apply tags
          // ========================================
          try {
            console.log('🏷️ Detecting intent with Smart Tags...');
            const intentResult = await this.smartTagService.analyzeAndTagConversation(
              conversation.id,
              messageContent
            );

            console.log('🎯 Intent detected:', {
              intencion: intentResult.intent.intencion,
              confianza: intentResult.intent.confianza,
              productos: intentResult.intent.productos_mencionados,
              prioridad: intentResult.intent.prioridad,
              tagsAplicados: intentResult.appliedTags,
            });

            // Emit smart tag update to frontend
            if (this.io) {
              this.io.emit('smarttag:update', {
                conversationId: conversation.id,
                contactId: contact.id,
                intent: intentResult.intent,
                appliedTags: intentResult.appliedTags,
              });
            }
          } catch (smartTagError) {
            console.error('❌ Error in Smart Tag detection:', smartTagError);
            // Continue even if smart tags fail
          }

          // ========================================
          // 🤖 AUTO-RESPUESTA CON ASISTENTE
          // ========================================
          try {
            // Buscar asistente configurado para responder WhatsApp
            const whatsAppAssistant = await prisma.assistant.findFirst({
              where: { 
                isWhatsAppResponder: true,
                isActive: true
              }
            });

            if (whatsAppAssistant && whatsAppAssistant.openaiId) {
              console.log(`🤖 Using assistant "${whatsAppAssistant.name}" for auto-reply`);
              
              // Importar y usar el servicio de asistentes
              const assistantService = (await import('./assistant.service')).default;
              
              // Generar respuesta con el asistente
              const response = await assistantService.generateResponse(
                whatsAppAssistant.id,
                messageContent
              );

              if (response) {
                console.log('🤖 Enviando respuesta automática del asistente...');
                await this.sendMessage(from, response, conversation.id);
                console.log('✅ Respuesta automática enviada:', response.substring(0, 100) + '...');
              }
            } else {
              // Fallback: usar AIConfig si no hay asistente configurado
              const config = await prisma.aIConfig.findFirst({ where: { isActive: true } });
              if (config?.autoReply && aiAnalysis.suggestedResponse) {
                console.log('🤖 Enviando respuesta automática (AIConfig)...');
                await this.sendMessage(from, aiAnalysis.suggestedResponse, conversation.id);
                console.log('✅ Respuesta automática enviada');
              }
            }
          } catch (autoReplyError) {
            console.error('❌ Error en auto-respuesta:', autoReplyError);
          }

        } catch (aiError) {
          console.error('❌ Error in AI analysis:', aiError);
          // Continue even if AI fails
        }

        // Emit to frontend via Socket.IO
        if (this.io) {
          this.io.emit('whatsapp:message', {
            conversationId: conversation.id,
            message: {
              id: savedMessage.id,
              content: messageContent,
              direction: 'inbound',
              sentAt: savedMessage.sentAt?.toISOString() || new Date().toISOString(),
              status: 'received',
            },
          });
        }

      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    }
  }

  private extractMessageContent(message: proto.IMessage): string {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    return '[Media message]';
  }

  async sendMessage(to: string, message: string, conversationId?: string) {
    if (!this.sock || !this.isConnected) {
      throw new Error('WhatsApp not connected');
    }

    try {
      // Try to find the correct JID from contact
      let jid: string;
      
      if (to.includes('@')) {
        // Already a full JID
        jid = to;
      } else {
        // Look up the contact's stored JID
        const contact = await prisma.contact.findUnique({ 
          where: { phone: to },
          select: { whatsappJid: true }
        });
        
        if (contact?.whatsappJid) {
          jid = contact.whatsappJid;
          console.log(`📱 Using stored JID: ${jid}`);
        } else {
          // Fallback to standard format
          jid = `${to}@s.whatsapp.net`;
          console.log(`📱 Using default JID format: ${jid}`);
        }
      }
      
      await this.sock.sendMessage(jid, { text: message });
      console.log(`✅ Message sent to ${jid}`);

      // Guardar mensaje en DB y emitir Socket.IO
      if (conversationId) {
        const savedMessage = await prisma.message.create({
          data: {
            conversationId,
            senderType: 'AGENT',
            content: message,
            messageType: 'TEXT',
            sentAt: new Date(),
          },
        });

        // Actualizar última actividad
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });

        // Emitir a frontend para actualización en tiempo real
        if (this.io) {
          this.io.emit('message:new', {
            conversationId,
            message: savedMessage,
          });
        }

        return { success: true, savedMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getQRCode(): string | null {
    return this.qrCode;
  }

  isActive(): boolean {
    return this.isConnected;
  }

  async disconnect() {
    try {
      this.shouldReconnect = false; // Prevent auto-reconnect
      this.reconnectAttempts = 0;
      
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
      }
      
      this.isConnected = false;
      this.qrCode = null;
      
      // Clean up session files
      const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', this.sessionName);
      if (fs.existsSync(sessionPath)) {
        console.log('🗑️  Cleaning up session files...');
        fs.rmSync(sessionPath, { recursive: true, force: true });
        fs.mkdirSync(sessionPath, { recursive: true });
      }
      
      // Update database
      await prisma.whatsAppSession.upsert({
        where: { sessionName: this.sessionName },
        update: { isActive: false, qrCode: null, phoneNumber: null },
        create: { sessionName: this.sessionName, isActive: false },
      });
      
      console.log('✅ WhatsApp disconnected and session cleared');
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  }
}

export default WhatsAppService;
