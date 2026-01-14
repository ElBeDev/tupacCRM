# 🚀 Pasos Finales para Activar Multi-Agente con ERP en VPS

## ✅ Estado Actual

- ✅ Código desplegado en la VPS
- ✅ Contenedores backend y frontend corriendo
- ⚠️ Falta configurar variables de entorno correctamente

---

## 🔧 Paso 1: Configurar Variables de Entorno en Docker

### Opción A: Manual (Recomendado)

Conéctate a la VPS:

```bash
ssh root@72.62.11.244
cd /var/www/tupaccrm
```

Edita el `docker-compose.yml` y agrega las variables de entorno en el servicio backend:

```bash
nano docker-compose.yml
```

Busca la sección `backend:` y actualiza el `environment`:

```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: tupaccrm-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://postgres:postgres_password@postgres:5432/tupaccrm
      REDIS_URL: redis://redis:6379
      # OpenAI API Key (IMPORTANTE: copiar desde backend/.env)
      OPENAI_API_KEY: sk-your-openai-api-key-here
      # ERP Configuration
      ERP_HOST: mytupac.mooo.com
      ERP_PORT: 1030
      ERP_HS: DEMIURGO10-MCANET
    env_file:
      - backend/.env
    volumes:
      - ./whatsapp-sessions:/app/whatsapp-sessions
    depends_on:
      - postgres
      - redis
    networks:
      - tupaccrm-network
```

Guarda (`Ctrl+O`, `Enter`, `Ctrl+X`)

### Opción B: Usando Script

```bash
ssh root@72.62.11.244

cd /var/www/tupaccrm

# Agregar variables al docker-compose
cat >> docker-compose.yml << 'EOF'

# Agregar después de REDIS_URL:
      OPENAI_API_KEY: ${OPENAI_API_KEY:-sk-your-key}
      ERP_HOST: ${ERP_HOST:-mytupac.mooo.com}
      ERP_PORT: ${ERP_PORT:-1030}
      ERP_HS: ${ERP_HS:-DEMIURGO10-MCANET}
EOF
```

---

## 🔧 Paso 2: Reiniciar Contenedores

```bash
cd /var/www/tupaccrm

# Detener todos los contenedores
docker-compose down

# Iniciar de nuevo
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps

# Verificar variables de entorno
docker-compose exec backend env | grep -E "OPENAI|ERP"
```

**Salida esperada:**
```
OPENAI_API_KEY=sk-proj-cvdp1DNO...
ERP_HOST=mytupac.mooo.com
ERP_PORT=1030
ERP_HS=DEMIURGO10-MCANET
```

---

## 🤖 Paso 3: Crear los Asistentes

Una vez que las variables estén configuradas correctamente:

```bash
cd /var/www/tupaccrm/backend

# Ejecutar el seed de asistentes
docker-compose exec backend npx ts-node seed-assistants.ts
```

**Salida esperada:**
```
🤖 Creando Asistentes Especialistas...

👤 Asignando asistentes a: Usuario Demo (demo@tupaccrm.com)

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
```

---

## 🧪 Paso 4: Verificar que Funciona

### 4.1 Verificar en el Dashboard

1. Ve a: `https://srv1190739.hstgr.cloud/dashboard/testing`
2. Deberías ver los 5 asistentes creados
3. Selecciona **"Consultor de Precios"**
4. Escribe: `"¿Cuánto cuesta la coca cola?"`

**Si todo está bien:**
- El asistente consultará el ERP
- Mostrará precio real, stock y promociones

### 4.2 Probar desde Terminal (Opcional)

```bash
# Probar conexión al ERP desde el contenedor
docker-compose exec backend node -e "
const erpService = require('./dist/services/erp.service').default;

(async () => {
  try {
    console.log('🔍 Buscando productos...');
    const products = await erpService.searchProductsByName('coca');
    console.log('✅ Encontrados:', products.length, 'productos');
    
    if (products.length > 0) {
      console.log(erpService.formatProductInfo(products[0]));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
"
```

### 4.3 Ver Logs en Tiempo Real

```bash
# Logs del backend
docker-compose logs -f backend

# Buscar logs de consultas al ERP
docker-compose logs backend | grep -E "ERP|🔍|📊"
```

---

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY not configured"

**Causa**: La API key no se está cargando en el contenedor

**Solución**:
```bash
# Verificar que el .env del backend tenga la key
cat backend/.env | grep OPENAI

# Verificar docker-compose.yml
cat docker-compose.yml | grep -A 15 "backend:"

# Reiniciar contenedores
docker-compose restart backend
```

### Error: "401 Incorrect API key"

**Causa**: La API key de OpenAI es inválida o está expirada

**Solución**:
1. Ve a: https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Actualiza `backend/.env` con la nueva key
4. Actualiza `docker-compose.yml` si es necesario
5. Reinicia: `docker-compose restart backend`

### Error: "Timeout: El servidor no respondió"

**Causa**: El ERP no responde o no es accesible desde la VPS

**Solución**:
```bash
# Probar conectividad desde la VPS
nc -zv mytupac.mooo.com 1030

# Si falla, verificar firewall
ufw status

# Probar desde el contenedor
docker-compose exec backend sh -c "nc -zv mytupac.mooo.com 1030"
```

### Los asistentes no se consultan entre sí

**Causa**: Smart Tags no detecta las intenciones correctamente

**Solución**:
```bash
# Ver logs del backend cuando llega un mensaje
docker-compose logs -f backend

# Buscar líneas como:
# 🏷️ Detecting intent with Smart Tags...
# 🎯 Intent detected: consulta_precio
# 🔗 Consulting specialist: Consultor de Precios
```

---

## 📝 Resumen de Comandos Útiles

```bash
# Conectar a la VPS
ssh root@72.62.11.244

# Ver estado de contenedores
cd /var/www/tupaccrm && docker-compose ps

# Reiniciar todo
docker-compose restart

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Ejecutar seed de asistentes
docker-compose exec backend npx ts-node seed-assistants.ts

# Verificar variables de entorno
docker-compose exec backend env | grep -E "OPENAI|ERP"

# Probar ERP manualmente
echo '<?xml version="1.0" encoding="UTF-8"?>
<document>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>coca</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>' | nc -w 30 mytupac.mooo.com 1030
```

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en docker-compose.yml
- [ ] Contenedores reiniciados (`docker-compose restart`)
- [ ] Variables verificadas (`docker-compose exec backend env | grep OPENAI`)
- [ ] Asistentes creados (`npx ts-node seed-assistants.ts`)
- [ ] Probado en dashboard (`/dashboard/testing`)
- [ ] Probado consulta de precios con ERP
- [ ] Logs sin errores (`docker-compose logs backend`)

---

## 🎯 URLs de Acceso

- **Dashboard**: https://srv1190739.hstgr.cloud/dashboard
- **Testing**: https://srv1190739.hstgr.cloud/dashboard/testing
- **Backend API**: https://srv1190739.hstgr.cloud/api

---

¡Una vez completados estos pasos, tu sistema multi-agente con ERP estará funcionando en producción! 🚀
