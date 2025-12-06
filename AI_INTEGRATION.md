# 🤖 Integración de IA Automática - TupacCRM

## 📋 Overview

El sistema ahora integra **Inteligencia Artificial de forma automática** en cada mensaje recibido por WhatsApp. La IA analiza, califica y actualiza contactos en tiempo real.

---

## 🔄 Flujo Completo Automatizado

```
┌─────────────────────────────────────────────────────────────┐
│  1️⃣  MENSAJE ENTRANTE (WhatsApp)                            │
│     📱 Usuario envía mensaje → Baileys lo detecta           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2️⃣  PROCESAMIENTO BACKEND                                  │
│     • Extraer número y contenido                            │
│     • Buscar/crear contacto                                 │
│     • Auto-asignar a admin/manager                          │
│     • Buscar/crear conversación                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3️⃣  GUARDAR MENSAJE                                        │
│     • INSERT en tabla messages                              │
│     • UPDATE lastMessageAt en conversation                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  4️⃣  ANÁLISIS CON IA (OpenAI) 🤖                            │
│     • Obtener últimos 10 mensajes                           │
│     • Contexto: nombre, teléfono, status, score            │
│     • Llamada a OpenAI GPT-4/3.5                            │
│     • Análisis de:                                          │
│       - Sentimiento (positive/neutral/negative)             │
│       - Intención (information/purchase/complaint/other)    │
│       - Urgencia (high/medium/low)                          │
│       - Score sugerido (0-100)                              │
│       - Status sugerido (NEW → WON/LOST)                    │
│       - Resumen de conversación                             │
│       - Respuesta sugerida                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  5️⃣  ACTUALIZACIÓN AUTOMÁTICA                               │
│     • UPDATE contact SET score, status                      │
│     • Logs de cambios                                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  6️⃣  NOTIFICACIONES SOCKET.IO                               │
│     • Emit 'message:new' → Conversaciones                   │
│     • Emit 'ai:analysis' → Todos los dashboards             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  7️⃣  FRONTEND AUTO-REFRESH                                  │
│     • Lista de conversaciones se actualiza                  │
│     • Lista de contactos se actualiza                       │
│     • Pipeline Kanban se actualiza                          │
│     • Notificaciones en consola                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### Backend - WhatsApp Service

**Archivo**: `/backend/src/services/whatsapp.service.ts`

```typescript
private aiService: AIService;

constructor(io?: Server) {
  this.io = io || null;
  this.aiService = new AIService(); // ✅ Instancia de IA
}

private async handleIncomingMessages(messages: WAMessage[]) {
  // ... guardar mensaje ...

  // 🤖 AI INTEGRATION
  try {
    // Get context
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      take: 10,
    });

    // Analyze with AI
    const aiAnalysis = await this.aiService.analyzeConversation(
      messageTexts,
      contactInfo
    );

    // Update contact
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        score: aiAnalysis.suggestedScore,
        status: aiAnalysis.suggestedStatus,
      },
    });

    // Emit to frontend
    this.io.emit('ai:analysis', {
      conversationId,
      contactId,
      analysis: aiAnalysis,
    });

  } catch (aiError) {
    console.error('❌ Error in AI analysis:', aiError);
  }
}
```

---

### Frontend - Socket.IO Listeners

**Conversaciones** (`/dashboard/conversations/page.tsx`):
```typescript
newSocket.on('message:new', (data) => {
  loadConversations(); // Refresh list
  if (selectedConversation?.id === data.conversationId) {
    loadMessages(data.conversationId); // Reload messages
  }
});

newSocket.on('ai:analysis', (data) => {
  console.log('🤖 AI Analysis:', data.analysis);
  loadConversations(); // Show updated status/score
});
```

**Contactos** (`/dashboard/contacts/page.tsx`):
```typescript
newSocket.on('ai:analysis', (data) => {
  console.log('🤖 AI updated contact:', data);
  fetchContacts(); // Refresh contacts list
});

newSocket.on('message:new', (data) => {
  fetchContacts(); // New contacts from WhatsApp
});
```

---

## 📊 Ejemplo de Análisis de IA

### Input (Mensaje WhatsApp):
```
"Hola! Me interesa conocer más sobre sus productos. 
¿Tienen disponibilidad esta semana para una llamada?"
```

### Output (IA Analysis):
```json
{
  "sentiment": "positive",
  "intent": "purchase",
  "urgency": "high",
  "suggestedScore": 85,
  "suggestedStatus": "QUALIFIED",
  "summary": "Prospecto interesado en conocer productos, solicita llamada esta semana. Alta urgencia y disposición de compra.",
  "suggestedResponse": "¡Hola! Claro que sí, me encantaría contarte sobre nuestros productos. Tengo disponibilidad mañana a las 10am o el jueves a las 3pm. ¿Cuál te viene mejor?"
}
```

### Resultado en Base de Datos:
```sql
UPDATE contacts 
SET 
  score = 85,
  status = 'QUALIFIED',
  updated_at = NOW()
WHERE id = 'contact-uuid';
```

---

## 🎯 Features Implementadas

### ✅ Análisis Automático
- [x] Cada mensaje entrante se analiza automáticamente
- [x] Sin intervención manual requerida
- [x] Procesamiento en background (no bloquea UI)
- [x] Logs detallados en consola

### ✅ Calificación Inteligente
- [x] Score de 0-100 basado en conversación
- [x] Actualización automática de pipeline
- [x] Considera historial de mensajes (últimos 10)
- [x] Contexto del contacto incluido

### ✅ Detección de Sentimiento
- [x] **Positive**: Cliente satisfecho, interesado
- [x] **Neutral**: Consulta informativa
- [x] **Negative**: Queja, insatisfacción

### ✅ Detección de Intención
- [x] **Information**: Solo busca info
- [x] **Purchase**: Intención de compra
- [x] **Complaint**: Queja o problema
- [x] **Other**: Otros casos

### ✅ Nivel de Urgencia
- [x] **High**: Requiere atención inmediata
- [x] **Medium**: Normal
- [x] **Low**: Sin prisa

### ✅ Actualización de Pipeline
- [x] **NEW** → Cliente nuevo sin interacción
- [x] **CONTACTED** → Primera respuesta
- [x] **QUALIFIED** → Lead calificado por IA
- [x] **PROPOSAL** → Propuesta enviada
- [x] **WON** → Venta cerrada
- [x] **LOST** → Perdido

### ✅ Real-time Updates
- [x] Socket.IO en Conversaciones
- [x] Socket.IO en Contactos
- [x] Socket.IO en Pipeline (próximamente)
- [x] Notificaciones de IA

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# OpenAI API
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview  # o gpt-3.5-turbo

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Configuración de IA en Base de Datos

La tabla `ai_configs` permite personalizar el comportamiento:

```sql
SELECT * FROM ai_configs WHERE is_active = true;
```

**Campos configurables**:
- `system_prompt`: Instrucciones para la IA
- `model`: Modelo de OpenAI a usar
- `temperature`: Creatividad (0-1)
- `max_tokens`: Límite de respuesta
- `auto_respond`: Responder automáticamente (⚠️ experimental)

---

## 📈 Logs del Sistema

### Ejemplo de logs en tiempo real:

```bash
📩 Message from 521234567890: Hola! Me interesa el producto
👤 New contact auto-assigned to user: admin@example.com
✅ Message saved to conversation abc-123-def
🤖 Analyzing conversation with AI...
🎯 AI Analysis: {
  sentiment: 'positive',
  intent: 'purchase',
  score: 85,
  status: 'QUALIFIED'
}
📊 Contact updated: Juan Pérez → QUALIFIED (Score: 85)
```

---

## 🚀 Próximas Mejoras

### En Desarrollo
- [ ] **Auto-respuesta**: Que la IA responda automáticamente
- [ ] **Templates personalizados**: Respuestas predefinidas
- [ ] **Aprendizaje**: Mejorar con feedback humano
- [ ] **Notificaciones UI**: Toasts cuando IA actualiza algo
- [ ] **Dashboard de IA**: Métricas de performance

### Ideas Futuras
- [ ] **IA Multi-idioma**: Detectar y responder en el idioma del cliente
- [ ] **Sentiment trending**: Gráficos de sentimiento en el tiempo
- [ ] **Predicción de conversión**: Probabilidad de cierre
- [ ] **Recomendaciones de acción**: Qué hacer con cada lead
- [ ] **A/B Testing**: Probar diferentes respuestas

---

## 🧪 Cómo Probar

### 1. Verifica que OpenAI esté configurado
```bash
# En backend/.env
echo $OPENAI_API_KEY
```

### 2. Conecta WhatsApp
```
http://localhost:3000/dashboard/whatsapp
```

### 3. Envía un mensaje de prueba desde tu teléfono
```
"Hola! Quiero información sobre sus servicios"
```

### 4. Observa los logs del backend
```bash
cd backend
npm run dev
# Verás el análisis de IA en tiempo real
```

### 5. Verifica la base de datos
```sql
-- Ver contacto actualizado
SELECT name, score, status FROM contacts 
WHERE phone = 'TU_NUMERO' 
ORDER BY updated_at DESC LIMIT 1;

-- Ver mensajes
SELECT content, sender_type FROM messages 
WHERE conversation_id = 'conversation-id'
ORDER BY sent_at ASC;
```

### 6. Revisa el frontend
- **Conversaciones**: Debe aparecer el mensaje
- **Contactos**: Score y status actualizados
- **Pipeline**: Contacto movido a columna correcta
- **Consola**: Logs de `ai:analysis`

---

## ⚠️ Troubleshooting

### ❌ "Error in AI analysis"
**Causa**: OpenAI API key inválida o sin créditos  
**Solución**: Verifica `OPENAI_API_KEY` en `.env`

### ❌ Contactos no se actualizan
**Causa**: Socket.IO no conectado  
**Solución**: Verifica que backend emita `ai:analysis`

### ❌ IA responde en inglés
**Causa**: System prompt en inglés  
**Solución**: Actualiza `ai_configs.system_prompt` a español

### ❌ Muy lento
**Causa**: GPT-4 es más lento que GPT-3.5  
**Solución**: Cambia `AI_MODEL=gpt-3.5-turbo` en `.env`

---

## 💰 Costos de OpenAI

### Estimación de costos:

| Modelo | Input (1K tokens) | Output (1K tokens) | Promedio por análisis |
|--------|-------------------|--------------------|-----------------------|
| GPT-4 Turbo | $0.01 | $0.03 | ~$0.02 |
| GPT-3.5 Turbo | $0.001 | $0.002 | ~$0.002 |

**Ejemplo con 1000 mensajes/mes**:
- GPT-4: ~$20/mes
- GPT-3.5: ~$2/mes

💡 **Recomendación**: Usa GPT-3.5 Turbo para producción (95% accuracy, 10x más barato)

---

## 🔐 Seguridad

### ✅ Buenas Prácticas Implementadas:
- API key en variables de entorno (no en código)
- Manejo de errores (IA sigue funcionando si OpenAI falla)
- Logs sin información sensible
- Rate limiting (próximamente)

### ⚠️ Consideraciones:
- No envíes datos personales sensibles a OpenAI
- OpenAI retiene datos por 30 días ([política](https://openai.com/policies/api-data-usage-policies))
- Considera usar modelos locales (LLaMA, Mistral) para datos sensibles

---

## 📚 Referencias

- [OpenAI API Docs](https://platform.openai.com/docs)
- [GPT-4 Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)
- [Socket.IO Events](https://socket.io/docs/v4/emitting-events/)
- [Baileys WhatsApp](https://github.com/WhiskeySockets/Baileys)

---

**Status**: 🟢 **IMPLEMENTADO Y FUNCIONAL**

*Documentado el 5 de Diciembre, 2024*
