import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Obtener estadísticas del dashboard
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Contar contactos totales
    const totalContacts = await prisma.contact.count();

    // Contar conversaciones activas
    const activeConversations = await prisma.conversation.count({
      where: {
        status: {
          in: ['OPEN', 'PENDING'],
        },
      },
    });

    // Contar leads calificados (score >= 50)
    const qualifiedLeads = await prisma.contact.count({
      where: {
        score: {
          gte: 50,
        },
        status: {
          in: ['QUALIFIED', 'PROPOSAL'],
        },
      },
    });

    // Contar ventas cerradas
    const closedDeals = await prisma.contact.count({
      where: {
        status: 'WON',
      },
    });

    // Contactos por fuente
    const contactsBySource = await prisma.contact.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
    });

    // Contactos por estado
    const contactsByStatus = await prisma.contact.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Tendencia de contactos (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const contactsTrend = await prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT DATE(created_at) as date, COUNT(*)::bigint as count
      FROM contacts
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Mensajes recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messageStats = await prisma.message.groupBy({
      by: ['sender_type'],
      where: {
        sent_at: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Tasa de conversión (contactos a ventas)
    const conversionRate =
      totalContacts > 0 ? ((closedDeals / totalContacts) * 100).toFixed(1) : '0';

    // Score promedio de leads
    const avgScore = await prisma.contact.aggregate({
      _avg: {
        score: true,
      },
    });

    res.json({
      summary: {
        totalContacts,
        activeConversations,
        qualifiedLeads,
        closedDeals,
        conversionRate: parseFloat(conversionRate),
        avgLeadScore: Math.round(avgScore._avg.score || 0),
      },
      contactsBySource: contactsBySource.map((item: any) => ({
        source: item.source,
        count: item._count.id,
      })),
      contactsByStatus: contactsByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.id,
      })),
      contactsTrend: contactsTrend.map((item: any) => ({
        date: item.date,
        count: Number(item.count),
      })),
      messageStats: messageStats.map((item: any) => ({
        type: item.sender_type,
        count: item._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Obtener actividad reciente
router.get('/activity', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Últimos contactos creados
    const recentContacts = await prisma.contact.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,
      },
    });

    // Últimos mensajes
    const recentMessages = await prisma.message.findMany({
      take: limit,
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        conversation: {
          include: {
            contact: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      recentContacts,
      recentMessages: recentMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content.substring(0, 100),
        senderType: msg.senderType,
        sentAt: msg.sentAt,
        contactName: msg.conversation.contact.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Error fetching activity' });
  }
});

export default router;
