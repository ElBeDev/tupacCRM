# 🚀 Setup Rápido: Asistentes con Integración ERP

## ✅ Paso 1: Verificar Requisitos

```bash
cd backend

# Verificar que tienes las dependencias
npm list dotenv
npm list openai
npm list fast-xml-parser

# Si falta alguna, instalarla:
npm install dotenv openai fast-xml-parser
```

## ✅ Paso 2: Configurar Variables de Entorno

Asegúrate de tener en `backend/.env`:

```env
# OpenAI (REQUERIDO)
OPENAI_API_KEY=sk-tu-api-key-aqui

# ERP (REQUERIDO)
ERP_HOST=mytupac.mooo.com
ERP_PORT=1030
ERP_HS=DEMIURGO10-MCANET

# Base de datos (ya debería estar configurado)
DATABASE_URL=postgresql://...
```

## ✅ Paso 3: Ejecutar el Seed de Asistentes

```bash
cd backend

# Ejecutar el script
npx ts-node seed-assistants.ts
```

**Salida esperada:**
```
🤖 Creando Asistentes Especialistas...

👤 Asignando asistentes a: Admin Usuario (admin@tupaccrm.com)

📝 Creando "Consultor de Precios"...
   ✅ OpenAI ID: asst_xxxxxxxxxxxxx
   ✅ DB ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   📌 WhatsApp Responder: No

📝 Creando "Consultor de Stock"...
   ✅ OpenAI ID: asst_xxxxxxxxxxxxx
   ✅ DB ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   📌 WhatsApp Responder: No

📝 Creando "Gestor de Pedidos"...
   ✅ OpenAI ID: asst_xxxxxxxxxxxxx
   ✅ DB ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   📌 WhatsApp Responder: No

📝 Creando "Gestor de Reclamos"...
   ✅ OpenAI ID: asst_xxxxxxxxxxxxx
   ✅ DB ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   📌 WhatsApp Responder: No

📝 Creando "Asistente de Atención al Cliente"...
   ✅ OpenAI ID: asst_xxxxxxxxxxxxx
   ✅ DB ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   📌 WhatsApp Responder: SÍ

🎉 ¡Asistentes creados exitosamente!

📋 Resumen:
   1. Consultor de Precios - Consulta precios en el ERP
   2. Consultor de Stock - Consulta disponibilidad en el ERP
   3. Gestor de Pedidos - Valida y crea pedidos automáticamente
   4. Gestor de Reclamos - Atiende quejas y crea tickets
   5. Asistente de Atención al Cliente - Principal para WhatsApp (RESPONDER ACTIVO)

💡 Los asistentes trabajarán en equipo: el principal se apoya en los especialistas.
💡 Los especialistas de Precios y Stock consultarán el ERP REAL automáticamente.
```

## ✅ Paso 4: Verificar en el Dashboard

1. Inicia el servidor: `npm run dev`
2. Ve a `http://localhost:3000/dashboard/testing`
3. Deberías ver los 5 asistentes creados
4. Prueba el **Consultor de Precios** con: "¿Cuánto cuesta la coca cola?"

## 🧪 Prueba Rápida del ERP

Para verificar que el ERP funciona:

```bash
cd backend

# Prueba desde terminal
node -e "
require('dotenv').config();
const erpService = require('./src/services/erp.service').default;

(async () => {
  try {
    console.log('🔍 Buscando productos con \"coca\"...');
    const products = await erpService.searchProductsByName('coca');
    console.log('✅ Encontrados:', products.length, 'productos');
    
    if (products.length > 0) {
      console.log('\n📦 Primer producto:');
      console.log(erpService.formatProductInfo(products[0]));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
"
```

## ❗ Errores Comunes

### Error: "OPENAI_API_KEY no configurada"
**Solución**: Agrega tu API key de OpenAI en el archivo `.env`

### Error: "No se encontró un usuario ADMIN"
**Solución**: Ejecuta primero el seed principal:
```bash
npx prisma db seed
```

### Error: "Timeout: El servidor no respondió"
**Solución**: Verifica que el ERP esté accesible:
```bash
nc -zv mytupac.mooo.com 1030
```

### Error: Ya existen los asistentes
**Solución**: El script salta automáticamente los asistentes que ya existen. Si quieres recrearlos:
```bash
# Eliminar desde el dashboard o manualmente desde la base de datos
```

## 📚 Siguiente Paso

Lee la documentación completa: [MULTI_AGENT_ERP_GUIDE.md](./MULTI_AGENT_ERP_GUIDE.md)

## 🎯 ¿Qué hace cada asistente?

| Asistente | Función | Conecta al ERP | Crea en Sistema |
|-----------|---------|----------------|-----------------|
| Consultor de Precios | Consulta precios | ✅ Sí | ❌ No |
| Consultor de Stock | Consulta disponibilidad | ✅ Sí | ❌ No |
| Gestor de Pedidos | Procesa pedidos | ❌ No | ✅ Crea Orders |
| Gestor de Reclamos | Atiende quejas | ❌ No | ✅ Crea Tickets |
| Atención al Cliente | Principal WhatsApp | ➡️ Consulta otros | ❌ No (coordina) |

¡Listo! Tu sistema multi-agente con ERP está configurado 🚀
