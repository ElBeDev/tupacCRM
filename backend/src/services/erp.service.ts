import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as net from 'net';

interface ClientData {
  nro_cliente?: string;
  nrodoc?: string;
  cuit?: string;
  dni?: string;
}

interface ArticleData {
  id?: string;
  sku?: string;
}

interface ERPArticleResponse {
  id: string;
  ERROR: string;
  STRERROR: string;
  PUTRECORD: string;
  REGISTROS: string;
  INFO1: string;
  INFO2: string;
  depto: string;
  desactiva_oferta: string;
  familia: string;
  fraccion: string;
  grupo: string;
  iva_tas1: string;
  madre: string;
  marca: string;
  medida_unidad: string;
  nombre: string;
  peso_std: string;
  porcentaje_fraccion: string;
  precio_direccion: string;
  precio_mayorista: string;
  precio_negesp: string;
  precio_normal: string;
  precio_oferta: string;
  precio_vtasesp: string;
  proveedor: string;
  seccion: string;
  sintacc: string;
  sku: string;
  stock: string;
  unidad_bulto: string;
  vigencia_oferta: string;
  // Campos opcionales de promoción
  AccionPromoItem?: string;
  promo_lleva?: string;
  promo_paga?: string;
  promo_des?: string;
  precio_promo?: string;
  precio_ctogestion?: string;
}

interface ERPClientResponse {
  nro_cliente: string;
  ERROR: string;
  STRERROR: string;
  PUTRECORD: string;
  REGISTROS: string;
  INFO1: string;
  INFO2: string;
  nrodoc: string;
  codigo_de_IIBB: string;
  codpos: string;
  desc_provincia: string;
  desc_situacion_iva: string;
  desc_tipo_de_IIBB: string;
  desc_tipo_de_docu: string;
  direccion: string;
  localidad: string;
  nombre: string;
  provincia: string;
  situacion_iva: string;
  tipo_de_IIBB: string;
  tipo_de_documento: string;
}

class ERPService {
  private host: string;
  private port: number;
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;

  constructor() {
    this.host = process.env.ERP_HOST || 'mytupac.mooo.com';
    this.port = parseInt(process.env.ERP_PORT || '1030', 10);
    
    // Configuración del parser XML
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      cdataPropName: '__cdata',
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
    });

    // Configuración del builder XML
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      cdataPropName: '__cdata',
      format: true,
      suppressEmptyNode: true,
    });
  }

  /**
   * Envía una solicitud XML al servidor ERP y recibe la respuesta
   */
  private async sendXMLRequest(xmlData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = '';
      let receivedData = false;

      // Establecer timeout de conexión (aumentado a 60 segundos)
      client.setTimeout(60000);

      client.connect(this.port, this.host, () => {
        console.log(`✓ Conectado a ERP: ${this.host}:${this.port}`);
        
        // Probar diferentes formatos de envío
        const xmlWithHeader = xmlData;
        console.log(`→ Enviando ${xmlWithHeader.length} bytes al servidor...`);
        
        // Enviar con salto de línea al final
        client.write(xmlWithHeader + '\n', 'utf8', (err) => {
          if (err) {
            console.error('✗ Error al escribir:', err);
          } else {
            console.log('✓ Datos enviados correctamente');
          }
        });
      });

      client.on('data', (data) => {
        receivedData = true;
        const chunk = data.toString();
        console.log(`← Recibiendo datos (${chunk.length} bytes)...`);
        responseData += chunk;
        
        // Resetear timeout cada vez que llegan datos
        client.setTimeout(60000);
        
        // Contar etiquetas de apertura y cierre para detectar XML completo
        const openTags = (responseData.match(/<document>/g) || []).length;
        const closeTags = (responseData.match(/<\/document>/g) || []).length;
        
        // Si todas las etiquetas están cerradas, tenemos el XML completo
        if (openTags > 0 && openTags === closeTags) {
          console.log(`✓ XML completo recibido (${openTags} etiquetas cerradas), cerrando conexión`);
          client.destroy(); // Cerrar inmediatamente sin esperar
          resolve(responseData); // Resolver inmediatamente con los datos
        }
      });

      client.on('end', () => {
        console.log('✓ Conexión cerrada por el servidor');
        if (responseData) {
          resolve(responseData);
        } else {
          reject(new Error('El servidor cerró la conexión sin enviar datos'));
        }
      });

      client.on('timeout', () => {
        console.log('✗ Timeout alcanzado');
        client.destroy();
        if (receivedData && responseData) {
          console.log('⚠ Devolviendo datos parciales recibidos');
          resolve(responseData);
        } else {
          reject(new Error('Timeout: El servidor no respondió en 60 segundos'));
        }
      });

      client.on('error', (err) => {
        console.error('✗ Error de socket:', err.message);
        reject(new Error(`Error de conexión con ERP: ${err.message}`));
      });

      client.on('close', (hadError) => {
        if (hadError) {
          console.log('✗ Conexión cerrada con error');
        } else {
          console.log('✓ Conexión cerrada limpiamente');
        }
      });
    });
  }

  /**
   * Construye el XML de solicitud para obtener datos de un cliente
   */
  private buildClientRequestXML(clientData: ClientData): string {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0].replace(/-/g, '');
    const hora = now.toTimeString().split(' ')[0].replace(/:/g, '');

    const xmlObject = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      document: {
        FECHA_TRASMITE: fecha,
        HORA_TRASMITE: hora,
        hs: process.env.ERP_HS || 'DEMIURGO10-MCANET',
        service: 'PROGRAM',
        dni: clientData.dni || '',
        cuit: clientData.cuit || '',
        nro_interno: clientData.nro_cliente || '',
        program: 'Interfaz_CRM_ERP_Cliente',
      },
    };

    return this.xmlBuilder.build(xmlObject);
  }

  /**
   * Parsea la respuesta del ERP que contiene dos XMLs concatenados
   */
  private parseERPResponse(responseXML: string): any {
    // El servidor devuelve 2 XMLs: primero el stub, luego los datos reales
    // Buscar el segundo <?xml que indica el inicio de los datos reales
    const secondXmlStart = responseXML.indexOf('<?xml', 5);
    
    if (secondXmlStart > 0) {
      // Extraer solo el segundo XML (los datos reales)
      const realDataXML = responseXML.substring(secondXmlStart);
      const parsed = this.xmlParser.parse(realDataXML);
      return parsed.document;
    } else {
      // Si solo hay un XML, parsearlo directamente
      const parsed = this.xmlParser.parse(responseXML);
      return parsed.document;
    }
  }

  /**
   * Obtiene los datos de un cliente desde el ERP
   * @param clientData - Datos del cliente (cuit, dni o nro_interno)
   */
  async getClient(clientData: ClientData): Promise<ERPClientResponse> {
    try {
      // Validar que se proporcione al menos un identificador
      if (!clientData.cuit && !clientData.dni && !clientData.nro_cliente) {
        throw new Error('Debe proporcionar CUIT, DNI o número de cliente');
      }

      // Construir el XML de solicitud
      const requestXML = this.buildClientRequestXML(clientData);
      console.log('Solicitud XML:', requestXML);

      // Enviar la solicitud al ERP
      const responseXML = await this.sendXMLRequest(requestXML);
      console.log('Respuesta XML:', responseXML);

      // Parsear la respuesta (maneja 2 XMLs concatenados)
      const clientResponse = this.parseERPResponse(responseXML) as ERPClientResponse;

      // Verificar si hubo error
      if (clientResponse.ERROR && clientResponse.ERROR !== '0') {
        throw new Error(`Error del ERP: ${clientResponse.STRERROR || 'Error desconocido'}`);
      }

      return clientResponse;
    } catch (error) {
      console.error('Error al obtener cliente del ERP:', error);
      throw error;
    }
  }

  /**
   * Busca un cliente por CUIT
   */
  async getClientByCUIT(cuit: string): Promise<ERPClientResponse> {
    return this.getClient({ cuit });
  }

  /**
   * Busca un cliente por DNI
   */
  async getClientByDNI(dni: string): Promise<ERPClientResponse> {
    return this.getClient({ dni });
  }

  /**
   * Busca un cliente por número interno
   */
  async getClientByNumber(nro_cliente: string): Promise<ERPClientResponse> {
    return this.getClient({ nro_cliente });
  }

  /**
   * Sincroniza un cliente del ERP con la base de datos local
   * (Para implementar según tu modelo de datos)
   */
  async syncClient(clientData: ClientData): Promise<any> {
    try {
      const erpClient = await this.getClient(clientData);
      
      // Aquí puedes agregar la lógica para sincronizar con tu base de datos
      // Por ejemplo, usando Prisma para guardar o actualizar el cliente
      
      return {
        success: true,
        client: erpClient,
        message: 'Cliente sincronizado correctamente',
      };
    } catch (error) {
      console.error('Error al sincronizar cliente:', error);
      throw error;
    }
  }

  /**
   * Construye el XML de solicitud para obtener datos de un artículo
   */
  private buildArticleRequestXML(articleData: ArticleData): string {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0].replace(/-/g, '');
    const hora = now.toTimeString().split(' ')[0].replace(/:/g, '');

    const xmlObject = {
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      document: {
        FECHA_TRASMITE: fecha,
        HORA_TRASMITE: hora,
        hs: process.env.ERP_HS || 'DEMIURGO10-MCANET',
        service: 'PROGRAM',
        id: articleData.id || '',
        sku: articleData.sku || '',
        program: 'Interfaz_CRM_ERP_Articulo',
      },
    };

    return this.xmlBuilder.build(xmlObject);
  }

  /**
   * Obtiene los datos de un artículo desde el ERP
   */
  async getArticle(articleData: ArticleData): Promise<ERPArticleResponse> {
    try {
      if (!articleData.id && !articleData.sku) {
        throw new Error('Debe proporcionar ID o SKU del artículo');
      }

      const requestXML = this.buildArticleRequestXML(articleData);
      console.log('Solicitud XML Artículo:', requestXML);

      const responseXML = await this.sendXMLRequest(requestXML);
      console.log('Respuesta XML:', responseXML);

      // Parsear la respuesta (maneja 2 XMLs concatenados)
      const articleResponse = this.parseERPResponse(responseXML) as ERPArticleResponse;

      if (articleResponse.ERROR && articleResponse.ERROR !== '0') {
        throw new Error(`Error del ERP: ${articleResponse.STRERROR || 'Error desconocido'}`);
      }

      return articleResponse;
    } catch (error) {
      console.error('Error al obtener artículo del ERP:', error);
      throw error;
    }
  }

  /**
   * Busca un artículo por ID
   */
  async getArticleById(id: string): Promise<ERPArticleResponse> {
    return this.getArticle({ id });
  }

  /**
   * Busca un artículo por SKU
   */
  async getArticleBySKU(sku: string): Promise<ERPArticleResponse> {
    return this.getArticle({ sku });
  }

  /**
   * Busca productos por nombre (búsqueda de texto)
   * IMPORTANTE: NO incluir <id> ni <sku> cuando se busca por nombre
   */
  async searchProductsByName(nombre: string): Promise<ERPArticleResponse[]> {
    try {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0].replace(/-/g, '');
      const hora = now.toTimeString().split(' ')[0].replace(/:/g, '');

      // Construir XML con SOLO el tag <nombre>, sin <id> ni <sku>
      const xmlObject = {
        '?xml': {
          '@_version': '1.0',
          '@_encoding': 'UTF-8',
        },
        document: {
          FECHA_TRASMITE: fecha,
          HORA_TRASMITE: hora,
          hs: process.env.ERP_HS || 'DEMIURGO10-MCANET',
          service: 'PROGRAM',
          nombre: nombre,
          program: 'Interfaz_CRM_ERP_Articulo',
        },
      };

      const requestXML = this.xmlBuilder.build(xmlObject);
      console.log('🔍 Buscando productos con nombre:', nombre);

      const responseXML = await this.sendXMLRequest(requestXML);
      
      // Parsear la respuesta (maneja 2 XMLs concatenados)
      const parsedData = this.parseERPResponse(responseXML);

      // Verificar error
      if (parsedData.ERROR && parsedData.ERROR !== '0' && parsedData.ERROR !== 0) {
        console.warn(`⚠️ ERP retornó error: ${parsedData.STRERROR}`);
        return [];
      }

      // Si la respuesta es un array, retornarlo
      if (Array.isArray(parsedData)) {
        return parsedData;
      }

      // Si el ERP devuelve los datos con arrays en cada campo (múltiples productos),
      // necesitamos transformarlos en un array de objetos individuales
      if (parsedData.id && Array.isArray(parsedData.id)) {
        const products: ERPArticleResponse[] = [];
        const numProducts = parsedData.id.length;
        
        for (let i = 0; i < numProducts; i++) {
          const product: any = {};
          
          // Copiar cada campo del índice correspondiente
          for (const key of Object.keys(parsedData)) {
            if (Array.isArray(parsedData[key])) {
              product[key] = parsedData[key][i];
            } else {
              product[key] = parsedData[key];
            }
          }
          
          products.push(product as ERPArticleResponse);
        }
        
        console.log(`✅ Encontrados ${products.length} productos en el ERP`);
        return products;
      }

      // Si es un solo producto (sin arrays), retornarlo como array
      if (parsedData.id || parsedData.nombre) {
        console.log(`✅ Encontrados 1 productos en el ERP`);
        return [parsedData as ERPArticleResponse];
      }

      return [];
    } catch (error) {
      console.error('Error al buscar productos por nombre:', error);
      return [];
    }
  }

  /**
   * Formatea la información de un producto para ser presentada al usuario
   */
  formatProductInfo(product: ERPArticleResponse): string {
    const lines: string[] = [];
    
    // Helper para obtener string de cualquier valor (maneja CDATA y otros formatos)
    const getString = (value: any): string => {
      if (!value) return '';
      if (typeof value === 'string') return value.trim();
      // Manejar CDATA del parser XML
      if (typeof value === 'object') {
        if (value['__cdata']) return String(value['__cdata']).trim();
        if (value['#text']) return String(value['#text']).trim();
        if (value['#cdata']) return String(value['#cdata']).trim();
        // Si es un objeto sin propiedades conocidas, intentar stringify
        return '';
      }
      return String(value).trim();
    };
    
    // Nombre del producto
    const nombre = getString(product.nombre);
    if (nombre) {
      lines.push(`📦 **${nombre}**`);
    } else {
      lines.push(`📦 **Producto ID: ${product.id}**`);
    }
    
    // ID y SKU
    if (product.id) lines.push(`   ID: ${product.id}`);
    const sku = getString(product.sku);
    if (sku) lines.push(`   SKU: ${sku}`);
    
    // Categorización
    const depto = getString(product.depto);
    if (depto) lines.push(`   Departamento: ${depto}`);
    const familia = getString(product.familia);
    if (familia) lines.push(`   Familia: ${familia}`);
    
    // Marca: si está vacía, intentar extraerla del nombre del producto
    let marca = getString(product.marca);
    if (!marca && nombre) {
      // Buscar la primera palabra que parezca ser una marca (palabras capitalizadas que no sean genéricas)
      const palabrasGenericas = ['QUESO', 'CREMA', 'LECHE', 'YOGUR', 'MANTECA', 'BEBIDA', 'GASEOSA', 'AGUA', 'JUGO', 'LA', 'EL', 'LAS', 'LOS'];
      const palabras = nombre.split(' ');
      
      for (const palabra of palabras) {
        const palabraLimpia = palabra.trim().toUpperCase();
        if (palabraLimpia.length > 2 && !palabrasGenericas.includes(palabraLimpia) && /^[A-Z]/.test(palabra)) {
          marca = palabra;
          break;
        }
      }
      
      // Si no encontramos marca, usar primera palabra
      if (!marca) {
        marca = palabras[0];
      }
    }
    if (marca) lines.push(`   Marca: ${marca}`);
    
    // Precios (convertir formato: "2795,8680" -> "$2,795.87")
    lines.push(`\n💰 **Precios:**`);
    const precioNormal = this.formatPrice(product.precio_normal);
    lines.push(`   Precio Normal: **${precioNormal}**`);
    
    if (product.precio_mayorista && product.precio_mayorista !== '-000,0001') {
      lines.push(`   Precio Mayorista: ${this.formatPrice(product.precio_mayorista)}`);
    }
    if (product.precio_vtasesp && product.precio_vtasesp !== '-000,0001') {
      lines.push(`   Precio Venta Especial: ${this.formatPrice(product.precio_vtasesp)}`);
    }
    
    // Promoción activa
    if (product.AccionPromoItem && product.promo_lleva && product.promo_paga) {
      lines.push(`\n🎁 **PROMOCIÓN ACTIVA:**`);
      lines.push(`   Lleva ${product.promo_lleva} y paga ${product.promo_paga}`);
      if (product.precio_promo) {
        lines.push(`   Precio promocional: ${this.formatPrice(product.precio_promo)}`);
      }
    }
    
    // Stock
    lines.push(`\n📊 **Disponibilidad:**`);
    const stock = parseInt(product.stock);
    if (stock > 0) {
      lines.push(`   ✅ Stock: ${stock} unidades disponibles`);
    } else if (stock === 0) {
      lines.push(`   ⚠️ Sin stock disponible`);
    } else {
      lines.push(`   ⚠️ Stock negativo (${stock}) - consultar disponibilidad`);
    }
    
    if (product.unidad_bulto) {
      lines.push(`   Unidades por bulto: ${product.unidad_bulto}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Convierte precio de formato ERP "2795,8680" a formato usuario "$2,795.87"
   */
  private formatPrice(priceString: string): string {
    if (!priceString || priceString === '-000,0001') return 'N/A';
    
    try {
      // Reemplazar coma por punto para parsear
      const numericValue = parseFloat(priceString.replace(',', '.'));
      
      // Formatear con signo de peso y separadores
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(numericValue);
    } catch {
      return priceString;
    }
  }
}

export default new ERPService();
