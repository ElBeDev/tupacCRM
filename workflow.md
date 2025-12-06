# TupacCRM - Workflow y Documentación del Proyecto

## 🎯 Objetivo del Proyecto
Crear un CRM completo basado en IA similar a Prometheo, pero open-source y auto-hospedado, sin necesidad de pagar suscripciones mensuales.

## 📋 Características Principales a Implementar

### 1. **Gestión Multicanal**
- [ ] **Integración con WhatsApp (QR Code)**
  - Escaneo de QR para conectar WhatsApp personal/business
  - Implementación con Baileys o WWebJS (alternativas a puppeteer)
  - Mantener sesión activa y reconexión automática
  - Sin necesidad de API oficial (evitamos costos y verificación)
- [ ] Integración con Instagram Direct Messages *(Próximamente)*
- [ ] Integración con Facebook Messenger *(Próximamente)*
- [ ] Integración con TikTok mensajería *(Próximamente)*
- [ ] Panel unificado para gestionar todas las conversaciones

### 2. **Inteligencia Artificial**
- [x] **Pre-calificación automática de leads**
  - [x] Análisis de conversaciones en tiempo real
  - [x] Clasificación automática por nivel de interés
  - [x] Scoring de leads (0-100)
  - [x] Sistema de análisis de sentimiento e intención

- [x] **Agente de Ventas IA**
  - [x] Respuestas automáticas inteligentes con OpenAI
  - [x] Generación de respuestas contextuales
  - [x] Análisis de urgencia y recomendaciones de estado
  - [x] Servicio de IA con múltiples métodos (analyzeConversation, generateResponse, qualifyLead, analyzeSentiment)

- [ ] **Seguimientos Inteligentes**
  - [ ] Recordatorios automáticos
  - [ ] Seguimiento basado en comportamiento del lead
  - [ ] Reactivación automática de leads fríos

- [ ] **Cierre de Ventas Automatizado**
  - [ ] Detección de intención de compra
  - [ ] Proceso de cierre guiado por IA
  - [ ] Agendamiento automático de reuniones
  - [ ] Coordinación de visitas

### 3. **Base de Datos y CRM**
- [ ] **Base de datos dinámica**
  - Extracción automática de información de conversaciones
  - Enriquecimiento de datos en tiempo real
  - Campos personalizables
  - Historial completo de interacciones

- [ ] **Gestión de Contactos**
  - Perfiles de clientes completos
  - Segmentación avanzada
  - Tags y categorías
  - Notas y comentarios

- [ ] **Pipeline de Ventas**
  - Etapas personalizables
  - Drag & drop para mover leads
  - Vista de embudo (funnel)
  - Métricas y conversión por etapa

### 4. **Campañas y Marketing**
- [ ] **Campañas Masivas**
  - Envíos masivos por WhatsApp
  - Personalización de mensajes
  - Programación de envíos
  - Segmentación de audiencias

- [ ] **Automatizaciones**
  - Flujos de trabajo automatizados
  - Triggers basados en eventos
  - Respuestas automáticas
  - Webhooks

### 5. **Integraciones**
- [ ] **E-commerce**
  - WooCommerce
  - Shopify
  - Tienda Nube
  - Mercado Libre

- [ ] **Productividad**
  - **Google OAuth** (Login con Google + permisos)
  - Google Sheets (lectura/escritura)
  - Google Calendar (agendamiento)
  - Excel/CSV import/export

- [ ] **Publicidad** *(Próximamente)*
  - Meta Ads (Facebook/Instagram)
  - Google Ads
  - Tracking de conversiones
- [ ] **Publicidad**
  - Meta Ads (Facebook/Instagram)
  - Google Ads
  - Tracking de conversiones

### 6. **Analytics y Reportes**
- [ ] Dashboard de métricas
- [ ] Reportes de conversión
- [ ] Análisis de rendimiento de agentes
- [ ] ROI de campañas
- [ ] Tiempo de respuesta promedio
- [ ] Tasa de cierre

### 7. **Administración**
- [ ] **Sistema de Usuarios**
  - Roles y permisos
  - Múltiples usuarios ilimitados
  - Asignación de leads
  - Tracking de actividad

- [ ] **Configuración**
  - Personalización del agente IA
  - Prompt engineering
  - Templates de mensajes
  - Horarios de atención

## 🏗️ Stack Tecnológico Propuesto
### Backend
- **Framework**: Node.js + Express o NestJS
- **Base de Datos**: PostgreSQL (principal) + Redis (cache/sessions)
- **ORM**: Prisma o TypeORM
- **API**: REST + WebSockets (para chat en tiempo real)
- **WhatsApp**: 
  - **Baileys** (librería WhatsApp Web multi-device) o
  - **WWebJS** (WhatsApp Web.js con puppeteer) o
  - **Venom-bot** (alternativa ligera)
- **IA**: 
  - OpenAI GPT-4 o GPT-3.5 Turbo
  - Alternativa: LLaMA 2/3, Claude, o Mistral (auto-hospedado)
  - LangChain para orquestación
- **Autenticación**: 
  - Passport.js con Google OAuth 2.0
  - JWT para sesiones
- **Colas**: Bull/BullMQ para procesamiento asíncrono
- **Colas**: Bull/BullMQ para procesamiento asíncrono

### Frontend
- **Framework**: React + TypeScript o Next.js
- **UI Library**: Tailwind CSS + shadcn/ui o Material-UI
### Servicios Externos (APIs necesarias)
- **Google OAuth 2.0** (Login + Google Sheets + Calendar)
- **OpenAI API** (o alternativa para IA)
- Instagram Graph API *(Futuro)*
- Facebook Graph API *(Futuro)*
- TikTok Business API *(Futuro)*

### Librerías de WhatsApp (Sin API oficial)
- **Baileys** (recomendado) - Multi-device, más estable
- **WWebJS** (alternativa) - Basado en puppeteer
- **Venom-bot** (alternativa) - Más ligero
- **Monitoreo**: Prometheus + Grafana (opcional)

### Servicios Externos (APIs necesarias)
- WhatsApp Business API (Meta)
- Instagram Graph API
- Facebook Graph API
- TikTok Business API
- OpenAI API (o alternativa)

## 📐 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)                 │
│  - Dashboard                                                 │
│  - Chat Interface                                            │
│  - CRM Management                                            │
│  - Analytics                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API + WebSockets
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   API GATEWAY / BACKEND                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │   CRM        │  │   Campaigns  │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chat       │  │   AI Agent   │  │   Analytics  │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└────────┬─────────────────────┬─────────────────────────────┘
         │                     │
         │                     │
┌────────▼────────┐   ┌───────▼──────────────────────────────┐
│   PostgreSQL    │   │      Redis (Cache/Queue)             │
│   - Users       │   │      - Sessions                       │
│   - Contacts    │   │      - Job Queue                      │
│   - Messages    │   │      - Rate Limiting                  │
│   - Campaigns   │   └──────────────────────────────────────┘
└─────────────────┘
         
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                           │
│  - WhatsApp API                                              │
│  - Instagram API                                             │
│  - Facebook API                                              │
│  - TikTok API                                                │
│  - OpenAI API                                                │
│  - E-commerce platforms                                      │
└─────────────────────────────────────────────────────────────┘
### **Fase 2: WhatsApp Integration (3-4 semanas)**
7. **Integración WhatsApp QR**
   - Implementar Baileys o WWebJS
   - Sistema de escaneo QR en frontend
   - Gestión de sesión y reconexión
   - Manejo de multi-dispositivo
8. Sistema de mensajería en tiempo real (WebSockets)
9. Interface de chat unificada
10. Almacenamiento de mensajes
11. Notificaciones en tiempo realcto (Docker, DB, estructura)
2. Sistema de autenticación y usuarios
3. Base de datos y modelos principales
4. CRUD de contactos
5. Interface básica del CRM
6. Pipeline de ventas simple

### **Fase 2: Chat Multicanal (3-4 semanas)**
7. Integración con WhatsApp Business API
8. Sistema de mensajería en tiempo real (WebSockets)
9. Interface de chat unificada
### **Fase 5: Integraciones Google (2-3 semanas)**
21. **Google OAuth 2.0**
    - Login con Google
    - Gestión de tokens y refresh
22. **Google Calendar**
    - Agendamiento de reuniones
    - Sincronización bidireccional
23. **Google Sheets**
    - Import/Export de contactos
    - Sincronización de datos
    - Webhooks para actualizaciones
24. E-commerce básico (WooCommerce/Shopify) *(opcional)*
14. Agente de IA básico
### **Fase 7: Features Avanzadas (continuo)**
30. Instagram Direct integration
31. Facebook Messenger integration
32. TikTok integración
33. IA mejorada con entrenamiento personalizado
34. Meta Ads tracking *(Próximamente)*
35. Más integraciones según necesidados
18. Triggers y eventos
19. Campañas básicas
20. Templates de mensajes

### **Fase 5: Integraciones Externas (3-4 semanas)**
21. Instagram Direct
22. Facebook Messenger
23. Google Calendar
24. Google Sheets
25. E-commerce (WooCommerce/Shopify)

### **Fase 6: Analytics y Mejoras (2-3 semanas)**
26. Dashboard de métricas
27. Reportes y exportación
28. Optimizaciones de rendimiento
29. Testing exhaustivo

### **Fase 7: Features Avanzadas (continuo)**
30. TikTok integración
31. Meta Ads tracking
32. IA mejorada con entrenamiento personalizado
33. Más integraciones según necesidad

## 📊 Modelos de Datos Principales

### User
```typescript
{
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}
```

### Contact (Lead/Customer)
```typescript
{
  id: string
  name: string
  email?: string
  phone?: string
  source: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'manual'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  score: number // 0-100 lead score
  tags: string[]
  assignedTo?: User
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

### Conversation
```typescript
{
  id: string
  contactId: string
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok'
  status: 'open' | 'pending' | 'closed'
  assignedTo?: User
  lastMessageAt: Date
  createdAt: Date
}
```

### Message
```typescript
{
  id: string
  conversationId: string
  sender: 'contact' | 'agent' | 'ai'
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document'
  metadata?: Record<string, any>
  sentAt: Date
}
```

### Campaign
```typescript
{
  id: string
  name: string
  type: 'broadcast' | 'automated'
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'email'
  status: 'draft' | 'scheduled' | 'running' | 'completed'
  targetSegment: Record<string, any>
  messageTemplate: string
  scheduledAt?: Date
  metrics: {
    sent: number
    delivered: number
    read: number
## 📝 Variables de Entorno Necesarias

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tupaccrm
REDIS_URL=redis://localhost:6379

# JWT & Auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# AI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview

# WhatsApp (QR - No API keys needed!)
# Las sesiones se guardan localmente en ./whatsapp-sessions/

# Instagram (Próximamente)
# INSTAGRAM_APP_ID=
# INSTAGRAM_APP_SECRET=

# Facebook (Próximamente)
# FACEBOOK_APP_ID=
# FACEBOOK_APP_SECRET=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
## 📚 Recursos y Referencias

### WhatsApp (QR Code - Sin API oficial)
- [Baileys - WhatsApp Multi-Device](https://github.com/WhiskeySockets/Baileys)
- [WWebJS - WhatsApp Web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [Venom-bot](https://github.com/orkestral/venom)

### Google
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Sheets API](https://developers.google.com/sheets/api)

### IA y Backend
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Documentation](https://js.langchain.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io](https://socket.io/docs/v4/)

### Futuras Integraciones
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api) *(Próximamente)*
- [Facebook Messenger API](https://developers.facebook.com/docs/messenger-platform) *(Próximamente)*
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=

# Facebook
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ACCESS_TOKEN=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Recursos y Referencias

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Documentation](https://js.langchain.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🎨 Inspiración de UI/UX

- Prometheo CRM (referencia principal)
- Intercom
- HubSpot CRM
- Pipedrive
- Monday.com

## ✅ Próximos Pasos Inmediatos

1. [x] Revisar y aprobar este workflow
2. [x] Definir prioridades específicas
3. [x] Setup inicial del proyecto
4. [x] Crear estructura de carpetas
5. [x] Configurar Docker y base de datos
6. [x] Comenzar con Fase 1: MVP Core CRM

## 🎯 Progreso del Proyecto

### ✅ Completado

#### **Setup Inicial**
- [x] Estructura de carpetas (backend/frontend/shared)
- [x] Docker Compose configurado
- [x] Variables de entorno (.env)
- [x] README y documentación completa
  
#### **Backend (Node.js + TypeScript)**
- [x] Express + TypeScript configurado
- [x] PostgreSQL + Prisma ORM (9 modelos de datos)
- [x] Redis configurado (opcional)
- [x] WebSocket con Socket.io
- [x] **Sistema de Autenticación JWT**
  - Registro e inicio de sesión con email/password
  - Tokens de acceso y refresh
  - Middleware de autenticación y autorización
- [x] **API CRUD de Contactos**
  - Crear, leer, actualizar, eliminar contactos
  - Filtros por estado, fuente, asignación
  - Búsqueda por nombre, email, teléfono
- [x] **Integración WhatsApp con Baileys**
  - Conexión vía QR Code (sin API oficial)
  - Gestión de sesiones persistentes con useMultiFileAuthState
  - Recepción de mensajes en tiempo real
  - Envío de mensajes
  - Auto-creación de contactos desde mensajes
  - Auto-asignación a primer admin/manager
  - WebSocket events para QR y estado
  - Reconexión automática con exponential backoff
  - Persistencia de estado de autenticación

#### **Frontend (Next.js 14 + TypeScript)**
- [x] Next.js 14 con App Router
- [x] Tailwind CSS configurado
- [x] Zustand para manejo de estado
- [x] **Sistema de Autenticación**
  - Páginas de login y registro
  - Almacenamiento de sesión
  - Protección de rutas
  - Interceptores de API para refresh token
- [x] **Dashboard Completo (Mejorado)**
  - Layout con sidebar y header modernos
  - Navegación entre secciones
  - Vista de métricas con gráficos (Recharts)
  - Dashboard con estadísticas en tiempo real
  - Usuario y cierre de sesión
  - Header con búsqueda y notificaciones
  - Sidebar con tema oscuro y animaciones
- [x] **Vista de Contactos**
  - Tabla de contactos con estados
  - Modal para crear contactos
  - Visualización de score y asignación
  - Estados con colores (NEW, QUALIFIED, WON, etc.)
  - Actualización en tiempo real vía Socket.IO
- [x] **Vista de Conversaciones**
  - Lista de conversaciones activas (sin filtro de asignación)
  - Chat interface en tiempo real
  - Envío de mensajes desde el dashboard con persistencia
  - Historial de mensajes
  - UI moderna estilo WhatsApp
  - Socket.IO para mensajes en vivo (event: message:new)
  - Auto-refresh al recibir nuevos mensajes
  - Muestra TODAS las conversaciones automáticamente
- [x] **Vista de Campañas**
  - Gestión de campañas de marketing
  - Estadísticas de campañas (enviados, activos, tasa de respuesta)
  - Filtros por estado
  - CRUD completo de campañas
- [x] **Pipeline de Ventas (Kanban)** ✨
  - Vista Kanban drag & drop con @hello-pangea/dnd
  - 6 columnas (NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST)
  - Drag & drop para cambiar estado de contactos
  - Actualización automática en backend
  - Filtros por score (alto, medio, bajo)
  - Métricas en tiempo real (valor total pipeline)
  - Cards con información completa del contacto
  - Animaciones y transiciones fluidas
- [x] **Vista de Configuración (Settings)**
  - 5 tabs: Perfil, Empresa, Notificaciones, Seguridad, Integraciones
  - Configuración de perfil de usuario
  - Toggles para notificaciones
  - Cambio de contraseña
  - 2FA (preparado)
- [x] **Vista de WhatsApp**
  - Conexión/desconexión
  - Visualización de QR Code
  - Estado de conexión en tiempo real
  - Socket.IO para eventos en vivo
  - UI mejorada con animaciones
- [x] **Vista de Calendar**
  - Grid de 2 columnas
  - Próximos eventos
  - Sincronización con Google Calendar
- [x] **Vista de Sheets**
  - Import/Export de contactos
  - Integración con Google Sheets
- [x] **Vista de Integraciones** ✨
  - Página principal con tarjetas de Google y OpenAI
  - Toggle switches inline para isActive y autoReply
  - Estado de conexión en tiempo real
  - Información de modelo y configuración actual
  - Link a configuración detallada de IA
- [x] **Configuración de IA** ✨ NUEVO
  - Página completa en `/dashboard/integrations/ai`
  - Selector de modelo (GPT-4 Turbo, GPT-4, GPT-3.5 variantes)
  - System prompt personalizable (textarea 8 filas)
  - Slider de temperatura (0-2: Conservador/Balanceado/Creativo)
  - Slider de max tokens (100-4000)
  - Mensaje de fallback configurable
  - Toggle switches para isActive y autoReply
  - Botón de test con POST /api/ai/test
  - Estimaciones de costo por 1K tokens
  - Tarjetas de features disponibles

#### **Integraciones Google (Completo)**
- [x] **Google OAuth 2.0**
  - Login con Google implementado
  - Gestión de tokens (access + refresh)
  - Auto-refresh de tokens expirados
  - Conexión/desconexión de cuenta
  
- [x] **Google Calendar API**
  - Crear eventos desde contactos
  - Listar próximos eventos
  - Actualizar y eliminar eventos
  - Ver eventos por contacto
  - Verificar disponibilidad
  
- [x] **Google Sheets API**
  - Crear spreadsheets
  - Exportar todos los contactos
  - Importar contactos desde Sheet
  - Sincronización bidireccional
  - Detección automática de columnas
  
- [x] **UI de Integraciones**
  - Página de configuración de Google
  - Botón de login con Google
  - Estado de conexión en tiempo real
  - Tarjetas para Calendar y Sheets
  - Callback handler para OAuth

#### **Inteligencia Artificial (OpenAI) - COMPLETO** ✨
- [x] **OpenAI GPT Integration**
  - API configurada con OpenAI SDK
  - Soporte para GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
  - Variables de entorno: OPENAI_API_KEY
  
- [x] **AI Service (backend/src/services/ai.service.ts)**
  - analyzeConversation: Análisis completo con sentimiento, intención, urgencia, score
  - generateResponse: Generación de respuestas contextuales
  - qualifyLead: Calificación automática (0-100)
  - analyzeSentiment: Análisis rápido de sentimiento
  - summarizeConversations: Resúmenes de múltiples conversaciones
  
- [x] **Auto-Respuesta WhatsApp** ✨
  - Análisis automático de cada mensaje entrante
  - Respuesta automática si autoReply está activo
  - Uso correcto de JID format (from con @s.whatsapp.net)
  - Guardado de mensaje en BD con conversationId
  - Emit de evento Socket.IO para UI en tiempo real
  
- [x] **Pipeline Automático** ✨
  - Actualización automática de contact.status según IA
  - Actualización de contact.score basado en análisis
  - Detección de intención de compra → QUALIFIED
  - Leads calientes → PROPOSAL
  - Mensajes negativos → ajuste de score
  
- [x] **Real-time AI Updates**
  - Socket.IO event 'ai:analysis' al terminar análisis
  - Frontend escucha en Conversaciones y Contactos
  - Auto-refresh de vistas cuando IA actualiza datos
  - Logs detallados en consola del navegador
  
- [x] **AI Configuration (aIConfig model)**
  - Modelo en Prisma con todos los parámetros OpenAI
  - Fields: systemPrompt, model, temperature, maxTokens, isActive, autoReply
  - businessHours JSON para horarios de respuesta
  - fallbackMessage para fuera de horario
  - Script check-ai-config.ts para gestión de configuración
  
- [x] **API Endpoints de IA**
  - GET /api/ai/status - Verifica OPENAI_API_KEY
  - GET /api/ai/config - Devuelve config activa o primera disponible
  - PUT /api/ai/config/:id - Actualiza configuración
  - POST /api/ai/test - Prueba IA con mensajes de ejemplo
  - POST /api/ai/analyze-conversation - Análisis manual
  - POST /api/ai/generate-response - Generación manual
  
- [x] **AI Configuration UI** ✨
  - Página completa en `/dashboard/integrations/ai`
  - Selector de modelos con precios
  - System prompt personalizable
  - Controles de temperatura (0-2)
  - Max tokens slider (100-4000)
  - Toggle isActive y autoReply
  - Función de test integrada
  - Estimaciones de costo
  
- [x] **Flujo Completo Automatizado**
  1. ✅ Mensaje llega por WhatsApp
  2. ✅ Contact creado/actualizado automáticamente
  3. ✅ Conversación y mensaje guardados
  4. ✅ IA analiza automáticamente (sentiment, intent, urgency, score)
  5. ✅ Contact.status y score actualizados según análisis
  6. ✅ Respuesta automática enviada a WhatsApp (si autoReply activo)
  7. ✅ Socket.IO emite eventos (message:new, ai:analysis)
  8. ✅ Frontend actualiza UI en tiempo real
  9. ✅ Logs detallados en backend y frontend

### 🚧 Próximas Tareas

#### **Prioridad Alta - Features Core**
- [ ] **Mejoras en IA**
  - Entrenamiento con conversaciones exitosas del CRM
  - Fine-tuning del modelo con casos específicos
  - Análisis de múltiples idiomas
  - Detección de spam/mensajes irrelevantes
  - Configuración de business hours activa
  
- [ ] **Mejoras en Conversaciones**
  - Búsqueda en conversaciones
  - Filtros por canal/estado
  - Marcar como leído/no leído
  - Asignación manual de conversaciones a usuarios
  - Respuestas rápidas (quick replies)
  - Templates de mensajes personalizados
  - Historial de cambios de estado
  
- [ ] **Notificaciones Frontend**
  - Toast notifications para análisis de IA
  - Alertas visuales cuando contact cambia de estado
  - Notificaciones de nuevos mensajes con badge
  - Sonido opcional para mensajes entrantes
**Backend API Endpoints disponibles:**
- **Autenticación:**
  - `POST /api/auth/register` - Registro de usuario
  - `POST /api/auth/login` - Inicio de sesión
  - `POST /api/auth/refresh` - Refresh token
  - `GET /api/auth/me` - Usuario actual
- **Contactos:**
  - `GET /api/contacts` - Listar contactos (con filtros)
  - `GET /api/contacts/:id` - Ver contacto
  - `POST /api/contacts` - Crear contacto
  - `PUT /api/contacts/:id` - Actualizar contacto
  - `DELETE /api/contacts/:id` - Eliminar contacto
- **Conversaciones:**
  - `GET /api/conversations` - Listar conversaciones
  - `GET /api/conversations/:id/messages` - Historial de mensajes
- **Campañas:**
  - `GET /api/campaigns` - Listar campañas
  - `POST /api/campaigns` - Crear campaña
  - `GET /api/campaigns/:id` - Ver campaña
  - `PUT /api/campaigns/:id` - Actualizar campaña
  - `DELETE /api/campaigns/:id` - Eliminar campaña
- **Estadísticas:**
  - `GET /api/stats/dashboard` - Estadísticas del dashboard
  - `GET /api/analytics/dashboard` - Alias de stats (compatibilidad)
- **WhatsApp:**
  - `GET /api/whatsapp/status` - Estado de WhatsApp
  - `POST /api/whatsapp/connect` - Conectar WhatsApp
  - `POST /api/whatsapp/disconnect` - Desconectar WhatsApp
  - `POST /api/whatsapp/send` - Enviar mensaje (con conversationId opcional)
- **IA (OpenAI):**
  - `GET /api/ai/status` - Verifica si OPENAI_API_KEY existe
  - `GET /api/ai/config` - Obtiene configuración activa
  - `PUT /api/ai/config/:id` - Actualiza configuración
  - `POST /api/ai/test` - Prueba IA con mensajes de ejemplo
  - `POST /api/ai/analyze-conversation` - Análisis manual de conversación
  - `POST /api/ai/generate-response` - Generación manual de respuesta
  - `POST /api/ai/qualify-lead` - Calificación manual de lead
  - `POST /api/ai/analyze-sentiment` - Análisis de sentimiento
  - `GET /api/ai/summary` - Resumen de múltiples conversaciones
- [ ] **Analytics Dashboard**
  - Gráficos de conversión
  - Reportes de actividad
  - KPIs principales
  - Exportar reportes

**Frontend Páginas disponibles:**
- `/` - Redirect automático (login o dashboard)
- `/login` - Inicio de sesión (con Google OAuth)
- `/register` - Registro
- `/auth/callback` - Callback de Google OAuth
- `/dashboard` - Dashboard principal con gráficos y métricas ✨
**Frontend Páginas disponibles:**
- `/` - Redirect automático (login o dashboard)
- `/login` - Inicio de sesión (con Google OAuth)
- `/register` - Registro
- `/auth/callback` - Callback de Google OAuth
- `/dashboard` - Dashboard principal con gráficos y métricas ✨
- `/dashboard/contacts` - Gestión de contactos ✨
- `/dashboard/pipeline` - Pipeline Kanban drag & drop ✨ NUEVO
- `/dashboard/conversations` - Chat en tiempo real ✨
- `/dashboard/campaigns` - Gestión de campañas ✨
- `/dashboard/settings` - Configuración completa ✨
- `/dashboard/whatsapp` - Integración de WhatsApp ✨
- `/dashboard/calendar` - Google Calendar ✨
- `/dashboard/sheets` - Google Sheets ✨
- `/dashboard/integrations` - Configuración de Google ✨
- `POST /api/whatsapp/connect` - Conectar WhatsApp
- `POST /api/whatsapp/disconnect` - Desconectar WhatsApp
- `POST /api/whatsapp/send` - Enviar mensaje
- **Google OAuth:**
  - `GET /api/google/url` - Obtener URL de autorización
  - `GET /api/google/callback` - Callback de OAuth
  - `POST /api/google/disconnect` - Desconectar cuenta
  - `GET /api/google/status` - Estado de conexión
  - `POST /api/google/refresh` - Actualizar tokens
- **Google Calendar:**
  - `POST /api/google/calendar/events` - Crear evento
  - `GET /api/google/calendar/events` - Listar eventos
  - `GET /api/google/calendar/events/:id` - Ver evento
  - `PUT /api/google/calendar/events/:id` - Actualizar evento
  - `DELETE /api/google/calendar/events/:id` - Eliminar evento
  - `POST /api/google/calendar/availability` - Verificar disponibilidad
- **Google Sheets:**
  - `POST /api/google/sheets/create` - Crear spreadsheet
  - `POST /api/google/sheets/export` - Exportar contactos
  - `POST /api/google/sheets/import` - Importar contactos
  - `POST /api/google/sheets/quick-export` - Crear y exportar
  - `GET /api/google/sheets/info/:id` - Info de spreadsheet
  - `POST /api/google/sheets/sync` - Sincronizar

**Frontend Páginas disponibles:**
- `/` - Landing page
- `/login` - Inicio de sesión (con Google OAuth)
- `/register` - Registro
- `/auth/callback` - Callback de Google OAuth
- `/dashboard` - Dashboard principal
- `/dashboard/contacts` - Gestión de contactos
- `/dashboard/whatsapp` - Integración de WhatsApp
- `/dashboard/integrations` - Hub de integraciones (Google + OpenAI) ✨
- `/dashboard/integrations/ai` - Configuración completa de IA ✨ NUEVO
- `/dashboard/conversations` - Chat en tiempo real ✨
- `/dashboard/campaigns` - Gestión de campañas ✨
- `/dashboard/calendar` - Google Calendar ✨
- `/dashboard/sheets` - Google Sheets ✨
- `/dashboard/settings` - Configuración completa ✨

**Última actualización**: 6 de Diciembre, 2024 (00:45)

### 🎉 Últimos Cambios (Diciembre 5-6, 2024)

**Sesión Nocturna (Parte 3 - Configuración de IA UI):**
- ✅ **Página de Integraciones Rediseñada** 🎨
  - Tarjetas lado a lado: Google Workspace + OpenAI Assistant
  - Toggle switches inline para isActive y autoReply
  - Estado de conexión en tiempo real para ambas integraciones
  - Muestra modelo actual y configuración activa
  - Warning cuando no hay configuración de IA
  - Validación de config.id antes de actualizar estado
  
- ✅ **Página de Configuración de IA Completa** ✨
  - Ruta: `/dashboard/integrations/ai`
  - Selector de modelo con 6 opciones (GPT-4 Turbo, GPT-4, GPT-3.5 variantes)
  - Textarea para system prompt (8 filas, 600 caracteres)
  - Slider de temperatura (0-2) con labels visuales
  - Slider de max tokens (100-4000) con recomendaciones
  - Input para mensaje de fallback
  - Toggle switches (verde para isActive, morado para autoReply)
  - Botón de test que llama POST /api/ai/test
  - Estimaciones de costo por modelo
  - 4 tarjetas de features (Análisis, Respuestas, Calificación, Auto-respuesta)
  
- ✅ **Backend AI Endpoints**
  - GET /api/ai/status - Verifica OPENAI_API_KEY (startsWith 'sk-')
  - GET /api/ai/config - Busca config activa, fallback a cualquier config
  - PUT /api/ai/config/:id - Actualización condicional de campos
  - POST /api/ai/test - Test con mensajes de ejemplo
  
- ✅ **Script de Gestión de Configuración**
  - check-ai-config.ts mejorado
  - Lista todas las configuraciones con estado
  - Auto-crea config default si DB está vacía
  - Auto-activa primera config si ninguna está activa
  - Output con emojis y formato estructurado
  
- ✅ **Correcciones de Rutas**
  - Todas las llamadas frontend usan `/api/ai/*` (no `/ai/*`)
  - Backend registra rutas bajo `/api` prefix
  - Manejo de respuestas vacías con validación
  
- ✅ **Activación de Configuración**
  - Config ID: 312c92fc-be80-4de7-9b6e-5cb3e983f9de
  - isActive: true
  - autoReply: true
  - Modelo: gpt-4-turbo-preview
  - Sistema listo para auto-responder mensajes

**Sesión Nocturna (Parte 2 - IA Automática):**
- ✅ **IA Automática Integrada con WhatsApp** 🤖
  - Análisis automático de cada mensaje entrante
  - Calificación de leads en tiempo real (0-100)
  - Actualización automática del pipeline según IA
  - Detección de sentimiento, intención y urgencia
  - Generación de respuestas sugeridas
  - Auto-respuesta a WhatsApp si autoReply activo
  - Uso correcto de JID format (from con @s.whatsapp.net)
  - Guardado de mensaje en BD con emit de Socket.IO
  - Logs detallados de análisis de IA
  
- ✅ **Real-time Updates en Todo el Dashboard**
  - Socket.IO events en Conversaciones
  - Socket.IO events en Contactos
  - Auto-refresh cuando IA actualiza contactos
  - Eventos `ai:analysis` para notificaciones
  - Sincronización automática entre vistas
  
- ✅ **Flujo Completo Automatizado**:
  1. Mensaje llega por WhatsApp
  2. Se crea/actualiza contacto
  3. Se guarda en conversación
  4. IA analiza automáticamente
  5. Actualiza score y status
  6. Genera y envía respuesta automática (si autoReply activo)
  7. Frontend se actualiza en tiempo real
  8. Notificaciones en consola

**Sesión Nocturna (Continuación - Parte 1):**
- ✅ Fixed WhatsApp integration connection loop issue
- ✅ Improved reconnection logic with exponential backoff
- ✅ Added proper auth state saving with useMultiFileAuthState
- ✅ Removed deprecated printQRInTerminal option
- ✅ Added fetchLatestBaileysVersion for compatibility
- ✅ Session directory auto-creation on startup
- ✅ Better error handling and frontend notifications
- ✅ Disconnect now properly cleans session files
- ✅ Max retry attempts increased to 5 with better logging
- ✅ Fixed conversations not showing (removed assignedToId filter)
- ✅ Auto-assign new WhatsApp contacts to first admin/manager
- ✅ Socket.IO real-time updates for new messages
- ✅ Conversations list auto-refreshes when messages arrive

**Issue Detectado y Resuelto (Parte 2):**
- ❌ Problema: Conversaciones no aparecían en el frontend
- 🔍 Causa: Query filtraba por `assignedToId` y contactos nuevos no estaban asignados
- ✅ Solución:
  - Mostrar TODAS las conversaciones (no solo asignadas)
  - Auto-asignar contactos nuevos al primer admin/manager
  - Socket.IO escucha evento `message:new` para updates en tiempo real
  - Frontend se refresca automáticamente al recibir mensajes

**Issue Detectado y Resuelto:**
- ❌ Problema: WhatsApp entraba en loop de reconexión infinito
- 🔍 Causa: Auth state no se guardaba correctamente, sesión vacía
- ✅ Solución: 
  - Agregado `saveCreds` en event listener
  - Mejorada lógica de reconexión con backoff exponencial
  - Session path con auto-creación de directorios
  - Mejor manejo de estados de desconexión

**Sesión Nocturna (Parte 1):**
- ✅ Script de seed completo con datos de prueba
- ✅ 18 contactos distribuidos en pipeline
**Última actualización**: 5 de Diciembre, 2024 (00:15)

### 🎉 Últimos Cambios (Diciembre 5, 2024)
**Sesión Nocturna:**
- ✅ Script de seed completo con datos de prueba
- ✅ 18 contactos distribuidos en pipeline
- ✅ 4 conversaciones con mensajes
- ✅ 4 campañas de ejemplo
- ✅ Pipeline Kanban con drag & drop funcional
- ✅ @hello-pangea/dnd integrado
- ✅ Filtros por score en Pipeline
- ✅ Métricas en tiempo real
- ✅ Actualización automática de estado en backend

**Sesión Vespertina:**
- ✅ Todas las vistas del CRM mejoradas visualmente
- ✅ Dashboard con gráficos de Recharts (líneas, barras, pie)
- ✅ Vista de Conversaciones con chat en tiempo real
- ✅ Vista de Campañas completa
- ✅ Vista de Settings con 5 tabs
- ✅ Header mejorado con búsqueda y notificaciones
- ✅ Sidebar con tema oscuro y animaciones
- ✅ API routes completas (conversations, campaigns, stats, google-status)
- ✅ Fixed: SQL queries con nombres de columnas correctos (camelCase)
- ✅ Fixed: Manejo de datos undefined en frontend (optional chaining)
- ✅ Redirect automático en home page (login o dashboard)

### 📅 Día 4 - Continuación: Seed Database + Pipeline Kanban + AI Agent (5 Dic 2024)

**Seed Database:**
- ✅ Script de seed completo con Prisma
- ✅ 4 usuarios creados (admin, manager, 2 agentes)
- ✅ 18 contactos distribuidos en 6 estados del pipeline
- ✅ 4 conversaciones con mensajes de ejemplo
- ✅ 4 campañas con métricas
- ✅ 1 configuración de IA preestablecida
- ✅ Comando: `npm run seed` en backend

**Pipeline Kanban:**
- ✅ Vista de Kanban completa en `/dashboard/pipeline`
- ✅ Librería @hello-pangea/dnd para drag & drop
- ✅ 6 columnas: NEW → CONTACTED → QUALIFIED → PROPOSAL → WON → LOST
- ✅ Filtros por score (todos, alto 80+, medio 60-79, bajo <60)
- ✅ Métricas en tiempo real (valor total del pipeline)
- ✅ Tarjetas de contacto con score, email, teléfono, fuente
- ✅ Actualización automática del backend al mover tarjetas
- ✅ Link en Sidebar para acceso rápido

**AI Agent (OpenAI Integration):**
- ✅ OpenAI SDK instalado y configurado
- ✅ API key configurada en .env
- ✅ Servicio de IA completo (`/backend/src/services/ai.service.ts`)
  - analyzeConversation: Análisis completo con sentimiento, intención, urgencia, score sugerido
  - generateResponse: Generación de respuestas contextuales
  - qualifyLead: Calificación automática de leads (0-100)
  - analyzeSentiment: Análisis rápido de sentimiento
  - summarizeConversations: Resúmenes de múltiples conversaciones
- ✅ Rutas de API en `/api/ai/*`:
  - POST /api/ai/analyze-conversation
  - POST /api/ai/generate-response
  - POST /api/ai/qualify-lead
  - POST /api/ai/analyze-sentiment
  - GET /api/ai/summary
  - GET /api/ai/config
  - PUT /api/ai/config/:id
- ✅ Componente AIAssistant en el frontend
- ✅ Panel de IA integrado en vista de conversaciones
- ✅ Botón para mostrar/ocultar análisis de IA
- ✅ Tabs: Análisis y Respuesta Sugerida
- ✅ Visualización de sentimiento, urgencia, intención
- ✅ Score y estado sugeridos
- ✅ Resumen de conversación generado por IA
- ✅ Generación de respuestas contextuales
- ✅ Botones para copiar y regenerar respuestas

---

**Nota**: Este es un documento vivo que se irá actualizando conforme avance el proyecto. Cada feature completada se marcará con ✅.

**Última actualización**: 5 de Diciembre, 2024

---

## 📦 Archivos de Documentación Adicionales

- **`GOOGLE_SETUP.md`** - Guía completa para configurar Google Cloud Console
- **`INTEGRACIONES_GOOGLE_COMPLETADO.md`** - Resumen detallado de todas las integraciones implementadas

---

### Configuración Inicial
1. Sigue las instrucciones en `GOOGLE_SETUP.md` para configurar Google Cloud Console
2. Obtén tus credenciales (Client ID y Secret)
3. Configura las variables en `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=tu-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback
   FRONTEND_URL=http://localhost:3000
   ```

### Login con Google
- En la página de login, click en "Continuar con Google"
- Autoriza los permisos solicitados
- Serás redirigido automáticamente al dashboard

### Conectar Cuenta Existente
- Ve a `/dashboard/integrations`
- Click en "Conectar con Google"
- Autoriza permisos para Calendar y Sheets

### Usar Google Calendar
- Los eventos se pueden crear desde la vista de contactos
- API disponible en `/api/google/calendar/*`

### Usar Google Sheets
- Exporta todos los contactos con un click
- Importa contactos desde una spreadsheet existente
- API disponible en `/api/google/sheets/*`
