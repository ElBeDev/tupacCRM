import prisma from '../lib/prisma';

export class TicketService {
  // Generar número de ticket único
  private async generateTicketNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Buscar el último ticket del día
    const lastTicket = await prisma.ticket.findFirst({
      where: {
        ticketNumber: {
          startsWith: `TKT-${dateStr}`,
        },
      },
      orderBy: { ticketNumber: 'desc' },
    });

    let sequence = 1;
    if (lastTicket) {
      const lastSequence = parseInt(lastTicket.ticketNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `TKT-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  // Crear ticket desde conversación (cuando se detecta reclamo)
  async createFromConversation(data: {
    contactId: string;
    conversationId?: string;
    type?: 'COMPLAINT' | 'QUESTION' | 'RETURN' | 'EXCHANGE' | 'OTHER';
    subject: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    const ticketNumber = await this.generateTicketNumber();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        contactId: data.contactId,
        conversationId: data.conversationId,
        type: data.type || 'COMPLAINT',
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        contact: true,
      },
    });

    console.log(`📋 Ticket created: ${ticketNumber} - ${data.subject}`);
    return ticket;
  }

  // Obtener todos los tickets
  async getAll(filters?: {
    status?: string;
    type?: string;
    priority?: string;
    contactId?: string;
  }) {
    const where: any = {};

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters?.type && filters.type !== 'all') {
      where.type = filters.type;
    }
    if (filters?.priority && filters.priority !== 'all') {
      where.priority = filters.priority;
    }
    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    return prisma.ticket.findMany({
      where,
      include: {
        contact: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener ticket por ID
  async getById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedTo: true,
        conversation: true,
      },
    });
  }

  // Actualizar ticket
  async update(id: string, data: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    resolution?: string;
  }) {
    const updateData: any = { ...data };

    // Si se resuelve, agregar fecha
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    return prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        assignedTo: true,
      },
    });
  }

  // Estadísticas de tickets
  async getStats() {
    const [total, open, inProgress, resolved] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
    ]);

    return { total, open, inProgress, resolved };
  }
}

export const ticketService = new TicketService();
