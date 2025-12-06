# 🚀 Guía Rápida de Deployment

## Opciones de Deployment

### 1️⃣ Railway (RECOMENDADO) ⭐
**Mejor para**: Proyectos con WhatsApp, WebSockets, y file storage

```bash
# Instalar CLI
npm i -g @railway/cli

# Login y crear proyecto
railway login
railway init

# Agregar servicios
railway add --database postgresql
railway add --database redis

# Deploy
cd backend && railway up
cd frontend && railway up
```

✅ WhatsApp funciona
✅ PostgreSQL + Redis incluidos
✅ File system persistente
✅ WebSockets nativos
💰 $5/mes + uso

📖 **[Ver guía completa: RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)**

---

### 2️⃣ Vercel
**Mejor para**: Frontend/APIs sin WhatsApp

⚠️ **Limitación**: WhatsApp NO funciona en Vercel (serverless)

**Solución**: 
- Frontend + API en Vercel
- WhatsApp service en Railway/Render

📖 **[Ver guía completa: VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

---

### 3️⃣ Docker (Local/VPS)

```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## 🎯 Recomendación

Para **TupacCRM con WhatsApp**: usa **Railway**

Para **solo frontend/API**: usa **Vercel**

---

## 📋 Checklist Pre-Deploy

- [ ] Base de datos PostgreSQL
- [ ] Redis configurado
- [ ] Variables de entorno (.env.production)
- [ ] Google OAuth configurado
- [ ] OpenAI API key
- [ ] Migraciones ejecutadas

---

## 🆘 Soporte

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Problemas: Revisar logs en dashboard

---

**Siguiente paso**: Abre `RAILWAY_DEPLOYMENT.md` o `VERCEL_DEPLOYMENT.md` según tu elección.
