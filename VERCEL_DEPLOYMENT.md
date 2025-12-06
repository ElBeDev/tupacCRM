# TupacCRM - Deployment Guide for Vercel

## 📋 Pre-requisitos

Antes de desplegar en Vercel, necesitas configurar los siguientes servicios:

### 1. Base de Datos PostgreSQL
Opciones recomendadas:
- **Vercel Postgres** (integración directa)
- **Supabase** (free tier generoso)
- **Neon** (serverless PostgreSQL)
- **Railway** (fácil setup)

### 2. Redis
Opciones recomendadas:
- **Upstash Redis** (free tier, serverless-friendly)
- **Redis Cloud** (free tier disponible)

### 3. WhatsApp Service (IMPORTANTE)
⚠️ **Limitación**: WhatsApp con Baileys NO funciona en Vercel (serverless)

**Opciones:**
- **Opción A (Recomendada)**: Desplegar el servicio de WhatsApp en:
  - Railway
  - Render
  - DigitalOcean App Platform
  - Cualquier VPS

- **Opción B**: Migrar a WhatsApp Business API (oficial, de pago)

## 🚀 Pasos de Deployment

### Backend en Vercel

1. **Configurar Base de Datos**
```bash
# Ejemplo con Vercel Postgres
vercel postgres create
```

2. **Configurar Variables de Entorno**
En Vercel Dashboard > Settings > Environment Variables:
```
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=https://your-backend.vercel.app/auth/google/callback
OPENAI_API_KEY=sk-your-key
NODE_ENV=production
PORT=3001
```

3. **Desplegar Backend**
```bash
cd backend
vercel
```

### Frontend en Vercel

1. **Configurar Variables de Entorno**
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-backend.vercel.app
```

2. **Desplegar Frontend**
```bash
cd frontend
vercel
```

### Configurar Migraciones de Prisma

Después del primer deploy del backend:
```bash
# Ejecutar migraciones en producción
cd backend
vercel env pull .env.production
npx prisma migrate deploy
```

## 🔧 Configuración Post-Deployment

### 1. Actualizar Google OAuth
- Ir a Google Cloud Console
- Agregar tus URLs de Vercel a "Authorized redirect URIs":
  - `https://your-backend.vercel.app/auth/google/callback`
  - `https://your-frontend.vercel.app/auth/callback`

### 2. Configurar CORS
El backend ya está configurado para aceptar el origen del frontend.
Si cambias el dominio, actualiza la variable `FRONTEND_URL`.

### 3. WhatsApp (si usas servicio separado)
- Despliega el servicio de WhatsApp en Railway/Render
- Actualiza las rutas de WhatsApp en el backend para apuntar al servicio externo
- Configura las variables de entorno del servicio de WhatsApp

## 📱 Estructura de Deployment Recomendada

```
┌─────────────────┐
│  Frontend       │  ← Vercel
│  (Next.js)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend API    │  ← Vercel
│  (Express)      │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│ Postgres│ │  Redis   │  ← Upstash/Neon
└────────┘ └──────────┘

┌─────────────────┐
│  WhatsApp Svc   │  ← Railway/Render
│  (Baileys)      │     (Servicio Separado)
└─────────────────┘
```

## ⚠️ Limitaciones de Vercel

1. **Serverless Functions**:
   - Timeout máximo: 10s (Hobby), 60s (Pro)
   - No mantienen estado entre ejecuciones
   - No soportan WebSockets persistentes (WhatsApp)

2. **File System**:
   - Read-only (excepto /tmp)
   - No persiste archivos entre ejecuciones
   - Las sesiones de WhatsApp no se guardan

3. **Memory**:
   - Límite de 1024 MB (Hobby)
   - 3008 MB (Pro)

## 🎯 Alternativas Recomendadas

Para un CRM con WhatsApp, considera:

### Opción 1: Frontend en Vercel + Backend en Railway
- Frontend: Vercel (óptimo para Next.js)
- Backend + WhatsApp: Railway (soporta procesos persistentes)
- DB: PostgreSQL de Railway
- Redis: Upstash

### Opción 2: Todo en Railway/Render
- Todo en un mismo servicio
- Mejor para WebSockets y procesos persistentes
- Más fácil de manejar

### Opción 3: Arquitectura Híbrida (ACTUAL)
- Frontend: Vercel
- API Principal: Vercel
- WhatsApp Service: Railway/Render (separado)
- DB: Supabase/Neon
- Redis: Upstash

## 📝 Checklist Pre-Deploy

- [ ] Base de datos PostgreSQL configurada
- [ ] Redis configurado (Upstash recomendado)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Google OAuth URLs actualizadas
- [ ] Servicio de WhatsApp desplegado separadamente (si aplica)
- [ ] Migraciones de Prisma ejecutadas
- [ ] URLs del frontend/backend actualizadas en .env
- [ ] CORS configurado correctamente

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Verifica que DATABASE_URL tenga `?sslmode=require`
- Asegúrate que la DB acepta conexiones externas

### Error: WhatsApp no conecta
- WhatsApp NO funcionará en Vercel serverless
- Debes usar un servicio separado (Railway/Render)

### Error: Redis connection failed
- Verifica que uses `rediss://` (con doble s para SSL)
- Upstash Redis es la mejor opción para Vercel

## 🔗 Links Útiles

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://upstash.com/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

## 💡 Recomendación Final

Para este proyecto con WhatsApp, considera desplegar todo en **Railway** o **Render** en lugar de Vercel, ya que necesitas:
- Procesos persistentes (WhatsApp)
- WebSocket connections
- Sistema de archivos para sesiones

Vercel es excelente para APIs stateless, pero WhatsApp requiere estado persistente.
