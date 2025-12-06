import { calendar, setCredentials } from '../lib/google';
import { calendar_v3 } from 'googleapis';

export interface CreateEventParams {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
  location?: string;
  timeZone?: string;
}

export class GoogleCalendarService {
  // Configurar credenciales del usuario
  setUserCredentials(tokens: any) {
    setCredentials(tokens);
  }

  // Crear un evento en el calendario
  async createEvent(params: CreateEventParams): Promise<calendar_v3.Schema$Event> {
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: {
        dateTime: params.startDateTime,
        timeZone: params.timeZone || 'America/Mexico_City',
      },
      end: {
        dateTime: params.endDateTime,
        timeZone: params.timeZone || 'America/Mexico_City',
      },
      attendees: params.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 día antes
          { method: 'popup', minutes: 30 }, // 30 minutos antes
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Enviar notificaciones a asistentes
    });

    return response.data;
  }

  // Listar eventos próximos
  async listUpcomingEvents(maxResults: number = 10): Promise<calendar_v3.Schema$Event[]> {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  // Obtener un evento específico
  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    return response.data;
  }

  // Actualizar un evento
  async updateEvent(
    eventId: string,
    params: Partial<CreateEventParams>
  ): Promise<calendar_v3.Schema$Event> {
    const event: calendar_v3.Schema$Event = {};

    if (params.summary) event.summary = params.summary;
    if (params.description) event.description = params.description;
    if (params.location) event.location = params.location;

    if (params.startDateTime) {
      event.start = {
        dateTime: params.startDateTime,
        timeZone: params.timeZone || 'America/Mexico_City',
      };
    }

    if (params.endDateTime) {
      event.end = {
        dateTime: params.endDateTime,
        timeZone: params.timeZone || 'America/Mexico_City',
      };
    }

    if (params.attendees) {
      event.attendees = params.attendees.map(email => ({ email }));
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data;
  }

  // Eliminar un evento
  async deleteEvent(eventId: string): Promise<void> {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  }

  // Buscar eventos por contacto (email en attendees)
  async getEventsByContact(contactEmail: string): Promise<calendar_v3.Schema$Event[]> {
    const response = await calendar.events.list({
      calendarId: 'primary',
      q: contactEmail,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  // Verificar disponibilidad en un rango de tiempo
  async checkAvailability(startDateTime: string, endDateTime: string): Promise<boolean> {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDateTime,
        timeMax: endDateTime,
        items: [{ id: 'primary' }],
      },
    });

    const busy = response.data.calendars?.primary?.busy || [];
    return busy.length === 0; // true si está libre
  }
}

export const googleCalendarService = new GoogleCalendarService();
