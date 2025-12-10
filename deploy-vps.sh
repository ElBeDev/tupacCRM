#!/bin/bash

# Script de despliegue para TupacCRM en VPS
# Servidor: 72.62.11.244

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de TupacCRM en VPS..."

VPS_HOST="root@72.62.11.244"
APP_DIR="/var/www/tupaccrm"
DOMAIN="tupaccrm.com"  # Cambia esto por tu dominio

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Paso 1: Instalando dependencias en el VPS...${NC}"

ssh $VPS_HOST << 'ENDSSH'
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Instalar Nginx
apt install -y nginx certbot python3-certbot-nginx

# Instalar Git
apt install -y git

echo "✅ Dependencias instaladas"
ENDSSH

echo -e "${GREEN}✅ Dependencias instaladas${NC}"

echo -e "${YELLOW}📁 Paso 2: Creando estructura de directorios...${NC}"

ssh $VPS_HOST << ENDSSH
# Crear directorio de la aplicación
mkdir -p $APP_DIR
mkdir -p /var/log/tupaccrm

# Crear directorio para persistencia de PostgreSQL
mkdir -p /var/lib/postgresql/tupaccrm

echo "✅ Directorios creados"
ENDSSH

echo -e "${GREEN}✅ Directorios creados${NC}"

echo -e "${YELLOW}📤 Paso 3: Subiendo archivos al VPS...${NC}"

# Excluir node_modules y archivos innecesarios
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude 'whatsapp-sessions' \
  --exclude 'web' \
  ./ $VPS_HOST:$APP_DIR/

echo -e "${GREEN}✅ Archivos subidos${NC}"

echo -e "${YELLOW}🔧 Paso 4: Creando archivo .env en el VPS...${NC}"

ssh $VPS_HOST << ENDSSH
cd $APP_DIR

# Crear .env para el backend
cat > backend/.env << 'EOF'
# Database
DATABASE_URL="postgresql://tupaccrm:TupacCrm2025Secure!@postgres:5432/tupaccrm?schema=public"

# JWT
JWT_SECRET="tupaccrm_super_secret_key_2025_change_in_production"

# Frontend URL
FRONTEND_URL="http://72.62.11.244:3000"
CORS_ORIGIN="http://72.62.11.244:3000,http://localhost:3000"

# Server
PORT=3001
NODE_ENV=production

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OpenAI (Opcional)
OPENAI_API_KEY=""
EOF

# Crear .env para el frontend
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://72.62.11.244:3001
NEXT_PUBLIC_WS_URL=ws://72.62.11.244:3001
EOF

echo "✅ Archivos .env creados"
ENDSSH

echo -e "${GREEN}✅ Configuración creada${NC}"

echo -e "${YELLOW}🐳 Paso 5: Configurando Docker...${NC}"

ssh $VPS_HOST << ENDSSH
cd $APP_DIR

# Crear docker-compose.yml si no existe
if [ ! -f docker-compose.yml ]; then
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tupaccrm-postgres
    environment:
      POSTGRES_USER: tupaccrm
      POSTGRES_PASSWORD: TupacCrm2025Secure!
      POSTGRES_DB: tupaccrm
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - tupaccrm-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tupaccrm-backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://tupaccrm:TupacCrm2025Secure!@postgres:5432/tupaccrm?schema=public
      - JWT_SECRET=tupaccrm_super_secret_key_2025_change_in_production
      - PORT=3001
      - NODE_ENV=production
      - FRONTEND_URL=http://72.62.11.244:3000
      - CORS_ORIGIN=http://72.62.11.244:3000,http://localhost:3000
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - tupaccrm-network
    volumes:
      - ./backend/whatsapp-sessions:/app/whatsapp-sessions

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: tupaccrm-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://72.62.11.244:3001
      - NEXT_PUBLIC_WS_URL=ws://72.62.11.244:3001
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - tupaccrm-network

volumes:
  postgres_data:

networks:
  tupaccrm-network:
    driver: bridge
EOF
fi

echo "✅ Docker configurado"
ENDSSH

echo -e "${GREEN}✅ Docker configurado${NC}"

echo -e "${YELLOW}🏗️  Paso 6: Construyendo e iniciando contenedores...${NC}"

ssh $VPS_HOST << ENDSSH
cd $APP_DIR

# Detener contenedores existentes
docker-compose down 2>/dev/null || true

# Construir e iniciar
docker-compose up -d --build

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Ejecutar migraciones de Prisma
docker-compose exec -T backend npx prisma migrate deploy || echo "⚠️  Migraciones pendientes, ejecutar manualmente"
docker-compose exec -T backend npx prisma generate || echo "⚠️  Generar cliente Prisma manualmente"

echo "✅ Contenedores iniciados"
ENDSSH

echo -e "${GREEN}✅ Contenedores iniciados${NC}"

echo -e "${YELLOW}🔧 Paso 7: Configurando Nginx...${NC}"

ssh $VPS_HOST << ENDSSH
# Crear configuración de Nginx
cat > /etc/nginx/sites-available/tupaccrm << 'EOF'
server {
    listen 80;
    server_name 72.62.11.244;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3001/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/tupaccrm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configurado"
ENDSSH

echo -e "${GREEN}✅ Nginx configurado${NC}"

echo -e "${YELLOW}🔥 Paso 8: Configurando Firewall...${NC}"

ssh $VPS_HOST << ENDSSH
# Configurar UFW
ufw --force enable
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw reload

echo "✅ Firewall configurado"
ENDSSH

echo -e "${GREEN}✅ Firewall configurado${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📱 URLs de acceso:${NC}"
echo -e "   Frontend: ${GREEN}http://72.62.11.244${NC}"
echo -e "   Backend:  ${GREEN}http://72.62.11.244:3001${NC}"
echo ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo -e "   Ver logs:        ${GREEN}ssh $VPS_HOST 'cd $APP_DIR && docker-compose logs -f'${NC}"
echo -e "   Reiniciar:       ${GREEN}ssh $VPS_HOST 'cd $APP_DIR && docker-compose restart'${NC}"
echo -e "   Detener:         ${GREEN}ssh $VPS_HOST 'cd $APP_DIR && docker-compose down'${NC}"
echo -e "   Estado:          ${GREEN}ssh $VPS_HOST 'cd $APP_DIR && docker-compose ps'${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "   1. Configurar dominio DNS apuntando a 72.62.11.244"
echo "   2. Instalar certificado SSL: ssh $VPS_HOST 'certbot --nginx -d tudominio.com'"
echo "   3. Configurar variables de entorno de producción"
echo ""
