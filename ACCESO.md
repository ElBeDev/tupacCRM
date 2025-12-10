# 🌐 Acceso a TupacCRM

## URLs Principales

### 🖥️ Producción (VPS)
- **Frontend**: http://srv1190739.hstgr.cloud
- **Backend API**: http://srv1190739.hstgr.cloud/api
- **WebSocket**: ws://srv1190739.hstgr.cloud

### 🔢 Acceso por IP (Alternativo)
- **IP del servidor**: 72.62.11.244
- **Acceso directo**: http://72.62.11.244

### 💻 Desarrollo Local
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🚀 Inicio Rápido

### Para usar la aplicación desplegada:
1. Abre tu navegador
2. Ve a: http://srv1190739.hstgr.cloud
3. Regístrate o inicia sesión

### Para desarrollo local:
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 🔐 Acceso SSH al VPS

```bash
# El acceso ya está configurado sin contraseña
ssh root@72.62.11.244

# O usando el dominio
ssh root@srv1190739.hstgr.cloud
```

## 🛠️ Gestión del VPS

Usa el script de utilidades:

```bash
# Ver todos los comandos disponibles
./vps-utils.sh help

# Ver logs
./vps-utils.sh logs

# Reiniciar servicios
./vps-utils.sh restart

# Desplegar cambios
./vps-utils.sh deploy
```

## 📱 Características Disponibles

- ✅ Gestión de contactos
- ✅ Conversaciones y chat
- ✅ Pipeline de ventas
- ✅ Calendario
- ✅ Integración con WhatsApp
- ✅ Integración con Google Sheets
- ✅ Integración con Google Calendar
- ✅ Gestión de órdenes
- ✅ Panel de análisis
- ✅ Configuración de conexiones

## 🔒 Seguridad

- SSH configurado con llaves públicas (sin contraseña)
- Firewall UFW activo
- Puertos abiertos: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Variables de entorno seguras

## 📚 Documentación Completa

Para información detallada sobre el VPS, consulta:
- [VPS_SETUP.md](VPS_SETUP.md) - Configuración completa del servidor

## 🐛 Solución de Problemas

### El sitio no carga
```bash
# Verificar estado de contenedores
./vps-utils.sh status

# Ver logs
./vps-utils.sh logs

# Reiniciar servicios
./vps-utils.sh restart
```

### Error de conexión a la API
```bash
# Verificar logs del backend
./vps-utils.sh logs-backend

# Verificar configuración de Nginx
ssh root@72.62.11.244 "nginx -t"
```

### Actualizar configuración
```bash
# Después de cambiar .env
./vps-utils.sh update-env
```

## 📞 Soporte

- Documentación: Ver archivos .md en el repositorio
- Logs: `./vps-utils.sh logs`
- Estado: `./vps-utils.sh status`
