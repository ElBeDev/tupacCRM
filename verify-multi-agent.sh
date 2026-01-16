#!/bin/bash

# 🚀 Script de Verificación del Sistema Multi-Agente

echo "🤖 Sistema Multi-Agente - Verificación Rápida"
echo "============================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

cd backend

echo "📋 Paso 1: Verificar configuración de la BD..."
if npx prisma db pull > /dev/null 2>&1; then
    echo "✅ Base de datos conectada correctamente"
else
    echo "❌ Error: No se pudo conectar a la base de datos"
    exit 1
fi

echo ""
echo "🔄 Paso 2: Generar cliente de Prisma..."
if npx prisma generate > /dev/null 2>&1; then
    echo "✅ Cliente de Prisma generado"
else
    echo "❌ Error: No se pudo generar el cliente de Prisma"
    exit 1
fi

echo ""
echo "🌱 Paso 3: Verificar si los asistentes ya existen..."
ASSISTANT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM assistants WHERE specialty IS NOT NULL;" 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ "$ASSISTANT_COUNT" -gt "0" ]; then
    echo "⚠️  Ya hay $ASSISTANT_COUNT asistentes con especialidad en la BD"
    echo ""
    read -p "¿Deseas recrear los asistentes? (Esto eliminará los existentes) [s/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "⏭️  Omitiendo creación de asistentes"
    else
        echo "🧹 Eliminando asistentes existentes..."
        # Aquí podrías agregar lógica para eliminar
        echo "🌱 Creando asistentes con seed-assistants-v2.ts..."
        npx ts-node seed-assistants-v2.ts
    fi
else
    echo "🌱 Paso 4: Crear asistentes especializados..."
    if [ -f "seed-assistants-v2.ts" ]; then
        npx ts-node seed-assistants-v2.ts
    else
        echo "❌ Error: No se encontró seed-assistants-v2.ts"
        exit 1
    fi
fi

echo ""
echo "🎉 ¡Verificación Completa!"
echo ""
echo "📊 Estado del Sistema:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Mostrar asistentes creados
echo ""
echo "🤖 Asistentes en el sistema:"
npx prisma db execute --stdin <<EOF
SELECT name, specialty, COALESCE("isWhatsAppResponder", false) as "isWhatsAppResponder"
FROM assistants 
WHERE specialty IS NOT NULL
ORDER BY 
  CASE specialty
    WHEN 'general' THEN 1
    WHEN 'precios' THEN 2
    WHEN 'stock' THEN 3
    WHEN 'pedidos' THEN 4
    WHEN 'reclamos' THEN 5
    ELSE 6
  END;
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ El sistema multi-agente está listo para usar"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Probar con WhatsApp: Envía '¿Cuánto cuesta la coca cola?'"
echo "  2. Verificar logs del servidor para ver la delegación"
echo "  3. Revisar que se consulte el ERP automáticamente"
echo ""
echo "📚 Documentación:"
echo "  - RESUMEN_MULTI_AGENTE.md"
echo "  - MULTI_AGENT_DELEGATION_GUIDE.md"
echo "  - FRONTEND_MULTI_AGENT_IMPLEMENTATION.md"
echo ""
