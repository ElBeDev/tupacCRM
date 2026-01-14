# Reporte de Problema: Integración ERP - Interfaz_CRM_ERP

**Fecha:** 31 de Diciembre de 2025  
**Sistema:** TupacCRM  
**Servidor ERP:** mytupac.mooo.com:1030  
**Handshake:** DEMIURGO10-MCANET  

---

## 🔴 PROBLEMA IDENTIFICADO

Los programas `Interfaz_CRM_ERP_Cliente` e `Interfaz_CRM_ERP_Articulo` **NO devuelven datos reales**, solo responden con un mensaje stub/mock:

```xml
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
```

---

## ✅ VERIFICACIONES REALIZADAS

### 1. Conexión al Servidor
- ✅ Servidor **activo** y respondiendo
- ✅ Puerto 1030 **abierto** y accesible
- ✅ Host resuelve correctamente a: 179.41.8.205 (Argentina - Speedy)

### 2. Autenticación
- ✅ Handshake `DEMIURGO10-MCANET` **autenticado correctamente**
- ✅ Handshake inválido genera error 50: `ERROR EN HANDSHECK`
- ✅ El servidor reconoce y valida credenciales

### 3. Programas Disponibles
- ✅ `Interfaz_CRM_ERP_Cliente` - **Reconocido** pero devuelve stub
- ✅ `Interfaz_CRM_ERP_Articulo` - **Reconocido** pero devuelve stub
- ✅ Otros servicios: `QUERY` existe pero sin documentación de sintaxis

---

## 📝 EJEMPLOS DE PETICIONES REALIZADAS

### Cliente - Petición 1: Con CUIT y nro_interno
**XML Enviado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>30697982473</cuit>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

**Respuesta Recibida:**
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>PROGRAM</service>
<name>Interfaz_CRM_ERP_Cliente</name>
<program></program>
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
</document>
```

### Cliente - Petición 2: Solo con CUIT
**XML Enviado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<cuit>30697982473</cuit>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

**Respuesta Recibida:**
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>PROGRAM</service>
<name>Interfaz_CRM_ERP_Cliente</name>
<program></program>
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
</document>
```

### Cliente - Petición 3: Solo con nro_interno
**XML Enviado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>
```

**Respuesta Recibida:**
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>PROGRAM</service>
<name>Interfaz_CRM_ERP_Cliente</name>
<program></program>
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
</document>
```

### Artículo - Petición 4: Con ID y SKU
**XML Enviado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<id>5970</id>
<sku>7791813777021</sku>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>
```

**Respuesta Recibida:**
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>PROGRAM</service>
<name>Interfaz_CRM_ERP_Articulo</name>
<program></program>
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
</document>
```

---

## 🔍 RESPUESTA ESPERADA vs RESPUESTA REAL

### Para Cliente (según documentación):
**ESPERADO:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<nro_cliente>100149</nro_cliente>
<ERROR>0</ERROR>
<STRERROR>EXACTO</STRERROR>
<nombre><![CDATA[RESIDENCIA ALEM BALLESTER]]></nombre>
<nrodoc>30697982473</nrodoc>
<direccion><![CDATA[BELGRANO 1230 VILLA BALLESTER]]></direccion>
<localidad>VILLA BALLESTER</localidad>
<provincia>B</provincia>
<!-- ... más campos ... -->
</document>
```

**RECIBIDO:**
```xml
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
```

### Para Artículo (según documentación):
**ESPERADO:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<id>5970</id>
<ERROR>0</ERROR>
<STRERROR>EXACTO</STRERROR>
<nombre><![CDATA[7UP LIMA LIMON LATA 354ML]]></nombre>
<precio_normal>0517,3550</precio_normal>
<stock>000000000</stock>
<!-- ... más campos ... -->
</document>
```

**RECIBIDO:**
```xml
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
```

---

## 🧪 PRUEBAS ADICIONALES REALIZADAS

### Servicio QUERY
El servidor reconoce el servicio `QUERY` pero devuelve error de sintaxis:

**Petición:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
<hs>DEMIURGO10-MCANET</hs>
<service>QUERY</service>
</document>
```

**Respuesta:**
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service>QUERY</service>
<name>QUERY_IDX</name>
<strerror>NOT ERROR</strerror>
<nroerror>0</nroerror>
<resulset>
<![CDATA["/tmp/file-735", línea 1, Error 1:
         Error de Sintaxis
]]></resulset>
</document>
```

Se probaron más de 20 variaciones de sintaxis sin éxito.

---

## 📊 VARIACIONES PROBADAS

✅ **Todas devolvieron la misma respuesta stub:**

1. Con fechas vacías: `<FECHA_TRASMITE></FECHA_TRASMITE>`
2. Sin fechas: (campos omitidos)
3. Con fechas completas: `<FECHA_TRASMITE>20251231</FECHA_TRASMITE>`
4. Solo CUIT sin nro_interno
5. Solo nro_interno sin CUIT
6. Ambos CUIT y nro_interno
7. Diferentes CUITs (30697982473, 20123456789)
8. Diferentes encodings (UTF-8, ISO-8859-1)
9. Con/sin declaración XML
10. Orden diferente de campos
11. Campos con valores vacíos vs campos omitidos

**Resultado:** TODOS devuelven el mismo mensaje stub.

---

## 📋 INFORMACIÓN REQUERIDA DEL EQUIPO ERP

### Urgente:
1. ⚠️ **¿Los programas están en modo DEMO/TEST o PRODUCCIÓN?**
2. ⚠️ **¿El cliente CUIT 30697982473 / nro_cliente 100149 existe en la base de datos?**
3. ⚠️ **¿El artículo ID 5970 / SKU 7791813777021 existe en la base de datos?**
4. ⚠️ **¿Qué información aparece en los logs del servidor cuando recibe nuestras peticiones?**
5. ⚠️ **¿Hay alguna configuración adicional necesaria para activar los programas?**

### Adicional:
6. 📖 **Documentación del servicio QUERY (sintaxis correcta)**
7. 🔑 **¿Hay otros servicios disponibles además de PROGRAM y QUERY?**
8. 💡 **¿Existe algún servicio para listar clientes/artículos disponibles?**
9. ✅ **Ejemplo de una petición exitosa real (con respuesta completa)**
10. 🌐 **¿Es mytupac.mooo.com:1030 el servidor de PRODUCCIÓN correcto?**

---

## 💻 HERRAMIENTAS DE PRUEBA

Para replicar las pruebas desde línea de comandos:

### Test Simple con netcat:
```bash
printf '<?xml version="1.0" encoding="UTF-8"?><document><hs>DEMIURGO10-MCANET</hs><service>PROGRAM</service><cuit>30697982473</cuit><program>Interfaz_CRM_ERP_Cliente</program></document>\n' | nc -w 10 mytupac.mooo.com 1030
```

### Verificar conectividad:
```bash
# Verificar puerto abierto
nc -zv mytupac.mooo.com 1030

# Probar handshake inválido (debe dar error 50)
printf '<?xml version="1.0" encoding="UTF-8"?><document><hs>TEST</hs><service>PROGRAM</service><program>Interfaz_CRM_ERP_Cliente</program></document>\n' | nc -w 5 mytupac.mooo.com 1030
```

---

## ✨ ESTADO DE LA INTEGRACIÓN

**La integración en TupacCRM está COMPLETA y FUNCIONAL:**
- ✅ Servicio ERP implementado
- ✅ Endpoints REST disponibles
- ✅ Manejo de errores
- ✅ Parser XML configurado
- ✅ Conexión TCP establecida correctamente
- ✅ Tests exhaustivos realizados

**Solo falta:** Que el servidor ERP devuelva datos reales en lugar del mensaje stub.

---

## 🎯 ACCIÓN REQUERIDA

**Por favor, revisar la configuración del servidor ERP y confirmar:**

1. Que los programas `Interfaz_CRM_ERP_Cliente` e `Interfaz_CRM_ERP_Articulo` estén activos en PRODUCCIÓN
2. Que los datos de prueba (CUIT 30697982473, ID 5970) existan en la base de datos
3. Los logs del servidor cuando se reciben estas peticiones
4. La configuración necesaria para activar la funcionalidad real

---

## 📞 CONTACTO

**Sistema:** TupacCRM  
**Servidor ERP:** mytupac.mooo.com:1030  
**Handshake:** DEMIURGO10-MCANET  
**Fecha del reporte:** 31 de Diciembre de 2025  

---

## 📎 ANEXO: Respuestas del Servidor a Errores

### Error de Handshake Inválido (Funciona correctamente):
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<document>
<service></service>
<name></name>
<strerror>ERROR EN HANDSHECK</strerror>
<STRERROR>ERROR EN HANDSHECK</STRERROR>
<nroerror>50</nroerror>
<NROERROR>50</NROERROR>
</document>
```
✅ Esto confirma que el servidor valida credenciales correctamente.

### Respuesta a Programa Inexistente:
No responde (timeout) - El servidor solo responde a programas conocidos.

### Respuesta a Programas Conocidos:
```xml
<info>ESTA ES INFORMACION RETORNADA POR serverDMUG</info>
```
❌ Siempre el mismo mensaje stub para cualquier petición válida.
