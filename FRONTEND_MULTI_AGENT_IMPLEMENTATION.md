# Guía de Implementación Frontend - Sistema Multi-Agente

## 📋 Cambios Necesarios en el Frontend

Esta guía detalla los cambios que deben hacerse en el frontend para soportar el sistema de delegación entre asistentes.

## 🔧 1. Actualizar Interfaces TypeScript

### Archivo: `frontend/src/app/dashboard/prompt/page.tsx`

```typescript
interface Assistant {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  model: string;
  temperature: number;
  isActive: boolean;
  isWhatsAppResponder: boolean;
  createdAt: string;
  openaiId?: string;
  delegatesTo?: string[];  // ✅ NUEVO: IDs de asistentes delegados
  specialty?: string;      // ✅ NUEVO: Especialidad del asistente
}
```

## 🎨 2. Agregar Campos al Formulario de Asistente

### En el estado del componente, agregar:

```typescript
const [assistantSpecialty, setAssistantSpecialty] = useState('general');
const [assistantDelegatesTo, setAssistantDelegatesTo] = useState<string[]>([]);
const [availableSpecialists, setAvailableSpecialists] = useState<Assistant[]>([]);
```

### Cargar especialistas disponibles:

```typescript
const loadAvailableSpecialists = async (assistantId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/assistants/${assistantId}/available-specialists`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to load specialists');
    
    const specialists = await response.json();
    setAvailableSpecialists(specialists);
  } catch (error) {
    console.error('Error loading specialists:', error);
  }
};
```

## 📝 3. Actualizar Función de Crear Asistente

```typescript
const createAssistant = async () => {
  if (!assistantName || !assistantInstructions) {
    toast({
      title: 'Error',
      description: 'El nombre y las instrucciones son requeridos',
      status: 'error',
      duration: 3000,
    });
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: assistantName,
        description: assistantDescription,
        instructions: assistantInstructions,
        model: assistantModel,
        temperature: assistantTemperature,
        isWhatsAppResponder: assistantWhatsAppResponder,
        specialty: assistantSpecialty,          // ✅ NUEVO
        delegatesTo: assistantDelegatesTo,      // ✅ NUEVO
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create assistant');
    }

    const newAssistant = await response.json();
    
    toast({
      title: '¡Asistente Creado!',
      description: `"${newAssistant.name}" está listo para ayudarte`,
      status: 'success',
      duration: 3000,
    });

    resetForm();
    await loadAssistants();
    setSelectedAssistant(newAssistant);
    onClose();
  } catch (error: any) {
    console.error('Error creating assistant:', error);
    toast({
      title: 'Error',
      description: error.message || 'No se pudo crear el asistente',
      status: 'error',
      duration: 5000,
    });
  } finally {
    setLoading(false);
  }
};
```

## 🖼️ 4. Agregar UI en el Modal de Configuración

### Agregar después del campo de temperatura:

```tsx
{/* Especialidad del Asistente */}
<FormControl>
  <FormLabel>Especialidad</FormLabel>
  <Select
    value={assistantSpecialty}
    onChange={(e) => setAssistantSpecialty(e.target.value)}
  >
    <option value="general">General (Asistente Principal)</option>
    <option value="precios">Consultor de Precios</option>
    <option value="stock">Consultor de Stock</option>
    <option value="pedidos">Gestor de Pedidos</option>
    <option value="reclamos">Gestor de Reclamos</option>
    <option value="erp">Consultor ERP</option>
  </Select>
  <FormHelperText>
    Define el rol especializado de este asistente
  </FormHelperText>
</FormControl>

{/* Delegación a Especialistas */}
{assistantSpecialty === 'general' && (
  <FormControl>
    <FormLabel>
      Delegar a Especialistas
      <Tooltip label="Selecciona qué asistentes especialistas puede consultar este asistente">
        <Icon as={FiInfo} ml={2} />
      </Tooltip>
    </FormLabel>
    <VStack align="stretch" spacing={2}>
      {availableSpecialists.map(specialist => (
        <Checkbox
          key={specialist.id}
          isChecked={assistantDelegatesTo.includes(specialist.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setAssistantDelegatesTo([...assistantDelegatesTo, specialist.id]);
            } else {
              setAssistantDelegatesTo(
                assistantDelegatesTo.filter(id => id !== specialist.id)
              );
            }
          }}
        >
          <HStack>
            <Badge colorScheme={
              specialist.specialty === 'precios' ? 'green' :
              specialist.specialty === 'stock' ? 'blue' :
              specialist.specialty === 'pedidos' ? 'purple' :
              specialist.specialty === 'reclamos' ? 'orange' : 'gray'
            }>
              {specialist.specialty}
            </Badge>
            <Text>{specialist.name}</Text>
          </HStack>
        </Checkbox>
      ))}
    </VStack>
    <FormHelperText>
      Este asistente podrá consultar a los especialistas seleccionados
    </FormHelperText>
  </FormControl>
)}
```

## 🎯 5. Agregar Badge de Especialidad en la Lista

En la vista de lista de asistentes, mostrar la especialidad:

```tsx
<Box>
  <HStack justify="space-between" mb={2}>
    <HStack>
      <Heading size="sm">{assistant.name}</Heading>
      {assistant.specialty && (
        <Badge colorScheme={
          assistant.specialty === 'general' ? 'purple' :
          assistant.specialty === 'precios' ? 'green' :
          assistant.specialty === 'stock' ? 'blue' :
          assistant.specialty === 'pedidos' ? 'orange' :
          assistant.specialty === 'reclamos' ? 'red' : 'gray'
        }>
          {assistant.specialty}
        </Badge>
      )}
      {assistant.isWhatsAppResponder && (
        <Badge colorScheme="whatsapp">WhatsApp</Badge>
      )}
    </HStack>
    {/* ... resto de botones ... */}
  </HStack>
  
  {/* Mostrar delegados */}
  {assistant.delegatesTo && assistant.delegatesTo.length > 0 && (
    <HStack mt={2} spacing={1}>
      <Icon as={FiUsers} color="gray.500" />
      <Text fontSize="xs" color="gray.500">
        Delega a {assistant.delegatesTo.length} especialista(s)
      </Text>
    </HStack>
  )}
</Box>
```

## 🔄 6. Endpoint para Actualizar Delegación

Agregar función para actualizar solo la delegación:

```typescript
const updateDelegation = async (assistantId: string, delegatesTo: string[]) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/assistants/${assistantId}/delegates`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ delegatesTo }),
      }
    );

    if (!response.ok) throw new Error('Failed to update delegation');
    
    toast({
      title: 'Delegación Actualizada',
      description: 'La configuración de delegación se actualizó correctamente',
      status: 'success',
      duration: 3000,
    });
    
    await loadAssistants();
  } catch (error) {
    console.error('Error updating delegation:', error);
    toast({
      title: 'Error',
      description: 'No se pudo actualizar la delegación',
      status: 'error',
      duration: 3000,
    });
  }
};
```

## 📊 7. Panel de Configuración de Delegación

Crear un panel expandible para configurar la delegación:

```tsx
{/* Panel de Delegación */}
{selectedAssistant && selectedAssistant.specialty === 'general' && (
  <Accordion allowToggle mt={4}>
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <HStack>
            <Icon as={FiUsers} />
            <Text fontWeight="semibold">Configuración de Delegación</Text>
          </HStack>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack align="stretch" spacing={4}>
          <Text fontSize="sm" color="gray.600">
            Selecciona a qué asistentes especialistas puede consultar 
            este asistente para obtener información más precisa.
          </Text>
          
          {availableSpecialists.map(specialist => (
            <Card key={specialist.id} variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontWeight="semibold">{specialist.name}</Text>
                      <Badge colorScheme={
                        specialist.specialty === 'precios' ? 'green' :
                        specialist.specialty === 'stock' ? 'blue' :
                        specialist.specialty === 'pedidos' ? 'purple' :
                        specialist.specialty === 'reclamos' ? 'orange' : 'gray'
                      }>
                        {specialist.specialty}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {specialist.description}
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={selectedAssistant.delegatesTo?.includes(specialist.id)}
                    onChange={(e) => {
                      const newDelegates = e.target.checked
                        ? [...(selectedAssistant.delegatesTo || []), specialist.id]
                        : (selectedAssistant.delegatesTo || []).filter(id => id !== specialist.id);
                      
                      updateDelegation(selectedAssistant.id, newDelegates);
                    }}
                  />
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
)}
```

## 🎨 8. Importaciones Necesarias

Agregar a los imports del componente:

```typescript
import {
  // ... imports existentes ...
  Select,
  Checkbox,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FiUsers, FiInfo } from 'react-icons/fi';
```

## 🧪 9. Testing

### Pasos para probar:

1. **Crear asistentes especializados:**
   ```bash
   cd backend
   npx ts-node seed-assistants-v2.ts
   ```

2. **Verificar en el frontend:**
   - Ir a `/dashboard/prompt`
   - Ver que los asistentes tengan badges de especialidad
   - Editar el asistente principal
   - Configurar delegación a especialistas

3. **Probar el flujo:**
   - Enviar mensaje por WhatsApp: "¿Cuánto cuesta la coca cola?"
   - Ver que el sistema delegue al Consultor de Precios
   - Ver que consulte el ERP automáticamente
   - Ver que responda con datos reales

## 📝 10. Resetear Formulario

Actualizar la función `resetForm`:

```typescript
const resetForm = () => {
  setAssistantName('');
  setAssistantDescription('');
  setAssistantInstructions('');
  setAssistantModel('gpt-4o');
  setAssistantTemperature(0.7);
  setAssistantWhatsAppResponder(false);
  setAssistantSpecialty('general');        // ✅ NUEVO
  setAssistantDelegatesTo([]);             // ✅ NUEVO
};
```

## ⚙️ 11. Cargar Especialistas al Editar

Cuando se selecciona un asistente para editar:

```typescript
const selectAssistantForEdit = async (assistant: Assistant) => {
  setSelectedAssistant(assistant);
  setAssistantName(assistant.name);
  setAssistantDescription(assistant.description || '');
  setAssistantInstructions(assistant.instructions);
  setAssistantModel(assistant.model);
  setAssistantTemperature(assistant.temperature);
  setAssistantWhatsAppResponder(assistant.isWhatsAppResponder);
  setAssistantSpecialty(assistant.specialty || 'general');        // ✅ NUEVO
  setAssistantDelegatesTo(assistant.delegatesTo || []);           // ✅ NUEVO
  
  // Cargar especialistas disponibles
  if (assistant.id) {
    await loadAvailableSpecialists(assistant.id);
  }
  
  onOpen();
};
```

## 🎯 Resumen de Cambios

### ✅ Backend (Ya implementado)
- [x] Schema actualizado con `delegatesTo` y `specialty`
- [x] Migración aplicada
- [x] Endpoints de API creados
- [x] Método `consultSpecialist` mejorado
- [x] Script de seed actualizado

### 🔄 Frontend (Pendiente)
- [ ] Actualizar interfaz `Assistant`
- [ ] Agregar estado para specialty y delegatesTo
- [ ] Agregar campos en formulario de creación
- [ ] Agregar campos en formulario de edición
- [ ] Mostrar badges de especialidad en lista
- [ ] Crear panel de configuración de delegación
- [ ] Implementar función de actualización de delegación
- [ ] Agregar carga de especialistas disponibles

## 🚀 Próximos Pasos

1. Aplicar los cambios del frontend según esta guía
2. Ejecutar el seed de asistentes: `npx ts-node seed-assistants-v2.ts`
3. Probar el sistema multi-agente con mensajes reales
4. Ajustar prompts según los resultados
5. Documentar casos de uso exitosos

## 📚 Referencias

- `backend/src/services/assistant.service.ts` - Lógica de delegación
- `backend/src/routes/assistants.ts` - Endpoints de API
- `MULTI_AGENT_DELEGATION_GUIDE.md` - Documentación completa del sistema
