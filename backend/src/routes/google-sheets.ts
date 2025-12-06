import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { googleSheetsService } from '../services/google-sheets.service';
import prisma from '../lib/prisma';

const router = Router();

// Middleware para configurar credenciales de Google
async function setGoogleCredentials(req: Request, res: Response, next: Function) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleAccessToken) {
      return res.status(401).json({ error: 'Google account not connected' });
    }

    googleSheetsService.setUserCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error setting Google credentials' });
  }
}

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// Crear nueva spreadsheet
router.post('/create', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const spreadsheet = await googleSheetsService.createSpreadsheet(title);

    res.json({
      spreadsheetId: spreadsheet.spreadsheetId,
      spreadsheetUrl: spreadsheet.spreadsheetUrl,
      title: spreadsheet.properties?.title,
    });
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    res.status(500).json({ error: 'Error creating spreadsheet' });
  }
});

// Exportar contactos a Google Sheets
router.post('/export', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' });
    }

    await googleSheetsService.exportContactsToSheet(
      spreadsheetId,
      sheetName || 'Contactos'
    );

    res.json({
      message: 'Contacts exported successfully',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Error exporting contacts' });
  }
});

// Importar contactos desde Google Sheets
router.post('/import', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' });
    }

    const result = await googleSheetsService.importContactsFromSheet(
      spreadsheetId,
      sheetName || 'Contactos',
      req.user!.userId
    );

    res.json({
      message: 'Import completed',
      ...result,
    });
  } catch (error) {
    console.error('Error importing contacts:', error);
    res.status(500).json({
      error: 'Error importing contacts',
      details: (error as Error).message,
    });
  }
});

// Crear y exportar (acción rápida)
router.post('/quick-export', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    // Crear spreadsheet
    const spreadsheet = await googleSheetsService.createSpreadsheet(
      title || 'TupacCRM - Contactos'
    );

    const spreadsheetId = spreadsheet.spreadsheetId!;

    // Exportar contactos
    await googleSheetsService.exportContactsToSheet(spreadsheetId, 'Contactos');

    res.json({
      message: 'Spreadsheet created and contacts exported',
      spreadsheetId,
      spreadsheetUrl: spreadsheet.spreadsheetUrl,
    });
  } catch (error) {
    console.error('Error in quick export:', error);
    res.status(500).json({ error: 'Error in quick export' });
  }
});

// Obtener información de spreadsheet
router.get('/info/:spreadsheetId', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { spreadsheetId } = req.params;
    const info = await googleSheetsService.getSpreadsheetInfo(spreadsheetId);

    res.json({
      spreadsheetId: info.spreadsheetId,
      title: info.properties?.title,
      sheets: info.sheets?.map(sheet => ({
        title: sheet.properties?.title,
        sheetId: sheet.properties?.sheetId,
      })),
      spreadsheetUrl: info.spreadsheetUrl,
    });
  } catch (error) {
    console.error('Error getting spreadsheet info:', error);
    res.status(500).json({ error: 'Error getting spreadsheet info' });
  }
});

// Sincronizar contactos (importar cambios)
router.post('/sync', setGoogleCredentials, async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, sheetName } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' });
    }

    await googleSheetsService.syncContacts(
      spreadsheetId,
      sheetName || 'Contactos',
      req.user!.userId
    );

    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Error syncing contacts:', error);
    res.status(500).json({ error: 'Error syncing contacts' });
  }
});

export default router;
