# 🚀 Despliegue VPS - TupacCRM

## 📋 Información del Servidor

- **IP**: `72.62.11.244`
- **Dominio**: `srv1190739.hstgr.cloud`
- **Usuario**: `root`
- **Sistema**: Ubuntu 24.04 LTS
- **Acceso SSH**: Configurado con llaves públicas (sin contraseña)

## 🔐 Acceso SSH

El acceso ya está configurado con tu llave SSH. Para conectarte:

```bash
ssh root@72.62.11.244
```

No necesitas contraseña, el acceso es mediante llave pública.

## 📁 Estructura del Proyecto en el VPS

```
/var/www/tupaccrm/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.local
├── docker-compose.yml
└── logs/
```

## 🐳 Contenedores Docker

El proyecto corre con 4 contenedores:

1. **PostgreSQL** - Base de datos (puerto 5432)
2. **Redis** - Cache y sesiones (puerto 6379)
3. **Backend** - API Node.js/Express (puerto 3001)
4. **Frontend** - Next.js (puerto 3000)
## 🌐 URLs de Acceso

- **Frontend**: http://srv1190739.hstgr.cloud
- **Backend API**: http://srv1190739.hstgr.cloud/api
- **WebSocket**: ws://srv1190739.hstgr.cloud
- **Nginx**: Proxy inverso en el puerto 80

> **Nota**: También se puede acceder mediante IP: http://72.62.11.2441
- **Nginx**: Proxy inverso en el puerto 80

## 🔧 Scripts de Utilidad

Se ha creado el script `vps-utils.sh` para facilitar la gestión del VPS:

### Comandos Principales

```bash
# Ver logs de todos los servicios
./vps-utils.sh logs

# Ver logs solo del backend
./vps-utils.sh logs-backend

# Ver logs solo del frontend
./vps-utils.sh logs-frontend

# Ver estado de contenedores
./vps-utils.sh status

# Reiniciar servicios
./vps-utils.sh restart

# Detener servicios
./vps-utils.sh stop

# Iniciar servicios
./vps-utils.sh start

# Reconstruir contenedores
./vps-utils.sh rebuild

# Ejecutar migraciones
./vps-utils.sh migrate

# Ejecutar seed
./vps-utils.sh seed

# Desplegar cambios
./vps-utils.sh deploy

# Conectar por SSH
./vps-utils.sh ssh

# Backup de base de datos
./vps-utils.sh backup-db

# Restaurar base de datos
./vps-utils.sh restore-db backup_YYYYMMDD.sql

# Ver ayuda completa
./vps-utils.sh help
```

## 📦 Despliegue Inicial

El despliegue inicial se realizó con:

```bash
./deploy-vps.sh
```

Este script:
1. ✅ Instaló Node.js 20.x
2. ✅ Instaló Docker y Docker Compose
3. ✅ Instaló Nginx
4. ✅ Configuró el firewall (UFW)
5. ✅ Creó la estructura de directorios
6. ✅ Configuró variables de entorno
7. ✅ Construyó e inició los contenedores
8. ✅ Ejecutó las migraciones de Prisma
9. ✅ Configuró Nginx como proxy inverso

## 🔄 Cómo Desplegar Cambios

### Opción 1: Usando el script (Recomendado)

```bash
./vps-utils.sh deploy
```

### Opción 2: Manual

```bash
# 1. Subir archivos
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@72.62.11.244:/var/www/tupaccrm/

# 2. Reconstruir contenedores
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose up -d --build"

# 3. Ejecutar migraciones (si hay cambios en el schema)
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose exec backend npx prisma migrate deploy"
```

## 🗄️ Base de Datos

### Variables de Entorno

```env
DATABASE_URL="postgresql://tupaccrm:TupacCrm2025Secure!@postgres:5432/tupaccrm?schema=public"
```

### Acceso Directo a PostgreSQL

```bash
# Desde el VPS
docker-compose exec postgres psql -U tupaccrm -d tupaccrm

# O usando el script
./vps-utils.sh shell-db
```

### Backups

```bash
# Crear backup
./vps-utils.sh backup-db

# Restaurar backup
./vps-utils.sh restore-db backup_20251210_123456.sql
```

## 🔐 Variables de Entorno
```env
# Database
DATABASE_URL="postgresql://tupaccrm:TupacCrm2025Secure!@postgres:5432/tupaccrm?schema=public"

# JWT
JWT_SECRET="tupaccrm_super_secret_key_2025_change_in_production"

# CORS
FRONTEND_URL="http://srv1190739.hstgr.cloud"
CORS_ORIGIN="http://srv1190739.hstgr.cloud,https://srv1190739.hstgr.cloud,http://localhost:3000"

# Server
PORT=3001
NODE_ENV=production

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI (Opcional)
OPENAI_API_KEY=""
```
# OpenAI (Opcional)
### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://srv1190739.hstgr.cloud/api
NEXT_PUBLIC_WS_URL=ws://srv1190739.hstgr.cloud
```env
NEXT_PUBLIC_API_URL=http://72.62.11.244:3001
NEXT_PUBLIC_WS_URL=ws://72.62.11.244:3001
```

## 🔥 Firewall (UFW)

Puertos abiertos:
- **22** - SSH
- **80** - HTTP
- **443** - HTTPS (para cuando se configure SSL)

```bash
# Ver estado del firewall
ssh root@72.62.11.244 "ufw status"
```

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
# Todos los servicios
./vps-utils.sh logs

# Solo backend
./vps-utils.sh logs-backend

# Solo frontend
./vps-utils.sh logs-frontend
```

### Ver estadísticas de recursos

```bash
./vps-utils.sh stats
```

### Ver estado de contenedores

```bash
./vps-utils.sh status
```

## 🔧 Solución de Problemas

### Si el backend no inicia

```bash
# Ver logs
./vps-utils.sh logs-backend

# Reiniciar backend
./vps-utils.sh restart-backend

# Verificar variables de entorno
ssh root@72.62.11.244 "cat /var/www/tupaccrm/backend/.env"
```

### Si el frontend no inicia

```bash
# Ver logs
./vps-utils.sh logs-frontend

# Reiniciar frontend
./vps-utils.sh restart-frontend

# Reconstruir solo frontend
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose up -d --build frontend"
```

### Si la base de datos no conecta

```bash
# Ver logs de PostgreSQL
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose logs postgres"

# Reiniciar PostgreSQL
ssh root@72.62.11.244 "cd /var/www/tupaccrm && docker-compose restart postgres"
```

### Limpiar espacio en disco

```bash
./vps-utils.sh clean
```

## 🌐 Configurar Dominio (Próximos Pasos)

1. **Configurar DNS**: Apuntar tu dominio a `72.62.11.244`

2. **Actualizar Nginx** para usar el dominio:
   ```bash
   ssh root@72.62.11.244
   nano /etc/nginx/sites-available/tupaccrm
   # Cambiar 72.62.11.244 por tudominio.com
   nginx -t
   systemctl reload nginx
   ```

3. **Instalar certificado SSL**:
   ```bash
   ssh root@72.62.11.244 "certbot --nginx -d tudominio.com -d www.tudominio.com"
   ```

4. **Actualizar variables de entorno**:
   ```bash
   # En backend/.env
   FRONTEND_URL="https://tudominio.com"
   CORS_ORIGIN="https://tudominio.com,https://www.tudominio.com"
   
   # En frontend/.env.local
   NEXT_PUBLIC_API_URL=https://tudominio.com/api
   NEXT_PUBLIC_WS_URL=wss://tudominio.com
   ```

5. **Reiniciar servicios**:
   ```bash
   ./vps-utils.sh restart
   ```

## 📝 Notas Importantes

- ✅ El acceso SSH está configurado sin contraseña usando llaves públicas
- ✅ OpenSSL instalado correctamente para Prisma
- ✅ Nginx configurado como proxy inverso
- ✅ Firewall configurado correctamente
- ✅ Docker Compose v2 instalado
- ⚠️ Cambiar las contraseñas de producción antes de usar en producción real
## 🎯 Estado Actual

- [x] VPS configurado
- [x] Docker y dependencias instaladas
- [x] Aplicación desplegada
- [x] Base de datos funcionando
- [x] Migraciones aplicadas
- [x] Frontend accesible en http://srv1190739.hstgr.cloud
- [x] Backend accesible en http://srv1190739.hstgr.cloud/api
- [x] Dominio configurado (srv1190739.hstgr.cloud)
- [x] Nginx configurado como proxy inverso
- [ ] SSL/HTTPS configurado (pendiente)
- [ ] Backups automáticos configurados2.11.244:3001
- [ ] Dominio configurado
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados

## 📞 Soporte

Si necesitas ayuda:

```bash
# Ver ayuda de comandos
./vps-utils.sh help

# Conectar al VPS
./vps-utils.sh ssh

# Ver logs en tiempo real
./vps-utils.sh logs
```
