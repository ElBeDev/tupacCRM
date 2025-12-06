# Configuración de Despliegue en Vercel (Monorepo)

## 📋 Resumen

Este proyecto está configurado para desplegarse como un monorepo completo en Vercel, incluyendo tanto el frontend (Next.js) como el backend (Node.js/Express).

## 🚀 Pasos para Desplegar

### 1. Configurar el Proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio de GitHub: `ElBeDev/tupacCRM`
4. **NO cambies el Framework Preset** (debe detectar Next.js automáticamente)

### 2. Configurar Variables de Entorno

En la sección "Environment Variables" de tu proyecto en Vercel, agrega las siguientes variables:

#### Variables de Base de Datos
```
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://default:password@host:port
```

#### Variables de Autenticación
```
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_aqui
SESSION_SECRET=tu_session_secret_super_seguro_aqui
```

#### Variables de Google OAuth
```
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

#### Variables de OpenAI
```
OPENAI_API_KEY=sk-tu_openai_api_key_aqui
```

#### Variables de Frontend
```
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_WS_URL=wss://tu-proyecto.vercel.app
```

### 3. Configurar Build Settings

En la configuración del proyecto:
- **Framework Preset**: Next.js
- **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install && npm run vercel-build`
- **Output Directory**: `frontend/.next`
- **Install Command**: Dejar por defecto o vacío

### 4. Desplegar

1. Haz clic en "Deploy"
2. Espera a que el build se complete (puede tomar 2-5 minutos)
3. Una vez completado, tu aplicación estará disponible en la URL proporcionada

## 🔧 Estructura de Rutas

La configuración en `vercel.json` maneja las rutas de la siguiente manera:

- `/api/*` → Backend API (Express/Node.js)
- `/health` → Health check del backend
- `/*` → Frontend (Next.js)

## 📝 Notas Importantes

### Database Migrations

El backend ejecuta automáticamente las migraciones de Prisma durante el despliegue:
```bash
prisma generate && prisma migrate deploy
```

### WebSockets

⚠️ **Limitación**: Vercel Functions no soportan WebSockets persistentes. Si tu aplicación necesita WebSockets (para WhatsApp en tiempo real), considera:

1. **Opción A**: Usar Vercel para el frontend y Railway/Render para el backend
2. **Opción B**: Implementar polling en lugar de WebSockets
3. **Opción C**: Usar un servicio de WebSocket externo (Pusher, Ably)

### WhatsApp Sessions

Las sesiones de WhatsApp se perderán en cada despliegue porque Vercel Functions son stateless. Considera:
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
