import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Get Google connection status
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    const isConnected = !!(user?.googleAccessToken && user?.googleRefreshToken);

    res.json({
      connected: isConnected,
      hasCalendar: isConnected,
      hasSheets: isConnected,
    });
  } catch (error) {
    console.error('Error checking Google status:', error);
    res.status(500).json({ error: 'Failed to check Google status' });
  }
});

export default router;
