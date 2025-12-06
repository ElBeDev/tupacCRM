import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all campaigns
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const campaigns = await prisma.campaign.findMany({
      where: {
        createdById: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform campaigns to include parsed metrics
    const transformedCampaigns = campaigns.map((campaign: any) => {
      const metrics = typeof campaign.metrics === 'string' 
        ? JSON.parse(campaign.metrics) 
        : campaign.metrics || { sent: 0, delivered: 0, read: 0, replied: 0 };
      
      return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.messageTemplate?.substring(0, 100) || '',
        status: campaign.status.toLowerCase(),
        channel: campaign.channel.toLowerCase(),
        targetAudience: 0, // TODO: Calculate from targetSegment
        sentCount: metrics.sent || 0,
        deliveredCount: metrics.delivered || 0,
        readCount: metrics.read || 0,
        responseCount: metrics.replied || 0,
        scheduledFor: campaign.scheduledAt?.toISOString(),
        createdAt: campaign.createdAt.toISOString(),
      };
    });

    res.json(transformedCampaigns);
  } catch (error) {
    console.error('Error loading campaigns:', error);
    res.status(500).json({ error: 'Failed to load campaigns' });
  }
});

// Create campaign
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { name, type, channel, messageTemplate, scheduledAt } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type: type || 'BROADCAST',
        channel,
        status: 'DRAFT',
        messageTemplate: messageTemplate || '',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdById: userId,
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get campaign by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error loading campaign:', error);
    res.status(500).json({ error: 'Failed to load campaign' });
  }
});

// Update campaign
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id },
    });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
