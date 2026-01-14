import { Router, Request, Response } from 'express';
import ERPService from '../services/erp.service';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/erp/client/:identifier
 * Obtiene un cliente del ERP por CUIT, DNI o número de cliente
 * 
 * @query type - Tipo de identificador: 'cuit', 'dni', o 'numero' (por defecto: 'cuit')
 */
router.get('/client/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const { type = 'cuit' } = req.query;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Identificador requerido',
      });
    }

    let clientData;

    switch (type) {
      case 'dni':
        clientData = await ERPService.getClientByDNI(identifier);
        break;
      case 'numero':
        clientData = await ERPService.getClientByNumber(identifier);
        break;
      case 'cuit':
      default:
        clientData = await ERPService.getClientByCUIT(identifier);
        break;
    }

    res.json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    console.error('Error al obtener cliente del ERP:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener cliente del ERP',
    });
  }
});

/**
 * POST /api/erp/client/search
 * Busca un cliente del ERP con cualquier tipo de identificador
 * 
 * @body cuit - CUIT del cliente (opcional)
 * @body dni - DNI del cliente (opcional)
 * @body nro_cliente - Número interno del cliente (opcional)
 */
router.post('/client/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { cuit, dni, nro_cliente } = req.body;

    if (!cuit && !dni && !nro_cliente) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un identificador (cuit, dni o nro_cliente)',
      });
    }

    const clientData = await ERPService.getClient({
      cuit,
      dni,
      nro_cliente,
    });

    res.json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    console.error('Error al buscar cliente en el ERP:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar cliente en el ERP',
    });
  }
});

/**
 * POST /api/erp/client/sync
 * Sincroniza un cliente del ERP con la base de datos local
 * 
 * @body cuit - CUIT del cliente (opcional)
 * @body dni - DNI del cliente (opcional)
 * @body nro_cliente - Número interno del cliente (opcional)
 */
router.post('/client/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const { cuit, dni, nro_cliente } = req.body;

    if (!cuit && !dni && !nro_cliente) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un identificador (cuit, dni o nro_cliente)',
      });
    }

    const result = await ERPService.syncClient({
      cuit,
      dni,
      nro_cliente,
    });

    res.json(result);
  } catch (error) {
    console.error('Error al sincronizar cliente:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al sincronizar cliente',
    });
  }
});

/**
 * GET /api/erp/health
 * Verifica el estado de conexión con el servidor ERP
 */
router.get('/health', authenticate, async (req: Request, res: Response) => {
  try {
    // Intentar una consulta simple para verificar conectividad
    // Puedes usar un número de cliente conocido o hacer una consulta de prueba
    const testClient = await ERPService.getClientByCUIT('00000000000');
    
    res.json({
      success: true,
      message: 'Conexión con ERP establecida',
      available: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Error de conexión con ERP',
      available: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

/**
 * GET /api/erp/article/:identifier
 * Obtiene un artículo del ERP por ID o SKU
 * 
 * @query type - Tipo de identificador: 'id' o 'sku' (por defecto: 'id')
 */
router.get('/article/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const { type = 'id' } = req.query;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Identificador requerido',
      });
    }

    let articleData;

    switch (type) {
      case 'sku':
        articleData = await ERPService.getArticleBySKU(identifier);
        break;
      case 'id':
      default:
        articleData = await ERPService.getArticleById(identifier);
        break;
    }

    res.json({
      success: true,
      data: articleData,
    });
  } catch (error) {
    console.error('Error al obtener artículo del ERP:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener artículo del ERP',
    });
  }
});

/**
 * POST /api/erp/article/search
 * Busca un artículo del ERP con cualquier tipo de identificador
 * 
 * @body id - ID del artículo (opcional)
 * @body sku - SKU del artículo (opcional)
 */
router.post('/article/search', authenticate, async (req: Request, res: Response) => {
  try {
    const { id, sku } = req.body;

    if (!id && !sku) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un identificador (id o sku)',
      });
    }

    const articleData = await ERPService.getArticle({
      id,
      sku,
    });

    res.json({
      success: true,
      data: articleData,
    });
  } catch (error) {
    console.error('Error al buscar artículo en el ERP:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al buscar artículo en el ERP',
    });
  }
});

export default router;
