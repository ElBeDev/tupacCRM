import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { googleCalendarService } from '../services/google-calendar.service';
import prisma from '../lib/prisma';

const router = Router();

// Middleware para configurar credenciales de Google
async function setGoogleCredentials(req: Request, res: Response, next: Function) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken) {
      return res.status(401).json({ error: 'Google account not connected' });
    }

    googleCalendarService.setUserCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error setting Google credentials' });
  }
}

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Crear evento en calendario
router.post('/events', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { summary, description, startDateTime, endDateTime, attendees, location, contactId } =
      req.body;

    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({
        error: 'Summary, startDateTime, and endDateTime are required',
      });
    }

    const event = await googleCalendarService.createEvent({
      summary,
      description,
      startDateTime,
      endDateTime,
      attendees,
      location,
    });

    // Si se proporciona contactId, asociar el evento al contacto
    if (contactId) {
      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      const existingFields = (contact?.customFields as any) || {};
      const existingEvents = existingFields.calendarEvents || [];
      
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          customFields: {
            ...existingFields,
            calendarEvents: [
              ...existingEvents,
              {
                eventId: event.id,
                summary: event.summary,
                startDateTime,
                endDateTime,
              },
            ],
          },
        },
      });
    }

    res.json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Error creating calendar event' });
  }
});

// Listar próximos eventos
router.get('/events', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const maxResults = parseInt(req.query.maxResults as string) || 10;
    const events = await googleCalendarService.listUpcomingEvents(maxResults);
    res.json(events);
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Error listing events' });
  }
});

// Obtener evento específico
router.get('/events/:eventId', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = await googleCalendarService.getEvent(eventId);
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Error getting event' });
  }
});

// Actualizar evento
router.put('/events/:eventId', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { summary, description, startDateTime, endDateTime, attendees, location } = req.body;

    const event = await googleCalendarService.updateEvent(eventId, {
      summary,
      description,
      startDateTime,
      endDateTime,
      attendees,
      location,
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// Eliminar evento
router.delete('/events/:eventId', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    await googleCalendarService.deleteEvent(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Obtener eventos de un contacto específico
router.get('/events/contact/:contactId', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { email: true },
    });

    if (!contact?.email) {
      return res.status(400).json({ error: 'Contact email not found' });
    }

    const events = await googleCalendarService.getEventsByContact(contact.email);
    res.json(events);
  } catch (error) {
    console.error('Error getting contact events:', error);
    res.status(500).json({ error: 'Error getting contact events' });
  }
});

// Verificar disponibilidad
router.post('/availability', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { startDateTime, endDateTime } = req.body;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        error: 'startDateTime and endDateTime are required',
      });
    }

    const isAvailable = await googleCalendarService.checkAvailability(
      startDateTime,
      endDateTime
    );

    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Error checking availability' });
  }
});

export default router;
