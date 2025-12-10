#!/bin/bash

# Script de utilidades para TupacCRM en VPS
# Uso: ./vps-utils.sh [comando]

VPS_HOST="root@72.62.11.244"
APP_DIR="/var/www/tupaccrm"

case "$1" in
  logs)
    echo "📋 Mostrando logs (Ctrl+C para salir)..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose logs -f"
    ;;
    
  logs-backend)
    echo "📋 Mostrando logs del backend..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose logs -f backend"
    ;;
    
  logs-frontend)
    echo "📋 Mostrando logs del frontend..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose logs -f frontend"
    ;;
    
  status)
    echo "📊 Estado de los contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose ps"
    ;;
    
  restart)
    echo "🔄 Reiniciando contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose restart"
    echo "✅ Reinicio completado"
    ;;
    
  restart-backend)
    echo "🔄 Reiniciando backend..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose restart backend"
    echo "✅ Backend reiniciado"
    ;;
    
  restart-frontend)
    echo "🔄 Reiniciando frontend..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose restart frontend"
    echo "✅ Frontend reiniciado"
    ;;
    
  stop)
    echo "🛑 Deteniendo contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose down"
    echo "✅ Contenedores detenidos"
    ;;
    
  start)
    echo "▶️  Iniciando contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose up -d"
    echo "✅ Contenedores iniciados"
    ;;
    
  rebuild)
    echo "🏗️  Reconstruyendo e iniciando contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose down && docker-compose up -d --build"
    echo "✅ Reconstrucción completada"
    ;;
    
  migrate)
    echo "🗄️  Ejecutando migraciones de base de datos..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose exec backend npx prisma migrate deploy"
    ;;
    
  seed)
    echo "🌱 Ejecutando seed de base de datos..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose exec backend npx prisma db seed"
    ;;
    
  shell)
    echo "🐚 Abriendo shell en el contenedor..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose exec backend sh"
    ;;
    
  shell-db)
    echo "🗄️  Abriendo shell de PostgreSQL..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose exec postgres psql -U tupaccrm -d tupaccrm"
    ;;
    
  deploy)
    echo "🚀 Desplegando cambios..."
    echo "📤 Subiendo archivos..."
    rsync -avz --progress \
      --exclude 'node_modules' \
      --exclude '.next' \
      --exclude 'dist' \
      --exclude '.git' \
      --exclude 'whatsapp-sessions' \
      --exclude 'web' \
      ./ $VPS_HOST:$APP_DIR/
    
    echo "🏗️  Reconstruyendo contenedores..."
    ssh $VPS_HOST "cd $APP_DIR && docker-compose up -d --build"
    
    echo "✅ Despliegue completado"
    ;;
    
  ssh)
    echo "🔐 Conectando al VPS..."
    ssh $VPS_HOST
    ;;
    
  update-env)
    echo "📝 Actualizando variables de entorno..."
    if [ -f ".env" ]; then
      scp .env $VPS_HOST:$APP_DIR/backend/.env
      echo "✅ Variables de entorno actualizadas"
      echo "🔄 Reiniciando backend..."
      ssh $VPS_HOST "cd $APP_DIR && docker-compose restart backend"
    else
      echo "❌ No se encontró el archivo .env"
    fi
    ;;
    
  backup-db)
    echo "💾 Creando backup de la base de datos..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    ssh $VPS_HOST "cd $APP_DIR && docker-compose exec -T postgres pg_dump -U tupaccrm tupaccrm" > $BACKUP_FILE
    echo "✅ Backup guardado en: $BACKUP_FILE"
    ;;
    
  restore-db)
    if [ -z "$2" ]; then
      echo "❌ Uso: ./vps-utils.sh restore-db <archivo_backup.sql>"
      exit 1
    fi
    echo "📥 Restaurando base de datos desde $2..."
    cat $2 | ssh $VPS_HOST "cd $APP_DIR && docker-compose exec -T postgres psql -U tupaccrm tupaccrm"
    echo "✅ Base de datos restaurada"
    ;;
    
  clean)
    echo "🧹 Limpiando recursos Docker..."
    ssh $VPS_HOST "docker system prune -af --volumes"
    echo "✅ Limpieza completada"
    ;;
    
  stats)
    echo "📊 Estadísticas de recursos..."
    ssh $VPS_HOST "docker stats --no-stream"
    ;;
    
  help|*)
    echo "🔧 Utilidades para TupacCRM VPS"
    echo ""
    echo "Uso: ./vps-utils.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  logs             - Ver logs de todos los contenedores"
    echo "  logs-backend     - Ver logs del backend"
    echo "  logs-frontend    - Ver logs del frontend"
    echo "  status           - Ver estado de los contenedores"
    echo "  restart          - Reiniciar todos los contenedores"
    echo "  restart-backend  - Reiniciar solo el backend"
    echo "  restart-frontend - Reiniciar solo el frontend"
    echo "  stop             - Detener todos los contenedores"
    echo "  start            - Iniciar todos los contenedores"
    echo "  rebuild          - Reconstruir e iniciar contenedores"
    echo "  migrate          - Ejecutar migraciones de Prisma"
    echo "  seed             - Ejecutar seed de base de datos"
    echo "  shell            - Abrir shell en el backend"
    echo "  shell-db         - Abrir shell de PostgreSQL"
    echo "  deploy           - Desplegar cambios al VPS"
    echo "  ssh              - Conectar al VPS por SSH"
    echo "  update-env       - Actualizar variables de entorno"
    echo "  backup-db        - Crear backup de la base de datos"
    echo "  restore-db FILE  - Restaurar base de datos desde backup"
    echo "  clean            - Limpiar recursos Docker no utilizados"
    echo "  stats            - Ver estadísticas de recursos"
    echo "  help             - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./vps-utils.sh logs"
    echo "  ./vps-utils.sh deploy"
    echo "  ./vps-utils.sh backup-db"
    echo "  ./vps-utils.sh restore-db backup_20251210.sql"
    ;;
esac
