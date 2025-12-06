import { Router, Request } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get all contacts
router.get('/', authenticate, async (req: Request, res) => {
  try {
    const { status, source, assignedToId, search } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (source) where.source = source;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single contact
router.get('/:id', authenticate, async (req: Request, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        conversations: {
          include: {
            messages: {
              take: 10,
              orderBy: { sentAt: 'desc' },
            },
          },
        },
      },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contact
router.post('/', authenticate, async (req: Request, res) => {
  try {
    const { name, email, phone, source, tags, customFields, assignedToId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if contact with phone already exists
    if (phone) {
      const existingContact = await prisma.contact.findUnique({ where: { phone } });
      if (existingContact) {
        return res.status(400).json({ error: 'Contact with this phone already exists' });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        source: source || 'MANUAL',
        tags: tags || [],
        customFields,
        assignedToId: assignedToId || req.user!.userId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', authenticate, async (req: Request, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, score, tags, customFields, assignedToId } = req.body;

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status,
        score,
        tags,
        customFields,
        assignedToId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: Request, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.delete({ where: { id } });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
