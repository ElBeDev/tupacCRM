# TupacCRM - Workflow y Documentación del Proyecto

## 🎯 Objetivo del Proyecto
Crear un CRM completo basado en IA similar a Prometheo, pero open-source y auto-hospedado, sin necesidad de pagar suscripciones mensuales.

## 📋 Características Principales a Implementar

### 1. **Gestión Multicanal**
- [x] **Integración con WhatsApp (QR Code)**
  - [x] Escaneo de QR para conectar WhatsApp personal/business
  - [x] Implementación con Baileys (multi-device)
  - [x] Mantener sesión activa y reconexión automática
  - [x] Sin necesidad de API oficial (evitamos costos y verificación)
  - [x] Auto-creación de contactos desde mensajes
  - [x] Auto-respuesta con IA integrada
- [ ] Integración con Instagram Direct Messages *(Próximamente)*
- [ ] Integración con Facebook Messenger *(Próximamente)*
- [ ] Integración con TikTok mensajería *(Próximamente)*
- [x] Panel unificado para gestionar todas las conversaciones

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
  - [x] Auto-respuesta automática a WhatsApp (configurable)
  - [x] Actualización automática de pipeline según análisis
  - [x] Configuración completa de IA (modelo, temperatura, tokens, prompts)
  - [x] Sistema de testing de IA integrado

- [x] **Asistentes IA con OpenAI Assistants API** ✨ NUEVO (13 Dic 2024)
  - [x] Creación de asistentes personalizados en OpenAI
  - [x] Integración completa con Assistants API (threads, messages, runs)
  - [x] Soporte para GPT-4o, GPT-4o-mini, GPT-4 Turbo y GPT-3.5 Turbo
  - [x] **GPT-4o Vision** - Análisis y comprensión de imágenes
  - [x] UI profesional con drag & drop de imágenes
  - [x] Vista previa de imágenes antes de enviar
  - [x] Selector visual de modelos con badges (Recomendado, Económico, Vision)
  - [x] Slider de temperatura para ajustar creatividad
  - [x] Chat en tiempo real con avatares y burbujas estilizadas
  - [x] Historial de conversaciones persistente
  - [x] CRUD completo de asistentes (crear, leer, actualizar, eliminar)
  - [x] Sincronización con base de datos y OpenAI

- [x] **Seguimientos Inteligentes**
  - [x] Actualización automática de contactos según conversaciones
  - [x] Detección de urgencia en tiempo real
  - [x] Scoring dinámico de leads (0-100)
  - [ ] Recordatorios automáticos *(Pendiente)*
  - [ ] Reactivación automática de leads fríos *(Pendiente)*

- [x] **Cierre de Ventas Automatizado**
  - [x] Detección de intención de compra
  - [x] Cambio automático de estado del pipeline
  - [x] Agendamiento con Google Calendar integrado
  - [ ] Coordinación de visitas *(Pendiente)*

### 3. **Base de Datos y CRM**
- [x] **Base de datos dinámica**
  - [x] Extracción automática de información de conversaciones
  - [x] Enriquecimiento de datos en tiempo real con IA
  - [x] Campos personalizables (customFields JSON)
  - [x] Historial completo de interacciones

- [x] **Gestión de Contactos**
  - [x] Perfiles de clientes completos
  - [x] Segmentación por score, estado, fuente
  - [x] Tags y categorías (Smart Tags)
  - [x] Asignación de contactos a usuarios
  - [ ] Notas y comentarios *(Pendiente)*

- [x] **Pipeline de Ventas**
  - [x] 6 etapas (NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST)
  - [x] Drag & drop para mover leads (Kanban)
  - [x] Vista de embudo funcional
  - [x] Métricas y conversión por etapa

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

- [x] **Productividad**
  - [x] **Google OAuth 2.0** (Login con Google + permisos)
  - [x] Google Sheets (lectura/escritura, import/export)
  - [x] Google Calendar (agendamiento, sincronización)
  - [ ] Excel/CSV import/export *(Pendiente)*

- [ ] **Publicidad** *(Próximamente)*
  - Meta Ads (Facebook/Instagram)
  - Google Ads
  - Tracking de conversiones
- [ ] **Publicidad**
  - Meta Ads (Facebook/Instagram)
  - Google Ads
  - Tracking de conversiones

### 6. **Analytics y Reportes**
- [x] Dashboard de métricas (con gráficos Recharts)
- [x] Reportes de conversión básicos
- [ ] Análisis de rendimiento de agentes *(Pendiente)*
- [ ] ROI de campañas *(Pendiente)*
- [ ] Tiempo de respuesta promedio *(Pendiente)*
- [x] Tasa de cierre (visible en pipeline)

### 7. **Administración**
- [x] **Sistema de Usuarios**
  - [x] Roles y permisos (admin, manager, agent)
  - [x] Múltiples usuarios ilimitados
  - [x] Asignación de leads
  - [ ] Tracking de actividad detallado *(Pendiente)*

- [x] **Configuración**
  - [x] Personalización completa del agente IA
  - [x] Prompt engineering (system prompt configurable)
  - [x] Configuración de modelo, temperatura y tokens
  - [x] Toggle de auto-respuesta
  - [ ] Templates de mensajes *(Pendiente)*
  - [ ] Horarios de atención *(En businessHours, no implementado en UI)*

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

#### **Frontend (Next.js 14 + TypeScript + Chakra UI)**
- [x] Next.js 14 con App Router
- [x] **Chakra UI v2.10.9** como sistema de diseño principal
- [x] Zustand para manejo de estado
- [x] **Sistema de Autenticación**
  - Páginas de login y registro
  - Almacenamiento de sesión
  - Protección de rutas
  - Interceptores de API para refresh token
  
- [x] **Diseño Completo Estilo Prometheo** ✨
  - Tema consistente: Background #FEFEFE, Primary #9D39FE
  - Fuente: DM Sans
  - Navbar lateral colapsable con navegación completa
  - Branding: "TUPAC CRM" (sin elementos de plan gratuito)
  - Estados vacíos con imágenes y CTAs
  
- [x] **Dashboard Principal** (`/dashboard`)
  - Vista de bienvenida con mensaje personalizado
  - Estadísticas en tiempo real con tarjetas de métricas
  - Gráficos con Recharts (líneas, barras, pie)
  - Usuario y cierre de sesión
  - Header con búsqueda y notificaciones
  - Sidebar con tema y animaciones
  
- [x] **Chat / Conversaciones** (`/dashboard/chat`)
  - Lista de conversaciones activas
  - Chat interface en tiempo real estilo WhatsApp
  - Envío de mensajes con persistencia
  - Historial completo de mensajes
  - Socket.IO para mensajes en vivo (event: message:new)
  - Panel de IA integrado con análisis y sugerencias
  - Auto-refresh al recibir nuevos mensajes
  
- [x] **Configuración** (`/dashboard/configuration`)
  - Sección de integraciones con tarjetas
  - Estado de conexiones (Google, WhatsApp, IA)
  - Enlaces a configuración detallada
  - UI moderna con toggles y estado visual
  
- [x] **Prompts / Asistentes** (`/dashboard/prompt`) ✨ NUEVO
  - Estado vacío con icono de robot
  - Botones "Crear nuevo" y "Ajustes y horarios"
  - Diseño limpio sin elementos de plan
  - 138 líneas, cero errores
  
- [x] **Pruebas / Testing** (`/dashboard/testing`) ✨ NUEVO
  - Selector de modo (AI Testing vs Manual Testing)
  - Panel de chat para probar conversaciones
  - Input de mensaje con botón de envío
  - Estado vacío inicial con placeholder
  - 235 líneas, cero errores
  
- [x] **Smart Tags** (`/dashboard/smart-tags`) ✨ ACTUALIZADO (13 Dic 2024)
  - CRUD completo de etiquetas inteligentes
  - Condiciones automáticas (score >= X, status == Y)
  - 8 colores disponibles para tags
  - Modelo de base de datos SmartTag en Prisma
  - Backend con servicio y rutas completas (`/api/smart-tags`)
  - Modal de creación/edición con preview
  - Lista de tags con menú de acciones
  - Iconos personalizados (TagIcon con sparkle)
  - 838 líneas, funcionalidad completa
  
- [x] **Base de Datos / Contactos** (`/dashboard/database`) ✨ FUNCIONAL
  - CRUD completo de contactos
  - Tabla con datos reales del backend
  - Búsqueda y filtrado
  - Modal de creación/edición
  - Estados y fuentes con badges de colores
  - Score de leads visual
  - Tags por contacto
  - Exportación (próximamente)
  - 906 líneas, funcionalidad completa
  
- [x] **Campañas** (`/dashboard/campaigns`) ✨ REDISEÑADO
  - Convertido de Tailwind a Chakra UI
  - Estado vacío con icono de megáfono
  - Header "Campañas" con descripción
  - Botón "Crear Nueva Campaña"
  - Consistente con el resto del dashboard
  
- [x] **Vista de Contactos** (`/dashboard/contacts`)
  - Tabla de contactos con estados
  - Modal para crear contactos
  - Visualización de score y asignación
  - Estados con colores (NEW, QUALIFIED, WON, etc.)
  - Actualización en tiempo real vía Socket.IO
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
  - `GET /api/analytics/dashboard` - Alias de stats
  
- **WhatsApp:**
  - `GET /api/whatsapp/status` - Estado de WhatsApp
  - `POST /api/whatsapp/connect` - Conectar WhatsApp
  - `POST /api/whatsapp/disconnect` - Desconectar WhatsApp
  - `POST /api/whatsapp/send` - Enviar mensaje (con conversationId)
  
- **IA (OpenAI):**
  - `GET /api/ai/status` - Verifica OPENAI_API_KEY
  - `GET /api/ai/config` - Obtiene configuración activa
  - `PUT /api/ai/config/:id` - Actualiza configuración
  - `POST /api/ai/test` - Prueba IA con mensajes de ejemplo
  - `POST /api/ai/analyze-conversation` - Análisis manual
  - `POST /api/ai/generate-response` - Generación manual
  - `POST /api/ai/qualify-lead` - Calificación manual
  - `POST /api/ai/analyze-sentiment` - Análisis de sentimiento
  - `GET /api/ai/summary` - Resumen de conversaciones
  
- **Google OAuth:**
  - `GET /api/google/url` - URL de autorización
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
- `/` - Redirect automático (login o dashboard)
- `/login` - Inicio de sesión (con Google OAuth)
- `/register` - Registro
- `/auth/callback` - Callback de Google OAuth
- `/dashboard` - Dashboard principal con gráficos y métricas ✨
- `/dashboard/chat` - Chat en tiempo real ✨ PROMETHEO STYLE
- `/dashboard/configuration` - Configuración e integraciones ✨ PROMETHEO STYLE
- `/dashboard/prompt` - Gestión de prompts/asistentes ✨ NUEVO - PROMETHEO STYLE
- `/dashboard/testing` - Pruebas de IA y conversaciones ✨ NUEVO - PROMETHEO STYLE
- `/dashboard/smart-tags` - Gestión de Smart Tags ✨ NUEVO - PROMETHEO STYLE
- `/dashboard/database` - Base de datos de contactos ✨ NUEVO - PROMETHEO STYLE
- `/dashboard/campaigns` - Gestión de campañas ✨ REDISEÑADO - PROMETHEO STYLE
- `/dashboard/contacts` - Gestión de contactos ✨
- `/dashboard/pipeline` - Pipeline Kanban drag & drop ✨
- `/dashboard/settings` - Configuración completa ✨
- `/dashboard/whatsapp` - Integración de WhatsApp ✨
- `/dashboard/calendar` - Google Calendar ✨
- `/dashboard/sheets` - Google Sheets ✨
- `/dashboard/integrations` - Hub de integraciones (Google + IA) ✨
- `/dashboard/integrations/ai` - Configuración completa de IA ✨

**Última actualización**: 7 de Diciembre, 2024 (12:00)

### 🎉 Últimos Cambios (Diciembre 7, 2024)

**Sesión de Rediseño Frontend - Estilo Prometheo:**
- ✅ **Rediseño Completo del Dashboard** 🎨
  - Todas las páginas principales convertidas a Chakra UI
  - Tema consistente: Background #FEFEFE, Primary #9D39FE
  - Fuente DM Sans en todo el sistema
  - Estados vacíos elegantes con imágenes y CTAs
  
- ✅ **7 Páginas Nuevas/Rediseñadas:**
  1. **Dashboard** - Vista principal con bienvenida y métricas
  2. **Chat** - Interface de conversaciones estilo WhatsApp
  3. **Configuration** - Hub de integraciones y configuración
  4. **Prompts/Asistentes** - Gestión de asistentes de IA (138 líneas)
  5. **Testing/Pruebas** - Panel de pruebas con selector de modo (235 líneas)
  6. **Smart Tags** - Sistema de etiquetas inteligentes (183 líneas)
  7. **Database/Contactos** - Base de datos con búsqueda y acción (simplificado)
  8. **Campaigns** - Rediseñado de Tailwind a Chakra UI
  
- ✅ **Branding TUPAC CRM**
  - Eliminados todos los elementos de "Plan gratuito"
  - Sin indicadores de tokens disponibles
  - Nombre "TUPAC CRM" en lugar de "Mi Prometheo"
  - Diseño profesional y limpio
  
- ✅ **Componentes Personalizados**
  - 15+ iconos SVG personalizados (Robot, Tag, Search, Download, etc.)
  - Estados vacíos con fallback a iconos
  - Botones y controles consistentes
  - Animaciones suaves y transiciones
  
- ✅ **Cero Errores de Compilación**
  - Todas las páginas verificadas y funcionales
  - Imports correctos de Chakra UI
  - TypeScript sin errores
  - Listo para producción

**Marketplace Funcional:** ✅ NUEVO (13 Dic 2024)
- ✅ **Marketplace de Asistentes IA**
  - 6 templates de asistentes pre-configurados
  - Botón "Instalar" que crea asistente real en OpenAI
  - Templates: Ventas, Soporte 24/7, Generador de Contenido, Análisis, Traductor, Recordatorios
  - Estado de instalación visual (instalando, instalado)
  - Integración completa con backend
- ✅ Navegación con Marketplace habilitado
- ✅ Rutas de API: `/api/assistants/marketplace/install/:templateId`

---

### 🎉 Últimos Cambios (Diciembre 13, 2024)

**Sesión de Funcionalidades Completas:**

- ✅ **Marketplace de Asistentes IA** 🛒
  - 6 templates profesionales pre-configurados
  - Botones de instalación funcionales
  - Backend con templates y rutas de instalación
  - Estados visuales (instalando, instalado, error)
  - Integración con OpenAI Assistants API

- ✅ **Smart Tags con Backend Completo** 🏷️
  - Modelo SmartTag en Prisma con migración
  - Servicio smart-tag.service.ts
  - Rutas CRUD en `/api/smart-tags`
  - Condiciones automáticas por score/status/source
  - 8 colores disponibles
  - Frontend con modal de creación/edición

- ✅ **Database/Contactos Funcional** 👥
  - CRUD completo conectado al backend
  - Búsqueda y filtrado en tiempo real
  - Modal de creación y edición
  - Badges de estado y fuente
  - Score visual de leads

- ✅ **Correcciones de TypeScript**
  - Corregido error en jwt.ts (expiresIn type)
  - Corregido ChakraProvider en providers.tsx
  - Regeneración de Prisma client
  - Cero errores en frontend y backend

---

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

**Última actualización**: 13 de Diciembre, 2024

---

## 📅 Sesión 13 de Diciembre, 2024 - Asistentes IA con GPT-4o Vision

### Resumen de la Sesión
Se implementó un sistema completo de Asistentes IA usando la OpenAI Assistants API, con una UI profesional que soporta imágenes y GPT-4o Vision.

### Problemas Resueltos
1. **Autenticación Mock → Real**: El login usaba tokens mock que el backend rechazaba. Se cambió a autenticación real con JWT.
2. **Usuario Demo no existía**: Se creó el usuario `demo@tupaccrm.com` en la base de datos.
3. **OpenAI API Key faltante**: Se configuró la variable `OPENAI_API_KEY` en el docker-compose usando archivo `.env`.
4. **Botón de logout faltante**: Se agregó botón de cerrar sesión en el navbar lateral.

### Nuevas Características Implementadas

**Frontend - UI de Asistentes (`/dashboard/prompt`):**
- ✅ Header profesional con gradiente púrpura/azul
- ✅ Sidebar con lista de asistentes y badges de modelo
- ✅ Selector visual de modelos:
  - GPT-4o (Recomendado, con Vision)
  - GPT-4o Mini (Económico, con Vision)
  - GPT-4 Turbo (con Vision)
  - GPT-3.5 Turbo (sin Vision)
- ✅ Soporte para imágenes con drag & drop
- ✅ Vista previa de imágenes antes de enviar (hasta 5)
- ✅ Botón de adjuntar imagen (solo para modelos con Vision)
- ✅ Chat moderno con avatares y burbujas estilizadas
- ✅ Slider de temperatura (0-2) para ajustar creatividad
- ✅ Modal de creación con formulario completo
- ✅ Animaciones y transiciones suaves
- ✅ Auto-scroll a nuevos mensajes

**Backend - Asistentes API:**
- ✅ Integración con OpenAI Assistants API
- ✅ Creación de asistentes en OpenAI (POST /api/assistants)
- ✅ Threads y mensajes persistentes
- ✅ Runs para procesar mensajes
- ✅ Sincronización DB ↔ OpenAI

**Autenticación:**
- ✅ Login real con backend (POST /api/auth/login)
- ✅ JWT tokens válidos (accessToken + refreshToken)
- ✅ Botón de logout en navbar (`NavbarCollapsable.tsx`)

### Archivos Modificados/Creados
```
frontend/src/app/dashboard/prompt/page.tsx  # UI completa de asistentes
frontend/src/app/login/page.tsx             # Autenticación real
frontend/src/components/dashboard/NavbarCollapsable.tsx  # Botón logout
docker-compose.yml                          # OPENAI_API_KEY variable
.env (en VPS)                               # API key real de OpenAI
```

### Comandos de Deploy Usados
```bash
# Deploy frontend
rsync -avz --progress frontend/src/app/dashboard/prompt/page.tsx root@72.62.11.244:/var/www/tupaccrm/frontend/src/app/dashboard/prompt/
ssh root@72.62.11.244 "docker restart tupaccrm-frontend"

# Configurar OpenAI Key
ssh root@72.62.11.244 "echo 'OPENAI_API_KEY=sk-...' > /var/www/tupaccrm/.env"
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose down backend && docker-compose up -d backend"

# Crear usuario demo
docker exec tupaccrm-backend node -e "..." # Script de creación de usuario
```

### URLs
- **Producción**: https://srv1190739.hstgr.cloud/dashboard/prompt
- **Login**: demo@tupaccrm.com / demo123

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
