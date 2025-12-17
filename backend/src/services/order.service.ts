import prisma from '../lib/prisma';

export interface OrderItemDTO {
  productName: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreateOrderFromConversationDTO {
  contactId: string;
  conversationId: string;
  items: OrderItemDTO[];
  notes?: string;
}

export class OrderService {
  /**
   * Crear un pedido desde una conversación de WhatsApp
   */
  async createFromConversation(data: CreateOrderFromConversationDTO) {
    const { contactId, conversationId, items, notes } = data;

    // Generar número de orden único
    const orderCount = await prisma.order.count();
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const orderNumber = `TUP-${dateStr}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Calcular total (si no hay precios, dejar en 0 para completar después)
    const totalAmount = items.reduce((sum, item) => {
      const subtotal = item.quantity * (item.unitPrice || 0);
      return sum + subtotal;
    }, 0);

    // Crear pedido con items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        contactId,
        conversationId,
        notes: notes || 'Pedido recibido por WhatsApp',
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            subtotal: item.quantity * (item.unitPrice || 0),
            notes: item.notes || null,
          })),
        },
      },
      include: {
        contact: true,
        items: true,
      },
    });

    console.log(`📦 Order created: ${orderNumber} for contact ${order.contact.name}`);
    return order;
  }

  /**
   * Parsear productos de un mensaje de texto
   * Ejemplo: "5 packs coca cola 2.25, 3 aceite cocinero 1.5L"
   */
  parseProductsFromMessage(message: string): OrderItemDTO[] {
    const items: OrderItemDTO[] = [];
    
    // Patrones comunes para detectar productos
    // "5 coca cola", "coca cola x5", "5 packs de coca cola"
    const lines = message.split(/[,\n]+/).map(l => l.trim()).filter(l => l);
    
    for (const line of lines) {
      // Intentar extraer cantidad y producto
      const quantityMatch = line.match(/^(\d+)\s*(?:x|packs?|unidades?|u\.?)?\s*(.+)/i);
      const quantityAtEndMatch = line.match(/(.+?)\s*x\s*(\d+)$/i);
      
      let quantity = 1;
      let productName = line;
      
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        productName = quantityMatch[2].trim();
      } else if (quantityAtEndMatch) {
        productName = quantityAtEndMatch[1].trim();
        quantity = parseInt(quantityAtEndMatch[2]);
      }
      
      if (productName) {
        items.push({
          productName,
          quantity,
          unitPrice: 0, // Se completa después
        });
      }
    }
    
    return items;
  }

  /**
   * Obtener pedidos pendientes de un contacto
   */
  async getPendingOrdersByContact(contactId: string) {
    return prisma.order.findMany({
      where: {
        contactId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marcar pedido como listo (esto dispara la notificación WhatsApp via el endpoint PUT)
   */
  async markAsReady(orderId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'READY' },
      include: { contact: true, items: true },
    });
    
    return order;
  }

  /**
   * Obtener resumen de pedidos del día
   */
  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
      },
      include: {
        contact: { select: { name: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const byStatus = {
      PENDING: orders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
      PREPARING: orders.filter(o => o.status === 'PREPARING').length,
      READY: orders.filter(o => o.status === 'READY').length,
      COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
    };

    return {
      total: orders.length,
      byStatus,
      orders,
    };
  }
}

export default new OrderService();
