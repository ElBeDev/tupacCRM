# Guía de API del ERP

## Información de Conexión

```
Host: mytupac.mooo.com
Puerto: 1030
IP: 179.41.8.205
Handshake: DEMIURGO10-MCANET
```

## Código Node.js para Consultas

```javascript
const net = require('net');

function consultarERP(xmlRequest) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(30000);
    let response = '';
    
    client.connect(1030, 'mytupac.mooo.com', () => {
      client.write(xmlRequest + '\n');
    });
    
    client.on('data', (data) => {
      response += data.toString();
    });
    
    client.on('end', () => {
      resolve(response);
    });
    
    client.on('timeout', () => {
      client.destroy();
      resolve(response);
    });
    
    client.on('error', (err) => {
      reject(err);
    });
  });
}
```

## Consulta de Clientes

### Por CUIT

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<cuit>30697982473</cuit>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

### Por DNI

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni>12345678</dni>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

### Por Número Interno

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

### Desde Terminal (netcat)

```bash
echo '<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<cuit>30697982473</cuit>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>' | nc -w 30 mytupac.mooo.com 1030
```

## Consulta de Artículos/Productos

### Por ID

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<id>5970</id>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>
```

### Por SKU (Código de Barras)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<sku>7791813777021</sku>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>
```

### Por Nombre (Búsqueda de Texto) ⭐ **RECOMENDADO**

**IMPORTANTE:** Para búsqueda por texto, usar el tag `<nombre>` y **NO** incluir los tags `<id>` ni `<sku>`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>coca</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>
```

### Ejemplos de Búsqueda por Nombre

```bash
# Buscar Coca-Cola
echo '<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>coca</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>' | nc -w 30 mytupac.mooo.com 1030

# Buscar Queso Rallado
echo '<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>queso rallado</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>' | nc -w 30 mytupac.mooo.com 1030
```

## Formato de Respuesta

### ⚠️ IMPORTANTE: Respuesta con 2 XMLs

El servidor devuelve **2 XMLs concatenados**:
1. **Primer XML (stub):** Información del sistema
2. **Segundo XML (datos reales):** Los datos que necesitas

**Siempre usar el SEGUNDO XML.**

### Ejemplo de Respuesta

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>PROGRAM</service>
<name>Interfaz_CRM_ERP_Articulo</name>
<program>/u/general/DMUG/program/Interfaz_CRM_ERP_Articulo.sh</program>
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>

<!-- ESTE ES EL XML QUE NECESITAS -->
<?xml version="1.0" encoding="UTF-8"?>
<document>
<depto><![CDATA[GASEOSA]]></depto>
<familia><![CDATA[BEBIDAS SIN ALCOHOL]]></familia>
<id>000000102</id>
<nombre><![CDATA[COCA COLA X2.25LT]]></nombre>
<precio_normal>2795,8680</precio_normal>
<sku><![CDATA[7790895000997]]></sku>
<stock>000000960</stock>
<!-- ... más campos ... -->
</document>
</document>
```

## Campos de Respuesta de Artículos

### Identificacion

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | String | ID interno del producto |
| `madre` | String | ID del producto madre (para variantes) |
| `nombre` | CDATA | Nombre del producto |
| `sku` | CDATA | Codigo de barras |

### Categorizacion

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `depto` | CDATA | Departamento |
| `familia` | CDATA | Familia de productos |
| `seccion` | CDATA | Seccion |
| `grupo` | CDATA | Grupo |
| `marca` | CDATA | Marca |

### Precios de Venta (con IVA incluido)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `precio_normal` | Decimal | Precio de venta normal |
| `precio_mayorista` | Decimal | Precio mayorista |
| `precio_vtasesp` | Decimal | Precio venta especial |
| `precio_promo` | Decimal | Precio promocional (solo si hay promo activa) |
| `precio_oferta` | Decimal | Precio en oferta |
| `precio_negesp` | Decimal | Precio negociacion especial |
| `precio_direccion` | Decimal | Precio direccion |

### Costo

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `precio_ctogestion` | Decimal | Costo de gestion (costo del producto) |

### Promocion Lleva/Paga (solo si hay promo activa)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `AccionPromoItem` | String | Codigo/ID de la promocion activa |
| `promo_lleva` | Integer | Cantidad que lleva el cliente |
| `promo_paga` | Integer | Cantidad que paga el cliente |
| `promo_des` | Decimal | Descuento adicional en promocion |

### Stock e Inventario

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `stock` | Integer | Stock disponible (puede ser negativo) |
| `unidad_bulto` | Integer | Unidades por bulto |
| `medida_unidad` | CDATA | Unidad de medida (Un., g, Kg, etc.) |
| `peso_std` | Decimal | Peso estandar del producto |
| `fraccion` | Integer | Fraccion |
| `porcentaje_fraccion` | Decimal | Porcentaje de fraccion |

### Proveedor e Impuestos

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `proveedor` | CDATA | Nombre del proveedor |
| `iva_tas1` | Decimal | Tasa de IVA (21000,000 = 21%) |

### Otros Datos

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `sintacc` | Integer | Sin TACC (0=No, 1=Si) |
| `desactiva_oferta` | CDATA | Fecha desactivacion oferta |
| `vigencia_oferta` | CDATA | Fecha vigencia oferta |

### Notas sobre los campos

- **Valores "-000,0001":** Indican que el campo no aplica o no tiene valor definido
- **Campos de promocion:** Solo aparecen cuando el producto tiene una promocion activa
- **Stock negativo:** Indica deuda de stock o productos pendientes de reposicion
- **Todos los precios incluyen IVA**
- **Los decimales usan coma como separador**

## Códigos de Error

### Respuesta Exitosa
```xml
<ERROR>0</ERROR>
<STRERROR>EXACTO</STRERROR>
<PUTRECORD>14</PUTRECORD>
<REGISTROS>14</REGISTROS>
```

### Error de Búsqueda
```xml
<ERROR>100</ERROR>
<STRERROR>ERROR PUTRECORD ARTCRM</STRERROR>
<PUTRECORD>0</PUTRECORD>
<REGISTROS>0</REGISTROS>
```

## Ejemplos de Uso en TypeScript

```typescript
import * as net from 'net';

interface ArticuloERP {
  // Identificacion
  id: string;
  madre: string;
  nombre: string;
  sku: string;
  
  // Categorizacion
  depto: string;
  familia: string;
  seccion: string;
  grupo: string;
  marca: string;
  
  // Precios (con IVA)
  precio_normal: number;
  precio_mayorista: number;
  precio_vtasesp: number;
  precio_promo?: number;
  precio_oferta: number;
  precio_negesp: number;
  precio_direccion: number;
  
  // Costo
  precio_ctogestion?: number;
  
  // Promocion (opcionales)
  AccionPromoItem?: string;
  promo_lleva?: number;
  promo_paga?: number;
  promo_des?: number;
  
  // Stock
  stock: number;
  unidad_bulto: number;
  medida_unidad: string;
  peso_std: number;
  fraccion: number;
  porcentaje_fraccion: number;
  
  // Proveedor e Impuestos
  proveedor: string;
  iva_tas1: number;
  
  // Otros
  sintacc: number;
  desactiva_oferta: string;
  vigencia_oferta: string;
}

async function buscarProductoPorNombre(nombre: string): Promise<ArticuloERP[]> {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>${nombre}</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>`;

  const response = await consultarERP(xml);
  
  // Parsear el SEGUNDO XML de la respuesta
  // (implementación del parser aquí)
  
  return articulos;
}

async function buscarProductoPorId(id: string): Promise<ArticuloERP> {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<id>${id}</id>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>`;

  const response = await consultarERP(xml);
  
  // Parsear el SEGUNDO XML de la respuesta
  // (implementación del parser aquí)
  
  return articulo;
}

// Uso
const productos = await buscarProductoPorNombre('coca');
console.log(`Encontrados ${productos.length} productos`);

const producto = await buscarProductoPorId('5691');
if (producto.AccionPromoItem) {
  console.log(`Promo activa: Lleva ${producto.promo_lleva} Paga ${producto.promo_paga}`);
}
```

## Ejemplo de Respuesta Completa (con promocion)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<id>5691</id>
<ERROR>0</ERROR>
<STRERROR>EXACTO</STRERROR>
<PUTRECORD>1</PUTRECORD>
<REGISTROS>1</REGISTROS>
<INFO1>GRABO CORRECTAMENTE</INFO1>
<INFO2>REGISTROS GRABADOS = 1 </INFO2>
<AccionPromoItem>24900010000</AccionPromoItem>
<depto><![CDATA[RUEDITAS                      ]]></depto>
<desactiva_oferta><![CDATA[            ]]></desactiva_oferta>
<familia><![CDATA[SNACKS                        ]]></familia>
<fraccion>0000000</fraccion>
<grupo><![CDATA[Inexistente                   ]]></grupo>
<id>000005691</id>
<iva_tas1>21000,000</iva_tas1>
<madre>000005691</madre>
<marca><![CDATA[                              ]]></marca>
<medida_unidad><![CDATA[Un.]]></medida_unidad>
<nombre><![CDATA[SALADIX CALABRESA 30 GR                                               ]]></nombre>
<peso_std>00,0000</peso_std>
<porcentaje_fraccion>0,000</porcentaje_fraccion>
<precio_ctogestion>0333,1170</precio_ctogestion>
<precio_direccion>-000,0001</precio_direccion>
<precio_mayorista>0360,3310</precio_mayorista>
<precio_negesp>-000,0001</precio_negesp>
<precio_normal>0437,1900</precio_normal>
<precio_oferta>-000,0001</precio_oferta>
<precio_promo>0291,4600</precio_promo>
<precio_vtasesp>0350,4130</precio_vtasesp>
<promo_des>0,000</promo_des>
<promo_lleva>00003</promo_lleva>
<promo_paga>00002</promo_paga>
<proveedor><![CDATA[LATAM DISTRIBUCION S.A.                           ]]></proveedor>
<seccion><![CDATA[VARIOS                        ]]></seccion>
<sintacc>0</sintacc>
<sku><![CDATA[17790040152035      ]]></sku>
<stock>000000121</stock>
<unidad_bulto>0048</unidad_bulto>
<vigencia_oferta><![CDATA[            ]]></vigencia_oferta>
</document>
```

## Notas Importantes

1. ⚠️ **Siempre agregar `\n` al final del XML** cuando uses netcat o sockets
2. ⚠️ **El servidor devuelve 2 XMLs concatenados** - usar el segundo
3. ✅ **Timeout recomendado:** 30 segundos
4. ✅ **Búsqueda por nombre:** No incluir `<id>` ni `<sku>` en el XML
5. ✅ **Handshake obligatorio:** `DEMIURGO10-MCANET` en el tag `<hs>`
6. ✅ **Los precios usan coma** como separador decimal: `2795,8680`
7. ✅ **Los campos CDATA** pueden tener espacios en blanco al final
