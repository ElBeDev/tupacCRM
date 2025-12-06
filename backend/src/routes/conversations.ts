import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all conversations
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Show all conversations (not just assigned)
    const conversations = await prisma.conversation.findMany({
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            phone: true,
            assignedToId: true,
          },
        },
        messages: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv: any) => ({
      id: conv.id,
      contactId: conv.contactId,
      contactName: conv.contact.name,
      contactPhone: conv.contact.phone || '',
      lastMessage: conv.messages[0]?.content || 'Sin mensajes',
      lastMessageAt: conv.messages[0]?.createdAt || conv.createdAt,
      unreadCount: 0, // TODO: Implement unread count
      channel: conv.channel,
      status: conv.status,
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error loading conversations:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

export default router;
