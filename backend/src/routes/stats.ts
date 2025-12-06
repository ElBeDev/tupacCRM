import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener estadísticas del dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Total de contactos
    const totalContacts = await prisma.contact.count();

    // Contactos por estado
    const contactsByStatus = await prisma.contact.groupBy({
      by: ['status'],
      _count: true,
    });

    // Conversaciones activas (abiertas)
    const activeConversations = await prisma.conversation.count({
      where: {
        status: 'OPEN',
      },
    });

    // Mensajes de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messagesToday = await prisma.message.count({
      where: {
        sentAt: {
          gte: today,
        },
      },
    });

    // Contactos por fuente
    const contactsBySource = await prisma.contact.groupBy({
      by: ['source'],
      _count: true,
    });

    // Nuevos contactos últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newContactsWeek = await prisma.contact.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Contactos por día (últimos 7 días)
    const contactsPerDay = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::bigint as count
      FROM contacts
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    // Tasa de conversión (QUALIFIED -> WON)
    const qualifiedCount = await prisma.contact.count({
      where: { status: 'QUALIFIED' },
    });
    const wonCount = await prisma.contact.count({
      where: { status: 'WON' },
    });

    const conversionRate = qualifiedCount > 0 
      ? ((wonCount / qualifiedCount) * 100).toFixed(1)
      : '0.0';

    // Score promedio de contactos
    const avgScore = await prisma.contact.aggregate({
      _avg: {
        score: true,
      },
    });

    res.json({
      summary: {
        totalContacts,
        activeConversations,
        messagesToday,
        newContactsWeek,
        conversionRate: parseFloat(conversionRate),
        avgScore: avgScore._avg.score || 0,
      },
      contactsByStatus: contactsByStatus.map((item: any) => ({
        status: item.status,
        count: item._count,
      })),
      contactsBySource: contactsBySource.map((item: any) => ({
        source: item.source,
        count: item._count,
      })),
      contactsPerDay: contactsPerDay.map((item: any) => ({
        date: item.date,
        count: Number(item.count),
      })),
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Error retrieving statistics' });
  }
});

// Estadísticas de conversaciones
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const total = await prisma.conversation.count();
    
    const byStatus = await prisma.conversation.groupBy({
      by: ['status'],
      _count: true,
    });

    const byChannel = await prisma.conversation.groupBy({
      by: ['channel'],
      _count: true,
    });

    res.json({
      total,
      byStatus: byStatus.map((item: any) => ({
        status: item.status,
        count: item._count,
      })),
      byChannel: byChannel.map((item: any) => ({
        channel: item.channel,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error('Error getting conversation stats:', error);
    res.status(500).json({ error: 'Error retrieving conversation statistics' });
  }
});

export default router;
