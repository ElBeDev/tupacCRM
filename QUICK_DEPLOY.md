# ⚡ Quick Start: Despliegue Rápido

## 🎯 Situación Actual
- ✅ **Backend en Render**: Funcionando
- ❌ **Frontend en Vercel**: A configurar

---

## 🚀 Pasos Rápidos (5 minutos)

### 1️⃣ Backend ya está en Render

Solo asegúrate de tener estas variables:

```env
FRONTEND_URL=https://tupaccrm.vercel.app
CORS_ORIGIN=https://tupaccrm.vercel.app,https://*.vercel.app
```

### 2️⃣ Deploy Frontend en Vercel

1. Ve a https://vercel.com/new
2. Import repositorio `tupacCRM`
3. Configura:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
   - **Build**: `npm run build`

4. Agrega variables:
   - `NEXT_PUBLIC_API_URL` = `https://TU-BACKEND.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://TU-BACKEND.onrender.com`

5. Click **Deploy**

### 3️⃣ Actualiza Backend

En Render, actualiza:
```env
FRONTEND_URL=https://TU-APP.vercel.app
```

---

## ✅ Verificar

1. Abre tu URL de Vercel
2. F12 → Console (no debe haber errores de CORS)
3. Prueba login

---

## 🐛 ¿Problemas?

**Error de CORS:**
- Verifica `FRONTEND_URL` en Render
- Redeploy backend en Render

**Variables no funcionan:**
- Verifica que tengan prefijo `NEXT_PUBLIC_`
- Redeploy en Vercel

**Build falla:**
- Verifica Root Directory = `frontend`
- Run `npm run build` localmente primero

---

## 📚 Guías Completas

- **Detallada**: `VERCEL_MONOREPO_SETUP.md`
- **Backend**: `RENDER_DEPLOYMENT.md` (si existe)
- **Troubleshooting**: Ver sección completa en guía detallada

---

**URLs después del deploy:**
- Frontend: `https://tupaccrm.vercel.app`
- Backend: `https://tupaccrm-backend.onrender.com`
