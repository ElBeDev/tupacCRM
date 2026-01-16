# Sistema Multi-Agente Actualizado en VPS

## ✅ Cambios Aplicados

### 1. **Esquema de Base de Datos**
Se agregaron dos nuevas columnas a la tabla `assistants`:

```sql
ALTER TABLE assistants ADD COLUMN specialty TEXT;
ALTER TABLE assistants ADD COLUMN delegates_to TEXT[];
```

### 2. **Asistentes Actualizados**

| Nombre | Especialidad | WhatsApp Responder | Delegación |
|--------|--------------|-------------------|------------|
| **Tupac - Atencion al Cliente** | `general` | ✅ | Delega a 4 especialistas |
| **Asistente de Atención al Cliente** | `general` | ✅ | Delega a 4 especialistas |
| **Tupac Router de intenciones** | - | ✅ | Sin delegación |
| Consultor de Precios | `precios` | ❌ | - |
| Consultor de Stock | `stock` | ❌ | - |
| Gestor de Pedidos | `pedidos` | ❌ | - |
| Gestor de Reclamos | `reclamos` | ❌ | - |

### 3. **Especialistas Configurados**

Los asistentes principales (`specialty='general'` y `isWhatsAppResponder=true`) ahora delegan a:

```javascript
delegates_to = [
  'ae4bb300-8002-4d32-bdb9-7c3012a90773', // Consultor de Precios
  'e7c0de9b-cb46-47f6-ac43-16a90857bb9c', // Consultor de Stock
  'b24c68ad-9094-40f8-a6e7-64bd247575c2', // Gestor de Pedidos
  '94a5d1b7-18c7-4c8c-8178-ddde140952c9'  // Gestor de Reclamos
]
```

## 🔄 Cómo Funciona

### Mapeo de Intenciones → Especialidades

El sistema ahora usa el campo `specialty` en lugar de nombres para encontrar especialistas:

```typescript
// En assistant.service.ts - consultSpecialist()
const intentToSpecialty: Record<string, string> = {
  'consulta_precio': 'precios',
  'consulta_stock': 'stock',
  'realizar_pedido': 'pedidos',
  'crear_reclamo': 'reclamos',
};

const targetSpecialty = intentToSpecialty[intent];

const specialist = await prisma.assistant.findFirst({
  where: {
    specialty: targetSpecialty,
    isActive: true,
  },
});
```

### Ejemplo de Flujo

1. **Usuario pregunta**: "¿Cuánto cuesta la coca cola?"
2. **Asistente Principal** detecta intención: `consulta_precio`
3. **Sistema** busca asistente con `specialty='precios'`
4. **Consultor de Precios** consulta al ERP vía socket TCP
5. **Respuesta** se devuelve al usuario

## 🚀 Servicios Reiniciados

```bash
cd /var/www/tupaccrm && docker-compose restart backend
```

El backend fue reiniciado para cargar:
- Nuevo esquema de Prisma con campos `specialty` y `delegatesTo`
- Código actualizado en `assistant.service.ts`
- Nuevos endpoints de API para delegación

## 📊 Estado del Sistema

### Base de Datos
- **Host**: postgres:5432 (contenedor Docker)
- **Database**: tupaccrm
- **Schema**: Actualizado con nuevos campos
- **Migraciones**: 7 aplicadas (incluyendo la nueva de delegación)

### Backend
- **Puerto**: 3001
- **Estado**: ✅ Running
- **Última actualización**: 16/01/2026 01:20

### Frontend  
- **Puerto**: 3000
- **Estado**: ✅ Running

## 🧪 Pruebas Sugeridas

### 1. Prueba de Precios
```bash
# Envía mensaje de WhatsApp
"¿Cuánto cuesta la coca cola de 1.5 litros?"
```
Debería:
- Detectar intención `consulta_precio`
- Delegar a **Consultor de Precios**
- Consultar ERP (mytupac.mooo.com:1030)
- Responder con precio

### 2. Prueba de Stock
```bash
"¿Tienen disponible cerveza Corona?"
```
Debería:
- Detectar intención `consulta_stock`
- Delegar a **Consultor de Stock**
- Responder con disponibilidad

### 3. Prueba de Pedidos
```bash
"Quiero hacer un pedido de 10 cajas de agua"
```
Debería:
- Detectar intención `realizar_pedido`
- Delegar a **Gestor de Pedidos**

### 4. Prueba de Reclamos
```bash
"Quiero hacer un reclamo por producto defectuoso"
```
Debería:
- Detectar intención `crear_reclamo`
- Delegar a **Gestor de Reclamos**

## 🔍 Verificación en Producción

### Ver asistentes con especialidades
```bash
docker exec tupaccrm-postgres psql -U postgres -d tupaccrm -c \
  "SELECT id, name, specialty, \"isWhatsAppResponder\" FROM assistants ORDER BY name;"
```

### Ver delegación configurada
```bash
docker exec tupaccrm-postgres psql -U postgres -d tupaccrm -c \
  "SELECT name, specialty, delegates_to FROM assistants WHERE \"isWhatsAppResponder\" = true;"
```

### Ver logs del backend
```bash
docker logs tupaccrm-backend -f --tail 50
```

## 📝 Notas Importantes

1. **Router de Intenciones**: El asistente "Tupac Router de intenciones" NO tiene specialty ni delegación configurada. Si necesita trabajar con el nuevo sistema, agregar:
   ```sql
   UPDATE assistants 
   SET specialty = 'general', 
       delegates_to = ARRAY[...] 
   WHERE name = 'Tupac Router de intenciones';
   ```

2. **ERP Connection**: Los especialistas siguen usando `erp.service.ts` para conectarse al ERP via TCP socket (mytupac.mooo.com:1030).

3. **OpenAI Assistants**: Cada asistente tiene su propio `openaiId` que debe existir en tu cuenta de OpenAI.

## 🎯 Próximos Pasos

- [ ] Probar delegación con mensajes reales de WhatsApp
- [ ] Verificar logs para confirmar delegación correcta
- [ ] Implementar UI en frontend para configurar delegación (opcional)
- [ ] Agregar métricas de uso por especialista
- [ ] Documentar patrones de intención detectados
