import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { ticketService } from '../services/ticket.service';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/tickets
 * Listar todos los tickets con filtros
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, priority, contactId } = req.query;

    const tickets = await ticketService.getAll({
      status: status as string,
      type: type as string,
      priority: priority as string,
      contactId: contactId as string,
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * GET /api/tickets/stats
 * Estadísticas de tickets
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await ticketService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/tickets/:id
 * Obtener ticket por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await ticketService.getById(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * POST /api/tickets
 * Crear ticket manualmente
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { contactId, conversationId, type, subject, description, priority } = req.body;

    if (!contactId || !subject) {
      return res.status(400).json({ error: 'contactId and subject are required' });
    }

    const ticket = await ticketService.createFromConversation({
      contactId,
      conversationId,
      type,
      subject,
      description,
      priority,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * PUT /api/tickets/:id
 * Actualizar ticket
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId, resolution } = req.body;

    const ticket = await ticketService.update(id, {
      status,
      priority,
      assignedToId,
      resolution,
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * DELETE /api/tickets/:id
 * Eliminar ticket
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.ticket.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
