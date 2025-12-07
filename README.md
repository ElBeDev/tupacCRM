# TupacCRM 🚀

![TupacCRM Banner](https://img.shields.io/badge/TupacCRM-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://img.shields.io/badge/deploy-production-success)

**TupacCRM** es un CRM completo basado en IA, open-source y auto-hospedado, diseñado para gestionar conversaciones multicanal, automatizar ventas y pre-calificar leads con inteligencia artificial.

## ✨ Características

- 🤖 **IA Integrada**: Pre-calificación automática de leads y respuestas inteligentes
- 📱 **Multi-canal**: WhatsApp, Instagram, Facebook, TikTok (próximamente)
- 💬 **Chat en Tiempo Real**: WebSockets para mensajería instantánea
- 📊 **Pipeline de Ventas**: Gestión visual de leads y oportunidades
- 🔄 **Automatizaciones**: Campañas y seguimientos automatizados
- 🔐 **Google OAuth**: Login seguro con Google
- 📈 **Analytics**: Métricas y reportes en tiempo real
- 🎨 **UI Moderna**: Interface intuitiva con Tailwind CSS

## 🏗️ Arquitectura

```
tupacCRM/
├── backend/          # API REST + WebSockets (Node.js + Express)
├── frontend/         # Interface web (Next.js + React)
├── shared/           # Tipos y utilidades compartidas
├── docker-compose.yml
└── workflow.md       # Documentación del proyecto
```

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** 20+ 
- **Docker** y **Docker Compose**
- **npm** o **pnpm**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/tupacCRM.git
cd tupacCRM
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura:

```env
# Base de datos (ya configurado para Docker)
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/tupaccrm
REDIS_URL=redis://localhost:6379

# JWT (IMPORTANTE: Cambia estos valores)
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_REFRESH_SECRET=tu-clave-refresh-muy-segura
SESSION_SECRET=tu-clave-session-muy-segura

# Google OAuth (obtén en https://console.cloud.google.com)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# OpenAI (obtén en https://platform.openai.com)
OPENAI_API_KEY=sk-tu-api-key
```

### 3. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 4. Iniciar con Docker (Recomendado)

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`
- Backend API en `http://localhost:3001`
- Frontend en `http://localhost:3000`

### 5. Configurar Base de Datos

**Generar Prisma Client:**
```bash
cd backend
npm run prisma:generate
```

**Ejecutar migraciones:**
```bash
npm run prisma:migrate
```

**Ver base de datos (opcional):**
```bash
npm run prisma:studio
```

### 6. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555

## 🛠️ Desarrollo Local (Sin Docker)

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Asegúrate de tener PostgreSQL y Redis corriendo localmente.

## 📦 Stack Tecnológico

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Redis** (cache y colas)
- **Socket.io** (WebSockets)
- **Baileys** (WhatsApp sin API oficial)
- **OpenAI** / **LangChain** (IA)
- **Passport.js** (Google OAuth)

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (estado global)
- **TanStack Query** (data fetching)
- **Socket.io-client** (WebSockets)

### DevOps
- **Docker** + **Docker Compose**
- **PostgreSQL 16**
- **Redis 7**

## 🔧 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir imágenes
docker-compose up -d --build
```

### Backend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
npm start

# Prisma
npm run prisma:generate    # Generar cliente
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:push        # Push schema sin migración
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
npm start

# Lint
npm run lint
```

## 📚 Documentación

- [Workflow del Proyecto](./workflow.md) - Roadmap completo y features planificadas
- [Arquitectura del Sistema](./workflow.md#arquitectura-del-sistema)
- [Modelos de Datos](./workflow.md#modelos-de-datos-principales)

## 🔐 Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura URI de redirección: `http://localhost:3001/auth/google/callback`
6. Copia Client ID y Client Secret al `.env`

## 📱 Configuración de WhatsApp

TupacCRM usa **Baileys** para conectarse a WhatsApp mediante escaneo de QR, sin necesidad de la API oficial:

1. Inicia el backend
2. Navega a la sección de WhatsApp en el dashboard
3. Escanea el código QR con tu teléfono
4. ¡Listo! Las sesiones se guardan automáticamente

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Roadmap

- [x] Setup inicial del proyecto
- [x] Configuración de base de datos
- [x] API básica
- [ ] Autenticación con Google OAuth
- [ ] Integración WhatsApp (QR)
- [ ] Sistema de chat en tiempo real
- [ ] Agente de IA
- [ ] Dashboard de analytics
- [ ] Campañas automatizadas
- [ ] Integraciones Google (Sheets, Calendar)
- [ ] Instagram, Facebook, TikTok

Ver roadmap completo en [workflow.md](./workflow.md)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Trabajo Inicial* - [@tuusuario](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Inspirado en [Prometheo CRM](https://prometheo.ai/)
- Comunidad de código abierto
- Contributors y testers

## 📞 Soporte

¿Necesitas ayuda? 

- 📧 Email: support@tupaccrm.com
- 💬 Discord: [Únete a nuestra comunidad](#)
- 🐛 Issues: [GitHub Issues](https://github.com/tuusuario/tupacCRM/issues)

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**

Hecho con ❤️ por la comunidad
