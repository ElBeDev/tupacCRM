# Configuración de Google OAuth 2.0

Para habilitar el login con Google y las integraciones de Calendar y Sheets, necesitas crear credenciales en Google Cloud Console.

## Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Asigna un nombre al proyecto (ej: "TupacCRM")

## Paso 2: Habilitar APIs

Navega a **APIs & Services > Library** y habilita las siguientes APIs:

- ✅ **Google+ API** o **People API** (para información del usuario)
- ✅ **Google Calendar API**
- ✅ **Google Sheets API**

## Paso 3: Configurar Pantalla de Consentimiento

1. Ve a **APIs & Services > OAuth consent screen**
2. Selecciona tipo de usuario: **External** (o Internal si es Google Workspace)
3. Completa la información:
   - **Nombre de la aplicación**: TupacCRM
   - **Email de soporte**: tu email
   - **Logo** (opcional)
   - **Dominio autorizado**: `localhost` (para desarrollo)

4. En **Scopes**, agrega:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/calendar`
   - `../auth/spreadsheets`

5. Guarda y continúa

## Paso 4: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services > Credentials**
2. Click en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Tipo de aplicación: **Web application**
4. Nombre: "TupacCRM Web Client"
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:3001/api/google/callback
   http://localhost:3000/auth/callback
   ```

7. Click en **CREATE**

## Paso 5: Obtener Credenciales

Después de crear el cliente OAuth, verás:
- **Client ID**: algo como `123456789-abc...googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-abc...`

⚠️ **Guarda estas credenciales de forma segura**

## Paso 6: Configurar Variables de Entorno

Actualiza tu archivo `backend/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback
FRONTEND_URL=http://localhost:3000
```

## Paso 7: Reiniciar Servidores

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Paso 8: Probar la Integración

1. Ve a http://localhost:3000/login
2. Click en "Continuar con Google"
3. Autoriza los permisos solicitados
4. Serás redirigido al dashboard

## Notas de Producción

Para producción, necesitarás:

1. **Verificar la aplicación** en Google (si requieres scopes sensibles)
2. Actualizar las URLs autorizadas con tu dominio real:
   ```
   https://tudominio.com
   https://api.tudominio.com/api/google/callback
   ```

3. Usar variables de entorno de producción en tu servidor

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URI en `.env` coincida exactamente con la configurada en Google Cloud Console
- Asegúrate de incluir `http://` o `https://`

### Error: "access_denied"
- El usuario rechazó los permisos
- Verifica que los scopes estén correctamente configurados

### Error: "invalid_client"
- Client ID o Secret incorrectos
- Revisa las variables de entorno

## Recursos

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
