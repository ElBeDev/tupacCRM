import { Router, Request } from 'express';
import { authenticate } from '../middleware/auth';
import WhatsAppService from '../services/whatsapp.service';

const router = Router();
let whatsappService: WhatsAppService | null = null;

export const initializeWhatsApp = (service: WhatsAppService) => {
  whatsappService = service;
};

// Get WhatsApp status
router.get('/status', authenticate, async (req: Request, res) => {
  try {
    if (!whatsappService) {
      return res.json({ connected: false, qrCode: null });
    }

    res.json({
      connected: whatsappService.isActive(),
      qrCode: whatsappService.getQRCode(),
    });
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get QR Code with image URL (using external service)
router.get('/qr', authenticate, async (req: Request, res) => {
  try {
    if (!whatsappService) {
      return res.status(503).json({ error: 'WhatsApp service not initialized' });
    }

    const qrCode = whatsappService.getQRCode();
    
    if (!qrCode) {
      const isConnected = whatsappService.isActive();
      if (isConnected) {
        return res.json({ 
          connected: true, 
          message: 'Already connected, no QR needed' 
        });
      }
      return res.json({ 
        connected: false, 
        qrCode: null, 
        message: 'QR not available yet. Try connecting first.' 
      });
    }

    // Use external QR API (faster and doesn't require extra dependency)
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;

    res.json({
      connected: false,
      qrCode: qrCode,
      qrImage: qrImageUrl,
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    res.status(500).json({ error: 'Failed to get QR code' });
  }
});

// Connect WhatsApp
router.post('/connect', authenticate, async (req: Request, res) => {
  try {
    if (!whatsappService) {
      return res.status(500).json({ error: 'WhatsApp service not initialized' });
    }

    if (whatsappService.isActive()) {
      return res.json({ message: 'Already connected', connected: true });
    }

    // Initialize WhatsApp - this will trigger QR code generation
    await whatsappService.initialize();
    
    res.json({ message: 'Connecting... Check for QR code', connected: false });
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disconnect WhatsApp
router.post('/disconnect', authenticate, async (req: Request, res) => {
  try {
    if (!whatsappService) {
      return res.status(500).json({ error: 'WhatsApp service not initialized' });
    }

    await whatsappService.disconnect();
    res.json({ message: 'Disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/send', authenticate, async (req: Request, res) => {
  try {
    const { to, message, conversationId } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    if (!whatsappService) {
      return res.status(500).json({ error: 'WhatsApp service not initialized' });
    }

    if (!whatsappService.isActive()) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const result = await whatsappService.sendMessage(to, message, conversationId);
    res.json({ message: 'Message sent successfully', ...result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
