# 🤖 Sistema Multi-Agente con Integración ERP

## 📋 ¿Qué se implementó?

El sistema ahora tiene **asistentes especialistas que consultan el ERP REAL** para dar información precisa a los clientes.

---

## 🏗️ Arquitectura

```
CLIENTE (WhatsApp)
      ↓
"¿Cuánto cuesta la Coca Cola?"
      ↓
🤖 ASISTENTE PRINCIPAL (Atención al Cliente)
      ↓
🏷️ Detecta intención: "consulta_precio"
      ↓
🔗 Consulta al ESPECIALISTA: "Consultor de Precios"
      ↓
📊 CONSULTOR DE PRECIOS
      ├─ Extrae nombre del producto con IA
      ├─ Consulta ERP (socket TCP)
      ├─ Recibe datos reales (precio, stock, promo)
      └─ Formatea información
      ↓
💬 ASISTENTE PRINCIPAL recibe la info y responde naturalmente
      ↓
"La Coca Cola 2.25L está a $2,795 💰 y tenemos promo: ¡3x2!"
```

---

## 🎯 Asistentes Creados

### 1. **Consultor de Precios** 💰
- **Función**: Consulta precios en el ERP
- **Conecta a**: ERP vía `erp.service.ts`
- **Responde**: Precio actual, promociones activas, disponibilidad
- **Temperatura**: 0.3 (preciso)

### 2. **Consultor de Stock** 📦
- **Función**: Consulta disponibilidad en el ERP
- **Conecta a**: ERP vía `erp.service.ts`
- **Responde**: Stock disponible, unidades por bulto, tiempos de reposición
- **Temperatura**: 0.3 (preciso)

### 3. **Gestor de Pedidos** 📝
- **Función**: Valida y crea pedidos automáticamente
- **Formato**: Responde en JSON
- **Acción**: Si el pedido es válido, lo **crea en el sistema**
- **Temperatura**: 0.2 (muy preciso)

### 4. **Gestor de Reclamos** 🎫
- **Función**: Atiende quejas con empatía
- **Acción**: Crea **tickets de soporte** automáticamente
- **Temperatura**: 0.5 (empático pero profesional)

### 5. **Asistente de Atención al Cliente** 🌟
- **Función**: Principal para WhatsApp (marca `isWhatsAppResponder: true`)
- **Estilo**: Conversacional, amigable, cercano
- **Coordina**: Consulta a los especialistas según la necesidad
- **Temperatura**: 0.7 (natural y conversacional)

---

## 🚀 Instalación y Uso

### 1. Crear los Asistentes

```bash
cd backend

# Ejecutar el script de seed
npx ts-node seed-assistants.ts
```

Este script:
- ✅ Crea los 5 asistentes en OpenAI
- ✅ Los guarda en tu base de datos
- ✅ Configura el "Asistente de Atención al Cliente" como WhatsApp Responder
- ✅ Asocia todos al usuario ADMIN

### 2. Verificar la Configuración

```bash
# Asegúrate de tener estas variables en .env
OPENAI_API_KEY=sk-tu-api-key
ERP_HOST=mytupac.mooo.com
ERP_PORT=1030
ERP_HS=DEMIURGO10-MCANET
```

### 3. Probar en el Dashboard

1. Ve a **Dashboard → Pruebas** (`/dashboard/testing`)
2. Deberías ver los 5 asistentes creados
3. Prueba el **Consultor de Precios**:
   - Mensaje: "¿Cuánto cuesta la Coca Cola?"
   - Debería consultar el ERP y responder con precio real

---

## 🔄 Flujo de Integración ERP

### Cuando un cliente pregunta por un producto:

**1. Mensaje entrante:**
```
Cliente: "Cuánto sale la coca cola 2.25?"
```

**2. Detección de intención:**
```javascript
🏷️ Smart Tags detecta: "consulta_precio"
```

**3. Consulta al especialista:**
```javascript
consultSpecialist('consulta_precio', 'Cuánto sale la coca cola 2.25?')
  ↓
Busca asistente: "Consultor de Precios"
  ↓
Extrae producto con IA: "coca cola"
  ↓
Consulta ERP: searchProductsByName('coca cola')
```

**4. Conexión al ERP:**
```xml
<!-- Envía al ERP -->
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <hs>DEMIURGO10-MCANET</hs>
  <service>PROGRAM</service>
  <nombre>coca cola</nombre>
  <program>Interfaz_CRM_ERP_Articulo</program>
</document>
```

**5. Respuesta del ERP:**
```xml
<document>
  <id>000000102</id>
  <nombre>COCA COLA X2.25LT</nombre>
  <precio_normal>2795,8680</precio_normal>
  <stock>000000960</stock>
  <AccionPromoItem>24900010000</AccionPromoItem>
  <promo_lleva>00003</promo_lleva>
  <promo_paga>00002</promo_paga>
  ...
</document>
```

**6. Formateo automático:**
```markdown
📦 **COCA COLA X2.25LT**
   ID: 000000102
   SKU: 7790895000997
   Departamento: GASEOSA
   Familia: BEBIDAS SIN ALCOHOL

💰 **Precios:**
   Precio Normal: **$2,795.87**
   Precio Mayorista: $2,500.00

🎁 **PROMOCIÓN ACTIVA:**
   Lleva 3 y paga 2
   Precio promocional: $1,863.25

📊 **Disponibilidad:**
   ✅ Stock: 960 unidades disponibles
   Unidades por bulto: 48
```

**7. Respuesta al cliente:**
```
Asistente Principal: "La Coca Cola 2.25L está a $2,795 💰 
¡Tenemos promo activa! Llevás 3 y pagás 2 🎁 
Hay 960 unidades disponibles. ¿Te interesa?"
```

---

## 📝 Código Implementado

### 1. ERP Service (`erp.service.ts`)

**Método nuevo: `searchProductsByName`**
```typescript
async searchProductsByName(nombre: string): Promise<ERPArticleResponse[]> {
  // Construye XML con tag <nombre>
  // Envía al ERP
  // Parsea respuesta
  // Retorna array de productos
}
```

**Método nuevo: `formatProductInfo`**
```typescript
formatProductInfo(product: ERPArticleResponse): string {
  // Formatea producto para mostrar al usuario
  // Incluye: nombre, precio, stock, promociones
  // Formato markdown con emojis
}
```

### 2. Assistant Service (`assistant.service.ts`)

**Método nuevo: `queryERPForProducts`** (privado)
```typescript
private async queryERPForProducts(message: string): Promise<string | null> {
  // 1. Extrae nombres de productos con IA
  // 2. Busca en el ERP
  // 3. Formatea hasta 5 productos
  // 4. Retorna string formateado o null
}
```

**Método modificado: `consultSpecialist`**
```typescript
async consultSpecialist(intent: string, message: string, context?) {
  // Si es Consultor de Precios o Stock:
  //   → Consulta ERP
  //   → Inyecta datos en el prompt
  // 
  // El especialista recibe:
  //   "El cliente escribió: '...'"
  //   [DATOS DEL ERP]: <info formateada>
  //   "Usa esta información REAL..."
}
```

---

## 🧪 Cómo Probarlo

### Opción 1: Dashboard de Pruebas

1. Ve a `/dashboard/testing`
2. Selecciona **"Consultor de Precios"**
3. Escribe: "¿Cuánto cuesta la coca cola?"
4. El asistente debería:
   - Consultar el ERP
   - Mostrar precio real
   - Mostrar promociones si existen
   - Mostrar stock disponible

### Opción 2: WhatsApp (End-to-End)

1. Asegúrate de que WhatsApp esté conectado
2. Envía mensaje desde WhatsApp: "Hola, cuánto sale la coca?"
3. El sistema:
   - ✅ Detecta intención: `consulta_precio`
   - ✅ Asistente Principal consulta a Consultor de Precios
   - ✅ Consultor de Precios consulta el ERP
   - ✅ Responde con información real
   - ✅ Cliente recibe respuesta natural

### Opción 3: Testing Manual del ERP

```bash
cd backend
npx ts-node -e "
import erpService from './src/services/erp.service';

(async () => {
  const products = await erpService.searchProductsByName('coca');
  console.log('Productos encontrados:', products.length);
  products.forEach(p => {
    console.log(erpService.formatProductInfo(p));
  });
})();
"
```

---

## 🎯 Ventajas de Esta Implementación

### ✅ **Sin Sobreventa**
Los asistentes consultan el ERP real, por lo que:
- Precios siempre actualizados
- Stock real en tiempo real
- Promociones activas mostradas automáticamente

### ✅ **Multi-Agente Transparente**
El cliente NO sabe que hay múltiples asistentes:
- Conversación natural y fluida
- Sin menciones de "consultando con..."
- Respuestas rápidas y precisas

### ✅ **Escalable**
Fácil agregar más especialistas:
- Consultor de Envíos
- Consultor de Pagos
- Consultor Técnico
- etc.

### ✅ **Fallback Inteligente**
Si el ERP no responde:
- El asistente informa que no encontró el producto
- Ofrece alternativas
- Nunca inventa información

---

## 🔧 Mantenimiento

### Actualizar Instructions de un Asistente

```typescript
// En el dashboard o por API
await assistantService.updateAssistant(assistantId, userId, {
  instructions: 'Nuevas instrucciones...'
});
```

### Ver Logs de Consultas ERP

```bash
# En los logs del backend verás:
🔍 Buscando productos con nombre: coca
✅ Encontrados 14 productos en el ERP
📋 Productos detectados: coca cola, coca zero
```

### Agregar Nuevo Especialista

1. Agrega config en `seed-assistants.ts`
2. Agrega mapeo en `consultSpecialist`:
   ```typescript
   const intentToSpecialist: Record<string, string> = {
     'consulta_envio': 'Consultor de Envíos',
     // ...
   };
   ```
3. Ejecuta el seed: `npx ts-node seed-assistants.ts`

---

## 📚 Documentación Relacionada

- [ERP_API_GUIDE.md](./ERP_API_GUIDE.md) - Documentación completa del ERP
- [ASSISTANTS_GUIDE.md](./ASSISTANTS_GUIDE.md) - Guía de uso de asistentes
- [AI_INTEGRATION.md](./AI_INTEGRATION.md) - Integración de IA en WhatsApp

---

## 🐛 Troubleshooting

### Error: "No se encontraron productos en el ERP"
**Causa**: El término de búsqueda no coincide con ningún producto
**Solución**: Prueba con términos más genéricos ("coca" en vez de "coca cola light zero")

### Error: "Timeout: El servidor no respondió"
**Causa**: ERP no responde o está caído
**Solución**: 
1. Verifica conexión: `nc -zv mytupac.mooo.com 1030`
2. Revisa variables de entorno: `ERP_HOST`, `ERP_PORT`

### Los asistentes no se consultan entre sí
**Causa**: Smart Tags no está detectando la intención correctamente
**Solución**:
1. Verifica que `smartTagService` esté funcionando
2. Revisa logs: `🏷️ Detecting intent with Smart Tags...`
3. Verifica que existan los asistentes con los nombres exactos

---

## 🎉 Resumen

Ahora tu sistema tiene:
- ✅ 5 asistentes especializados
- ✅ Integración REAL con el ERP
- ✅ Arquitectura multi-agente transparente
- ✅ Respuestas precisas y actualizadas
- ✅ Creación automática de pedidos y tickets
- ✅ Conversaciones naturales para el cliente

**¡Los clientes obtendrán información real del ERP sin saberlo!** 🚀
