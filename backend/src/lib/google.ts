import { google } from 'googleapis';

// OAuth2 Client para autenticación
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes que necesitamos
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Generar URL de autorización
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    prompt: 'consent', // Para obtener refresh token siempre
  });
}

// Obtener tokens desde el código de autorización
export async function getTokensFromCode(code: string): Promise<any> {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Configurar credenciales
export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens);
}

// Refresh token si es necesario
export async function refreshAccessToken(refreshToken: string): Promise<any> {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

// Google Calendar API
export const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Google Sheets API
export const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

// People API para info del usuario
export const people = google.people({ version: 'v1', auth: oauth2Client });
