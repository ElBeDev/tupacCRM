# Integración ERP TupacCRM

## Descripción

Este módulo permite la integración con el sistema ERP mediante comunicación XML a través de sockets TCP. La integración permite consultar y sincronizar datos de clientes desde el ERP.

## Configuración

### Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# ERP Integration (Tupac ERP via XML TCP)
ERP_HOST=mytupac.mooo.com
ERP_PORT=1030
ERP_HS=DEMIURGO10-MCANET
```

- **ERP_HOST**: Dirección del servidor ERP (por defecto: `mytupac.mooo.com`)
- **ERP_PORT**: Puerto del servidor ERP (por defecto: `1030`)
- **ERP_HS**: Identificador del sistema (por defecto: `DEMIURGO10-MCANET`)

## Endpoints Disponibles

### 1. Buscar Cliente por Identificador

**GET** `/api/erp/client/:identifier`

Busca un cliente en el ERP usando CUIT, DNI o número interno.

**Parámetros:**
- `identifier` (path): El identificador del cliente
- `type` (query): Tipo de identificador - `'cuit'`, `'dni'`, o `'numero'` (por defecto: `'cuit'`)

**Ejemplo de uso:**

```bash
# Buscar por CUIT (por defecto)
curl -X GET "http://localhost:3001/api/erp/client/30697982473" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar por DNI
curl -X GET "http://localhost:3001/api/erp/client/12345678?type=dni" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Buscar por número interno
curl -X GET "http://localhost:3001/api/erp/client/100149?type=numero" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "data": {
    "nro_cliente": "100149",
    "ERROR": "0",
    "STRERROR": "EXACTO",
    "nombre": "RESIDENCIA ALEM BALLESTER",
    "nrodoc": "30697982473",
    "tipo_de_documento": "80",
    "desc_tipo_de_docu": "CUIT",
    "situacion_iva": "1",
    "desc_situacion_iva": "RESP. INSCRIPTO",
    "direccion": "BELGRANO 1230 VILLA BALLESTER",
    "localidad": "VILLA BALLESTER",
    "codpos": "1653",
    "provincia": "B",
    "desc_provincia": "BUENOS AIRES",
    "codigo_de_IIBB": "9010271720",
    "tipo_de_IIBB": "1",
    "desc_tipo_de_IIBB": "Inscripto Convenio Multilat."
  }
}
```

### 2. Búsqueda Avanzada de Cliente

**POST** `/api/erp/client/search`

Busca un cliente proporcionando uno o más identificadores.

**Body:**

```json
{
  "cuit": "30697982473",
  "dni": "",
  "nro_cliente": ""
}
```

**Ejemplo de uso:**

```bash
curl -X POST "http://localhost:3001/api/erp/client/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "30697982473"
  }'
```

### 3. Sincronizar Cliente

**POST** `/api/erp/client/sync`

Obtiene los datos de un cliente del ERP y los sincroniza con la base de datos local.

**Body:**

```json
{
  "cuit": "30697982473"
}
```

**Ejemplo de uso:**

```bash
curl -X POST "http://localhost:3001/api/erp/client/sync" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "30697982473"
  }'
```

### 4. Verificar Conexión con ERP

**GET** `/api/erp/health`

Verifica el estado de la conexión con el servidor ERP.

**Ejemplo de uso:**

```bash
curl -X GET "http://localhost:3001/api/erp/health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Conexión con ERP establecida",
  "available": true
}
```

## Uso desde el Frontend

### Ejemplo con fetch

```typescript
// Buscar cliente por CUIT
async function getClientByCUIT(cuit: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/erp/client/${cuit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data;
}

// Sincronizar cliente
async function syncClient(cuit: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/erp/client/sync`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cuit })
    }
  );
  
  const data = await response.json();
  return data;
}
```

### Ejemplo con Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Buscar cliente
const client = await api.get(`/api/erp/client/30697982473`);

// Sincronizar cliente
const syncResult = await api.post('/api/erp/client/sync', {
  cuit: '30697982473'
});
```

## Formato XML

### Solicitud

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <FECHA_TRASMITE>20231231</FECHA_TRASMITE>
  <HORA_TRASMITE>143025</HORA_TRASMITE>
  <hs>DEMIURGO10-MCANET</hs>
  <service>PROGRAM</service>
  <dni></dni>
  <cuit>30697982473</cuit>
  <nro_interno>100149</nro_interno>
  <program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

### Respuesta

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <nro_cliente>100149</nro_cliente>
  <ERROR>0</ERROR>
  <STRERROR>EXACTO</STRERROR>
  <nombre><![CDATA[RESIDENCIA ALEM BALLESTER]]></nombre>
  <nrodoc>30697982473</nrodoc>
  <direccion><![CDATA[BELGRANO 1230 VILLA BALLESTER]]></direccion>
  ...
</document>
```

## Manejo de Errores

### Errores Comunes

1. **Error de Conexión**
```json
{
  "success": false,
  "error": "Error de conexión con ERP: Connection refused"
}
```

2. **Cliente No Encontrado**
```json
{
  "success": false,
  "error": "Error del ERP: Cliente no encontrado"
}
```

3. **Timeout**
```json
{
  "success": false,
  "error": "Timeout de conexión con el servidor ERP"
}
```

4. **Identificador Faltante**
```json
{
  "success": false,
  "error": "Debe proporcionar CUIT, DNI o número de cliente"
}
```

## Seguridad

- Todos los endpoints requieren autenticación mediante JWT token
- La conexión con el ERP se realiza desde el servidor backend (no expuesta al cliente)
- Los datos se transmiten mediante TCP socket seguro
- Se implementa timeout de 30 segundos para evitar conexiones colgadas

## Próximas Mejoras

- [ ] Caché de consultas frecuentes con Redis
- [ ] Sincronización automática de clientes
- [ ] Webhook para notificaciones de cambios desde el ERP
- [ ] Integración bidireccional (crear/actualizar clientes en el ERP)
- [ ] Pool de conexiones para mejor rendimiento
- [ ] Métricas y monitoreo de salud de la integración

## Soporte

Para más información sobre el protocolo XML del ERP, contacta con el equipo de desarrollo del ERP.
