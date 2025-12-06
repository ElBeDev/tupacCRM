import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/orders
 * Listar todos los pedidos con filtros opcionales
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, contactId, search, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (contactId) {
      where.contactId = contactId;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
        { contact: { name: { contains: search as string, mode: 'insensitive' } } },
        { contact: { phone: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          items: true,
          conversation: {
            select: {
              id: true,
              channel: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:id
 * Obtener un pedido específico con todos sus detalles
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        contact: true,
        items: true,
        conversation: {
          include: {
            messages: {
              orderBy: { sentAt: 'asc' },
              take: 50,
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * POST /api/orders
 * Crear un nuevo pedido
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { contactId, conversationId, items, notes, pickupDate } = req.body;

    if (!contactId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Contact ID and items are required' });
    }

    // Generar número de orden único
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Calcular total
    const totalAmount = items.reduce((sum: number, item: any) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + subtotal;
    }, 0);

    // Crear pedido con items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        contactId,
        conversationId: conversationId || null,
        notes,
        totalAmount,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        items: {
          create: items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        contact: true,
        items: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * PUT /api/orders/:id
 * Actualizar un pedido existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, pickupDate, items } = req.body;

    // Verificar que el pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (pickupDate) updateData.pickupDate = new Date(pickupDate);
    
    // Si el pedido se marca como completado, agregar fecha
    if (status === 'COMPLETED' && !existingOrder.completedAt) {
      updateData.completedAt = new Date();
    }

    // Si se actualizan los items, recalcular total
    if (items && items.length > 0) {
      const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      updateData.totalAmount = totalAmount;

      // Eliminar items antiguos y crear nuevos
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      updateData.items = {
        create: items.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
          notes: item.notes || null,
        })),
      };
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        items: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * DELETE /api/orders/:id
 * Eliminar un pedido (solo si está en estado PENDING o CANCELLED)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Solo permitir eliminar pedidos pendientes o cancelados
    if (!['PENDING', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ 
        error: 'Can only delete PENDING or CANCELLED orders' 
      });
    }

    await prisma.order.delete({
      where: { id },
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

/**
 * GET /api/orders/stats/summary
 * Estadísticas de pedidos
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    res.json({
      total: totalOrders,
      byStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      revenue: totalRevenue._sum.totalAmount || 0,
      today: todayOrders,
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
});

export default router;
