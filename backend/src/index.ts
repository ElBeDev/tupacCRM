import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import conversationsRoutes from './routes/conversations';
import campaignsRoutes from './routes/campaigns';
import ordersRoutes from './routes/orders';
import whatsappRoutes, { initializeWhatsApp } from './routes/whatsapp';
import googleAuthRoutes from './routes/google-auth';
import googleCalendarRoutes from './routes/google-calendar';
import googleSheetsRoutes from './routes/google-sheets';
import googleStatusRoutes from './routes/google-status';
import statsRoutes from './routes/stats';
import aiRoutes from './routes/ai';
import assistantsRoutes from './routes/assistants';
import WhatsAppService from './services/whatsapp.service';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Configuración dinámica de CORS
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  // Agregar dominios adicionales desde CORS_ORIGIN
  if (process.env.CORS_ORIGIN) {
    const corsOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    origins.push(...corsOrigins);
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

// Función para validar origen (soporta wildcards)
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  
  return allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  },
});

// Middleware CORS para Express
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TupacCRM API',
    version: '1.0.0',
    status: 'running'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/google', googleAuthRoutes);
app.use('/api/google/status', googleStatusRoutes);
app.use('/api/google/calendar', googleCalendarRoutes);
app.use('/api/google/sheets', googleSheetsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assistants', assistantsRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize WhatsApp Service
const whatsappService = new WhatsAppService(io);
initializeWhatsApp(whatsappService);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`📱 WhatsApp service initialized`);
  console.log(`🌐 Allowed CORS origins:`, allowedOrigins);
});

export { app, io };
