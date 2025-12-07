# 🚀 Configuración de Despliegue: Backend (Render) + Frontend (Vercel)

## 📋 Resumen

**Arquitectura de Despliegue:**
- **Backend (Node.js + Express + PostgreSQL)**: Render ✅
- **Frontend (Next.js + Chakra UI)**: Vercel ✅

Esta es la configuración recomendada porque:
- ✅ Render maneja servicios con estado (WhatsApp, WebSocket) mejor que serverless
- ✅ Vercel es óptimo para Next.js con Edge Functions
- ✅ Separación clara de responsabilidades
- ✅ Escalabilidad independiente

---

## 🎯 Paso 1: Backend en Render (Ya Configurado)

### Servicios en Render:

1. **Web Service: tupaccrm-backend**
   - Build Command: `cd backend && npm install && npx prisma generate && npm run build`
   - Start Command: `cd backend && npm start`
   - Environment: Node
   - Region: Oregon (US-West) o Virginia (US-East)

2. **PostgreSQL Database**
   - Plan: Free o Starter ($7/mes)
   - Versión: 15+

### Variables de Entorno en Render:

```env
# Database
DATABASE_URL=postgresql://... (auto-generada por Render)
REDIS_URL=redis://... (si usas Redis)

# Auth
JWT_SECRET=tu_jwt_secret_super_seguro_min_32_chars
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_min_32_chars
SESSION_SECRET=tu_session_secret_super_seguro_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_REDIRECT_URI=https://tu-backend.onrender.com/api/google/callback

# OpenAI
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
AI_MODEL=gpt-4-turbo-preview

# Environment
NODE_ENV=production
PORT=3001

# ⚠️ IMPORTANTE: CORS para Vercel
FRONTEND_URL=https://tupaccrm.vercel.app
CORS_ORIGIN=https://tupaccrm.vercel.app,https://*.vercel.app
```

### Verificar CORS en el Backend:

Asegúrate de que `backend/src/index.ts` incluya:

```typescript
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      /^https:\/\/.*\.vercel\.app$/  // Permite todos los subdominios de Vercel
    ].filter(Boolean);

    if (!origin || allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
```

---

## 🎨 Paso 2: Frontend en Vercel

### Método 1: Deploy desde Vercel Dashboard (Recomendado)

#### 2.1 Preparar Archivos de Configuración

Ya está todo listo en el proyecto. Solo necesitas desplegar.

#### 2.2 Deploy en Vercel

1. **Ir a [vercel.com/new](https://vercel.com/new)**

2. **Import Repository** y selecciona `tupacCRM`

3. **Configure Project:**
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables** (agregar 2):
   ```
   NEXT_PUBLIC_API_URL = https://tupaccrm-backend.onrender.com
   NEXT_PUBLIC_WS_URL = wss://tupaccrm-backend.onrender.com
   ```

5. **Deploy** y espera 2-3 minutos

---

## ✅ Verificación y Troubleshooting

Ver la guía completa de solución de problemas arriba en la sección "Paso 3".

---

**¡Listo! Tu app está desplegada en producción! 🎉**
- Usar almacenamiento externo (S3, DigitalOcean Spaces)
- Implementar reconexión automática
- Usar un servicio dedicado para WhatsApp

## 🐛 Solución de Problemas

### Error 404

Si obtienes error 404:
1. Verifica que el `vercel.json` esté en la raíz del proyecto
2. Revisa que las rutas en `vercel.json` estén correctas
3. Verifica los logs de build en Vercel Dashboard

### Build Fails

Si el build falla:
1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que `DATABASE_URL` esté configurada correctamente
4. Verifica que las migraciones de Prisma sean compatibles

### Variables de Entorno

Si las variables de entorno no funcionan:
1. Verifica que estén configuradas en el proyecto de Vercel
2. Asegúrate de que no tengan espacios en blanco al inicio/final
3. Re-despliega después de cambiar variables

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Database URL válida y accesible
- [ ] Redis URL válida y accesible
- [ ] Google OAuth configurado con redirect URI correcta
- [ ] OpenAI API key válida
- [ ] `vercel.json` en la raíz del proyecto
- [ ] Build exitoso en Vercel
- [ ] Frontend carga correctamente
- [ ] Backend responde en `/api/*`
- [ ] Health check funciona en `/health`
