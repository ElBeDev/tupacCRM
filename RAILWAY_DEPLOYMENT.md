# Railway Deployment Guide (RECOMMENDED)

## 🎯 Por qué Railway en lugar de Vercel

Para TupacCRM, **Railway es mejor opción** porque:

✅ Soporta procesos persistentes (WhatsApp Baileys)
✅ WebSockets funcionan nativamente
✅ File system persistente para sesiones de WhatsApp
✅ Una sola plataforma para todo (backend + frontend)
✅ Más simple de configurar
✅ PostgreSQL y Redis incluidos

## 🚀 Deployment en Railway

### 1. Crear cuenta en Railway
```bash
# Instalar CLI de Railway
npm i -g @railway/cli

# Login
railway login
```

### 2. Crear nuevo proyecto
```bash
# Desde la raíz del proyecto
railway init
```

### 3. Agregar servicios

#### PostgreSQL
```bash
railway add --database postgresql
```

#### Redis
```bash
railway add --database redis
```

### 4. Configurar Variables de Entorno

Railway auto-configura `DATABASE_URL` y `REDIS_URL`, pero necesitas agregar:

```bash
# En Railway Dashboard > Variables
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.railway.app/auth/google/callback
OPENAI_API_KEY=sk-your-openai-key
AI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.railway.app
```

### 5. Configurar Build

Crea `railway.json` en la raíz del backend:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 6. Deploy Backend

```bash
cd backend
railway up
```

### 7. Deploy Frontend

```bash
cd frontend
railway up
```

O mejor aún, conecta tu repositorio de GitHub:
- Railway detectará automáticamente Next.js
- Build y deploy automático en cada push

### 8. Ejecutar Migraciones

```bash
# Desde tu local, conectado a Railway
railway run npx prisma migrate deploy
```

## 🔧 Configuración Completa

### Backend Railway Settings

1. **Root Directory**: `/backend`
2. **Build Command**: `npm install && npx prisma generate && npm run build`
3. **Start Command**: `npm run start`
4. **Health Check Path**: `/health` (opcional, puedes crear esta ruta)

### Frontend Railway Settings

1. **Root Directory**: `/frontend`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run start`
4. **Framework**: Next.js (auto-detectado)

## 📁 Estructura de Archivos para Railway

### Backend: `railway.toml`
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[nixpacks]
providers = ["node"]
```

### Root: `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "services": [
      {
        "name": "backend",
        "source": {
          "type": "dockerfile",
          "dockerfile": "backend/Dockerfile"
        }
      },
      {
        "name": "frontend",
        "source": {
          "type": "dockerfile",
          "dockerfile": "frontend/Dockerfile"
        }
      }
    ]
  }
}
```

## 🐳 Opción con Docker (Recomendado)

Railway soporta Docker nativamente:

```bash
# Railway detectará automáticamente tu docker-compose.yml
railway up --detach
```

### Modificar docker-compose para Railway

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      # ... otras vars
    ports:
      - "3001:3001"
    restart: always

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
    ports:
      - "3000:3000"
    restart: always
```

## 📱 Acceso a tu App

Después del deploy:
- Backend: `https://tupaccrm-backend.railway.app`
- Frontend: `https://tupaccrm-frontend.railway.app`

Railway auto-genera dominios, o puedes configurar uno custom.

## 🔒 WhatsApp Sessions en Railway

Railway tiene filesystem persistente, así que las sesiones de WhatsApp se mantendrán:

1. Las sesiones se guardan en `/whatsapp-sessions/`
2. Railway monta un volumen persistente automáticamente
3. Las sesiones sobreviven entre deployments

## 💰 Costos

Railway ofrece:
- **Hobby Plan**: $5/mes + uso
- **Créditos gratis**: $5 mensuales (suficiente para testing)
- **PostgreSQL**: Incluido
- **Redis**: Incluido

Mucho más económico que mantener múltiples servicios separados.

## 🎯 Ventajas Railway vs Vercel para este proyecto

| Feature | Railway | Vercel |
|---------|---------|--------|
| WhatsApp (Baileys) | ✅ Funciona | ❌ No funciona |
| WebSockets | ✅ Nativo | ⚠️ Limitado |
| File System | ✅ Persistente | ❌ Ephemeral |
| PostgreSQL | ✅ Incluido | ✅ Add-on |
| Redis | ✅ Incluido | ⚠️ Externo (Upstash) |
| Pricing | 💰 $5/mes | 💰 Free tier bueno |
| Setup | 🟢 Simple | 🟡 Complejo (multi-service) |

## 🚀 Quick Start

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Agregar PostgreSQL y Redis
railway add --database postgresql
railway add --database redis

# 5. Deploy backend
cd backend
railway up

# 6. Deploy frontend  
cd ../frontend
railway up

# 7. Ejecutar migraciones
railway run npx prisma migrate deploy

# 8. Ver logs
railway logs
```

## 📝 Checklist Pre-Deploy

- [ ] Cuenta de Railway creada
- [ ] Railway CLI instalado
- [ ] PostgreSQL agregado al proyecto
- [ ] Redis agregado al proyecto
- [ ] Variables de entorno configuradas
- [ ] Google OAuth redirect URI actualizada
- [ ] Build scripts actualizados en package.json
- [ ] Dockerfile optimizado (si usas Docker)

## 🐛 Troubleshooting

### Error: "Port already in use"
Railway asigna el puerto automáticamente via `$PORT`. Asegúrate que tu app usa:
```javascript
const PORT = process.env.PORT || 3001;
```

### Error: Prisma Client not generated
Agrega `postinstall` script:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### WhatsApp no guarda sesiones
Verifica que la carpeta `whatsapp-sessions` esté en el mismo nivel que tu código (no en /tmp).

## 🔗 Links Útiles

- [Railway Docs](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord](https://discord.gg/railway)
- [Prisma + Railway](https://docs.railway.app/databases/postgresql#use-prisma)

## 💡 Tip Pro

Conecta tu repo de GitHub a Railway para:
- ✅ Auto-deploy en cada push
- ✅ Preview deployments para PRs
- ✅ Rollback fácil
- ✅ Logs persistentes
