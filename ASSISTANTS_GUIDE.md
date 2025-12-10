# Guía de Uso: Asistentes de IA

## 🤖 Funcionalidad de Asistentes

La sección de **Pruebas de Asistentes** ahora está completamente funcional con integración real de OpenAI.

## ✨ Características Implementadas

### 1. Crear Asistentes
- **Modo Manual**: Crea asistentes definiendo directamente:
  - Nombre
  - Descripción (opcional)
  - Instrucciones del sistema
  - Modelo (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo)
  - Temperatura (0-2)

- **Modo IA** (Próximamente): Diseña asistentes conversando con Prometheo

### 2. Gestión de Asistentes
- Lista de todos tus asistentes
- Seleccionar asistente para probar
- Eliminar asistentes
- Ver detalles de cada asistente

### 3. Probar Asistentes
- Chat en tiempo real con el asistente
- Historial de conversaciones persistente
- Respuestas reales de OpenAI
- Limpiar historial de chat

## 🚀 Cómo Usar

### Paso 1: Acceder a la Sección
1. Inicia sesión en TupacCRM
2. Ve a **Dashboard** → **Pruebas** (Testing)

### Paso 2: Crear tu Primer Asistente
1. Haz clic en **"Crear Asistente"**
2. Elige modo **Manual**
3. Completa el formulario:
   ```
   Nombre: Asistente de Ventas
   Descripción: Ayuda a calificar leads y cerrar ventas
   Instrucciones: Eres un experto en ventas. Tu objetivo es...
   Modelo: gpt-4-turbo-preview
   Temperatura: 0.7
   ```
4. Haz clic en **"Crear Asistente"**

### Paso 3: Probar el Asistente
1. Selecciona el asistente de la lista
2. Escribe un mensaje en el área de texto
3. Presiona Enter o el botón de enviar
4. Espera la respuesta del asistente
5. Continúa la conversación

### Paso 4: Gestionar Asistentes
- **Eliminar**: Menú de 3 puntos → Eliminar
- **Limpiar Chat**: Botón "Limpiar Chat" (mantiene el asistente, borra mensajes)

## 📝 Ejemplos de Instrucciones

### Asistente de Ventas
```
Eres un asistente experto en ventas B2B. Tu objetivo es:
1. Calificar leads basándote en su interés y presupuesto
2. Hacer preguntas relevantes para entender necesidades
3. Sugerir productos/servicios adecuados
4. Mantener un tono profesional y amigable
5. Cerrar ventas de manera efectiva

Siempre pide información clave como:
- Nombre de la empresa
- Tamaño de la organización
- Presupuesto aproximado
- Timeframe de decisión
```

### Asistente de Soporte
```
Eres un asistente de soporte técnico amigable y paciente. Tu rol es:
1. Escuchar el problema del usuario con empatía
2. Hacer preguntas diagnósticas específicas
3. Ofrecer soluciones paso a paso
4. Verificar que el problema se resolvió
5. Documentar la solución para futuras referencias

Usa un lenguaje claro y evita tecnicismos innecesarios.
```

### Asistente de Atención al Cliente
```
Eres un representante de atención al cliente excepcional. Tu misión es:
1. Saludar calurosamente a los clientes
2. Entender sus consultas o preocupaciones
3. Ofrecer soluciones rápidas y efectivas
4. Manejar quejas con profesionalismo
5. Seguir la política de satisfacción del cliente

Siempre muestra empatía y busca soluciones ganar-ganar.
```

## 🔧 API Endpoints Disponibles

### Crear Asistente
```
POST /api/assistants
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Nombre del Asistente",
  "description": "Descripción opcional",
  "instructions": "Instrucciones del sistema",
  "model": "gpt-4-turbo-preview",
  "temperature": 0.7
}
```

### Listar Asistentes
```
GET /api/assistants
Authorization: Bearer <token>
```

### Probar Asistente
```
POST /api/assistants/:id/test
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Hola, ¿cómo puedes ayudarme?"
}
```

### Eliminar Asistente
```
DELETE /api/assistants/:id
Authorization: Bearer <token>
```

### Limpiar Mensajes
```
DELETE /api/assistants/:id/messages
Authorization: Bearer <token>
```

## ⚙️ Configuración Técnica

### Backend
- Servicio: `assistant.service.ts`
- Rutas: `routes/assistants.ts`
- Base de datos: Modelos `Assistant` y `AssistantTestMessage`

### Frontend
- Componente: `app/dashboard/testing/page.tsx`
- Estado local con React hooks
- Integración directa con API

### OpenAI
- API: OpenAI Assistants API (beta)
- Modelos soportados:
  - `gpt-4-turbo-preview` (recomendado)
  - `gpt-4`
  - `gpt-3.5-turbo`

## 🐛 Resolución de Problemas

### Error: "OpenAI API key not configured"
**Solución**: Verifica que `OPENAI_API_KEY` esté en `/backend/.env`

### Error: "Failed to create assistant"
**Causa**: Puede ser límite de API o key inválida
**Solución**: 
1. Verifica tu cuota en OpenAI
2. Confirma que la API key sea válida
3. Revisa los logs del backend

### Los mensajes no se cargan
**Solución**: 
1. Refresca la página
2. Verifica que estés autenticado
3. Revisa la consola del navegador

## 📊 Base de Datos

### Modelo Assistant
```prisma
model Assistant {
  id              String
  userId          String
  name            String
  description     String?
  instructions    String
  model           String
  temperature     Float
  openaiId        String?  // ID en OpenAI
  tools           Json?
  fileIds         String[]
  metadata        Json?
  isActive        Boolean
  createdAt       DateTime
  updatedAt       DateTime
  testMessages    AssistantTestMessage[]
}
```

### Modelo AssistantTestMessage
```prisma
model AssistantTestMessage {
  id          String
  assistantId String
  role        String  // "user" o "assistant"
  content     String
  metadata    Json?
  createdAt   DateTime
  assistant   Assistant
}
```

## 🚀 Próximas Mejoras

- [ ] Modo IA para crear asistentes conversacionalmente
- [ ] Streaming de respuestas en tiempo real
- [ ] Soporte para herramientas (code_interpreter, retrieval)
- [ ] Adjuntar archivos a asistentes
- [ ] Exportar conversaciones
- [ ] Métricas de uso
- [ ] Plantillas de asistentes pre-configuradas

## 📞 Soporte

Si encuentras algún problema:
1. Revisa esta documentación
2. Verifica los logs del backend y frontend
3. Confirma que el API key de OpenAI esté configurado
4. Revisa que la base de datos tenga las migraciones aplicadas

---

✅ **Todo está listo para usar!** Crea tu primer asistente y comienza a probar.
