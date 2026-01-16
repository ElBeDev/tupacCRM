# Sistema Multi-Agente - Guía de Delegación entre Asistentes

## 🎯 Descripción General

TupacCRM ahora implementa un **sistema multi-agente** donde los asistentes pueden delegar tareas a otros asistentes especializados. Esto permite que el asistente principal de atención al cliente se apoye en expertos para dar respuestas más precisas.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│         Asistente de Atención al Cliente            │
│              (Asistente Principal)                   │
│                 specialty: general                   │
└─────────────────────┬───────────────────────────────┘
                      │ Delega según intención
                      │
    ┌─────────────────┼─────────────────┬──────────────┐
    │                 │                 │              │
    ▼                 ▼                 ▼              ▼
┌─────────┐     ┌─────────┐     ┌──────────┐   ┌──────────┐
│Consultor│     │Consultor│     │ Gestor   │   │ Gestor   │
│   de    │     │   de    │     │   de     │   │   de     │
│ Precios │     │  Stock  │     │ Pedidos  │   │ Reclamos │
│specialty│     │specialty│     │ specialty│   │ specialty│
│: precios│     │: stock  │     │: pedidos │   │: reclamos│
└─────────┘     └─────────┘     └──────────┘   └──────────┘
     │               │                │              │
     └───────────────┴────────────────┴──────────────┘
                      │
                 Consultan ERP
```

## 📊 Campos Nuevos en la Base de Datos

### Modelo `Assistant`

```prisma
model Assistant {
  // ... campos existentes ...
  
  delegatesTo  String[]  // IDs de asistentes a los que puede delegar/consultar
  specialty    String?   // Especialidad del asistente
  
  // Valores de specialty:
  // - 'general': Asistente principal/conversacional
  // - 'precios': Especialista en consultas de precios (consulta ERP)
  // - 'stock': Especialista en disponibilidad (consulta ERP)
  // - 'pedidos': Especialista en procesar pedidos
  // - 'reclamos': Especialista en atender quejas
  // - 'erp': Especialista directo en consultas al ERP
}
```

## 🔄 Flujo de Delegación

### 1. Cliente envía mensaje
```
"¿Cuánto cuesta la coca cola?"
```

### 2. Sistema detecta intención
```typescript
// smart-tag.service.ts detecta: 'consulta_precio'
const intent = await smartTagService.detectIntent(message, history);
// intent = 'consulta_precio'
```

### 3. Asistente Principal delega
```typescript
// assistant.service.ts - método consultSpecialist()
const specialist = await prisma.assistant.findFirst({
  where: { 
    specialty: 'precios',  // Mapea 'consulta_precio' -> 'precios'
    isActive: true 
  }
});
```

### 4. Especialista consulta ERP
```typescript
// El especialista de precios automáticamente consulta el ERP
const erpProducts = await this.queryERPForProducts(message);
// Obtiene: Coca Cola 2.25L - $2,795.87 - Stock: 960
```

### 5. Respuesta al cliente
```
"💰 La Coca Cola 2.25L tiene un precio de $2,795.87. 
Tenemos 960 unidades disponibles. ¿Te interesa?"
```

## 🛠️ Configuración de Asistentes

### Crear asistentes con el script de seed

```bash
cd backend
npx ts-node seed-assistants-v2.ts
```

Este script:
1. Crea 5 asistentes especializados
2. Configura sus especialidades
3. Configura el asistente principal para que delegue a todos los especialistas

### Mapeo de Intenciones a Especialidades

```typescript
const intentToSpecialty: Record<string, string> = {
  'consulta_precio': 'precios',
  'consulta_stock': 'stock',
  'pedido': 'pedidos',
  'pedido_incompleto': 'pedidos',
  'confirmacion': 'pedidos',
  'reclamo': 'reclamos',
};
```

## 📡 API Endpoints

### 1. Obtener especialistas disponibles
```http
GET /api/assistants/:id/available-specialists
```

**Respuesta:**
```json
[
  {
    "id": "abc123",
    "name": "Consultor de Precios",
    "description": "Especialista en consultas de precios...",
    "specialty": "precios",
    "isActive": true
  },
  // ... más especialistas
]
```

### 2. Configurar delegación
```http
PUT /api/assistants/:id/delegates
Content-Type: application/json

{
  "delegatesTo": ["abc123", "def456", "ghi789"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Delegation configuration updated",
  "delegatesTo": ["abc123", "def456", "ghi789"]
}
```

### 3. Crear asistente con delegación
```http
POST /api/assistants
Content-Type: application/json

{
  "name": "Mi Asistente",
  "instructions": "...",
  "specialty": "general",
  "delegatesTo": ["abc123", "def456"]
}
```

### 4. Actualizar asistente (incluye delegación)
```http
PUT /api/assistants/:id
Content-Type: application/json

{
  "name": "Mi Asistente Actualizado",
  "specialty": "precios",
  "delegatesTo": ["xyz789"]
}
```

## 🎨 Interfaz de Usuario (Frontend)

### Sección de Configuración de Asistente

```typescript
// En el formulario de edición del asistente:
interface AssistantForm {
  name: string;
  description: string;
  instructions: string;
  model: string;
  temperature: number;
  specialty: string;  // Dropdown: general, precios, stock, pedidos, reclamos, erp
  delegatesTo: string[];  // Multi-select de otros asistentes
}
```

### Componente de Delegación

```tsx
<Card>
  <CardHeader>
    <CardTitle>Delegación de Tareas</CardTitle>
    <CardDescription>
      Selecciona a qué asistentes puede consultar este asistente
    </CardDescription>
  </CardHeader>
  <CardContent>
    <MultiSelect
      label="Asistentes Especialistas"
      options={availableSpecialists}
      value={delegatesTo}
      onChange={setDelegatesTo}
    />
  </CardContent>
</Card>
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Consulta de Precio

**Cliente:** "¿Cuánto cuesta la coca cola?"

**Flujo:**
1. ✅ Asistente Principal recibe el mensaje
2. 🔍 Detecta intención: `consulta_precio`
3. 🤝 Delega a: Consultor de Precios (`specialty: precios`)
4. 📊 Consultor de Precios consulta ERP
5. 💬 Asistente Principal responde con los datos del ERP

### Ejemplo 2: Pedido

**Cliente:** "Quiero 10 cajas de coca cola"

**Flujo:**
1. ✅ Asistente Principal recibe el mensaje
2. 🔍 Detecta intención: `pedido`
3. 🤝 Delega a: Gestor de Pedidos (`specialty: pedidos`)
4. 📝 Gestor de Pedidos valida información
5. ✅ Si es válido, crea el pedido automáticamente
6. 💬 Asistente Principal informa: "Tu pedido #12345 fue registrado"

### Ejemplo 3: Reclamo

**Cliente:** "El producto llegó en mal estado"

**Flujo:**
1. ✅ Asistente Principal recibe el mensaje
2. 🔍 Detecta intención: `reclamo`
3. 🤝 Delega a: Gestor de Reclamos (`specialty: reclamos`)
4. 📋 Gestor de Reclamos crea ticket automáticamente
5. 💬 Asistente Principal responde con empatía y número de ticket

## 🔧 Personalización

### Crear un Asistente Especializado Personalizado

```typescript
// 1. Crear el asistente con specialty personalizada
const specialist = await assistantService.createAssistant(userId, {
  name: 'Consultor de Envíos',
  specialty: 'envios',
  description: 'Especialista en consultas de envío y logística',
  instructions: `Eres un especialista en envíos...`,
  model: 'gpt-4o-mini',
  temperature: 0.3,
});

// 2. Agregar mapeo de intención en assistant.service.ts
const intentToSpecialty: Record<string, string> = {
  // ... existentes ...
  'consulta_envio': 'envios',  // Nueva intención
};

// 3. Configurar el asistente principal para que delegue
await assistantService.updateAssistant(mainAssistantId, userId, {
  delegatesTo: [...existingDelegates, specialist.id]
});
```

## 🚀 Ventajas del Sistema Multi-Agente

### ✅ Ventajas

1. **Especialización**: Cada asistente es experto en su área
2. **Modularidad**: Fácil agregar nuevos especialistas
3. **Precisión**: Respuestas más exactas usando expertos
4. **Mantenibilidad**: Más fácil actualizar prompts específicos
5. **Escalabilidad**: Nuevos especialistas sin afectar el principal
6. **Integración ERP**: Los especialistas consultan datos reales
7. **Automatización**: Pedidos y tickets se crean automáticamente

### 📈 Casos de Uso

- **E-commerce**: Consultas de productos, precios, stock, pedidos
- **Soporte**: Reclamos, tickets, seguimiento
- **Ventas**: Cotizaciones, disponibilidad, cierre de ventas
- **Logística**: Seguimiento de envíos, tiempos de entrega
- **Finanzas**: Facturación, pagos, créditos

## 📝 Notas Importantes

1. **Transparencia**: El cliente NO debe notar que hay múltiples asistentes
2. **Velocidad**: La delegación es automática y rápida
3. **Contexto**: El especialista recibe el mensaje completo del cliente
4. **Datos Reales**: Los especialistas de ERP consultan datos en tiempo real
5. **Fallback**: Si no hay especialista, el asistente principal responde solo

## 🔐 Seguridad

- Los asistentes solo pueden delegar a otros del mismo usuario
- La configuración `delegatesTo` es privada por usuario
- Los datos del ERP se pasan de forma segura entre asistentes

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración de BD: `npx prisma migrate dev`
2. ✅ Ejecutar seed de asistentes: `npx ts-node seed-assistants-v2.ts`
3. 🔄 Actualizar UI del frontend para configurar delegación
4. 🧪 Probar el sistema multi-agente con casos reales
5. 📊 Monitorear y optimizar los prompts de los especialistas

## 📚 Referencias

- `backend/src/services/assistant.service.ts` - Lógica de delegación
- `backend/src/routes/assistants.ts` - Endpoints de API
- `backend/prisma/schema.prisma` - Modelo de datos
- `backend/seed-assistants-v2.ts` - Script de inicialización
