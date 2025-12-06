import { Router, Request, Response } from 'express';
import { getAuthUrl, getTokensFromCode, people, refreshAccessToken } from '../lib/google';
import { generateToken } from '../lib/jwt';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Obtener URL de autorización de Google
router.get('/google/url', (req: Request, res: Response) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error generating auth URL' });
  }
});

// Callback de Google OAuth
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Obtener tokens
    const tokens = await getTokensFromCode(code);

    // Obtener información del usuario de Google
    const oauth2 = people.people;
    const userInfo = await oauth2.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos',
      auth: undefined, // Will use the oauth2Client from lib/google
    });

    const googleId = userInfo.data.resourceName?.split('/')[1];
    const email = userInfo.data.emailAddresses?.[0]?.value;
    const name = userInfo.data.names?.[0]?.displayName;
    const avatar = userInfo.data.photos?.[0]?.url;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Could not get user info from Google' });
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Verificar si existe usuario con ese email
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Vincular cuenta de Google a usuario existente
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
            avatar: avatar || user.avatar,
          },
        });
      } else {
        // Crear nuevo usuario
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            googleId,
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            googleTokenExpiry: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : null,
            avatar,
            role: 'AGENT',
          },
        });
      }
    } else {
      // Actualizar tokens
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
        },
      });
    }

    // Generar JWT tokens
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      '7d'
    );

    // Redirigir al frontend con tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Conectar cuenta de Google a usuario existente
router.post('/google/connect', authenticate, async (req: Request, res: Response) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error generating auth URL' });
  }
});

// Desconectar cuenta de Google
router.post('/google/disconnect', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    res.json({ message: 'Google account disconnected' });
  } catch (error) {
    res.status(500).json({ error: 'Error disconnecting Google account' });
  }
});

// Verificar si tiene cuenta de Google conectada
router.get('/google/status', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        googleId: true,
        googleTokenExpiry: true,
      },
    });

    const isConnected = !!user?.googleId;
    const needsReauth = user?.googleTokenExpiry
      ? new Date(user.googleTokenExpiry) < new Date()
      : false;

    res.json({
      connected: isConnected,
      needsReauth,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error checking Google status' });
  }
});

// Refresh Google tokens
router.post('/google/refresh', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { googleRefreshToken: true },
    });

    if (!user?.googleRefreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const tokens = await refreshAccessToken(user.googleRefreshToken);

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    });

    res.json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error refreshing tokens' });
  }
});

export default router;
