#!/bin/bash

# Script para probar asistentes desde la VPS
# Uso: ./test-assistant-vps.sh "Nombre Asistente" "Pregunta"

if [ $# -lt 2 ]; then
    echo "🤖 Test de Asistentes en VPS"
    echo ""
    echo "Uso: ./test-assistant-vps.sh \"<nombre-asistente>\" \"<pregunta>\""
    echo ""
    echo "Ejemplos:"
    echo "  ./test-assistant-vps.sh \"Precios\" \"cuanto cuesta la coca cola\""
    echo "  ./test-assistant-vps.sh \"Stock\" \"hay pepsi?\""
    echo "  ./test-assistant-vps.sh \"Pedidos\" \"quiero 10 cajas de coca\""
    echo ""
    exit 0
fi

ASSISTANT_NAME="$1"
QUESTION="$2"

echo "🚀 Conectando a VPS y ejecutando test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh root@72.62.11.244 << ENDSSH
cd /var/www/tupaccrm/backend
docker-compose exec -T backend npx ts-node test-assistant.ts "$ASSISTANT_NAME" "$QUESTION"
ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test completado"
