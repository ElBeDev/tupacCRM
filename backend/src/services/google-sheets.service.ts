import { sheets, setCredentials } from '../lib/google';
import { sheets_v4 } from 'googleapis';
import prisma from '../lib/prisma';

export interface SpreadsheetConfig {
  spreadsheetId?: string;
  sheetName?: string;
}

export class GoogleSheetsService {
  // Configurar credenciales del usuario
  setUserCredentials(tokens: any) {
    setCredentials(tokens);
  }

  // Crear una nueva spreadsheet
  async createSpreadsheet(title: string): Promise<sheets_v4.Schema$Spreadsheet> {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Contactos',
              gridProperties: {
                frozenRowCount: 1, // Congelar fila de headers
              },
            },
          },
        ],
      },
    });

    return response.data;
  }

  // Exportar contactos a Google Sheets
  async exportContactsToSheet(
    spreadsheetId: string,
    sheetName: string = 'Contactos'
  ): Promise<void> {
    // Obtener todos los contactos
    const contacts = await prisma.contact.findMany({
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Preparar datos para la hoja
    const headers = [
      'ID',
      'Nombre',
      'Email',
      'Teléfono',
      'Estado',
      'Fuente',
      'Score',
      'Asignado a',
      'Fecha de creación',
      'Última actualización',
    ];

    const rows = contacts.map((contact: any) => [
      contact.id,
      contact.name,
      contact.email || '',
      contact.phone || '',
      contact.status,
      contact.source,
      contact.score.toString(),
      contact.assignedTo?.name || 'Sin asignar',
      contact.createdAt.toISOString(),
      contact.updatedAt.toISOString(),
    ]);

    const values = [headers, ...rows];

    // Limpiar hoja existente
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    // Escribir datos
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    // Formatear headers (negrita)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9,
                  },
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)',
            },
          },
        ],
      },
    });
  }

  // Importar contactos desde Google Sheets
  async importContactsFromSheet(
    spreadsheetId: string,
    sheetName: string = 'Contactos',
    userId: string
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:J`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      throw new Error('La hoja está vacía');
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const result = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Mapeo de columnas (flexible)
    const getColumnIndex = (possibleNames: string[]) => {
      return headers.findIndex(h =>
        possibleNames.some(name => h.toLowerCase().includes(name.toLowerCase()))
      );
    };

    const nameIdx = getColumnIndex(['nombre', 'name']);
    const emailIdx = getColumnIndex(['email', 'correo']);
    const phoneIdx = getColumnIndex(['teléfono', 'telefono', 'phone', 'whatsapp']);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 porque: 0-indexed + header row

      try {
        const name = row[nameIdx]?.trim();
        const email = row[emailIdx]?.trim() || null;
        const phone = row[phoneIdx]?.trim() || null;

        if (!name) {
          result.errors.push(`Fila ${rowNumber}: Nombre requerido`);
          continue;
        }

        if (!email && !phone) {
          result.errors.push(`Fila ${rowNumber}: Email o teléfono requerido`);
          continue;
        }

        // Buscar si el contacto existe
        const existing = await prisma.contact.findFirst({
          where: {
            OR: [
              email ? { email } : {},
              phone ? { phone } : {},
            ].filter(obj => Object.keys(obj).length > 0),
          },
        });

        if (existing) {
          // Actualizar
          await prisma.contact.update({
            where: { id: existing.id },
            data: {
              name,
              email: email || existing.email,
              phone: phone || existing.phone,
            },
          });
          result.updated++;
        } else {
          // Crear
          await prisma.contact.create({
            data: {
              name,
              email,
              phone,
              source: 'MANUAL',
              status: 'NEW',
              score: 0,
              assignedToId: userId,
            },
          });
          result.created++;
        }
      } catch (error) {
        result.errors.push(`Fila ${rowNumber}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  // Obtener información de una spreadsheet
  async getSpreadsheetInfo(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return response.data;
  }

  // Sincronización automática (webhook simulation)
  async syncContacts(
    spreadsheetId: string,
    sheetName: string,
    userId: string
  ): Promise<void> {
    // Esta función puede ser llamada periódicamente o mediante un webhook
    await this.importContactsFromSheet(spreadsheetId, sheetName, userId);
  }
}

export const googleSheetsService = new GoogleSheetsService();
