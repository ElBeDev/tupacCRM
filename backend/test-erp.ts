/**
 * Script de prueba para la integración con el ERP
 * 
 * Uso:
 *   npm run test:erp
 * o
 *   tsx backend/test-erp.ts
 */

import ERPService from './src/services/erp.service';
import dotenv from 'dotenv';

dotenv.config();

// ANSI colors para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testERPConnection() {
  log('\n==============================================', colors.blue);
  log('   TEST DE INTEGRACIÓN ERP - TupacCRM', colors.blue);
  log('==============================================\n', colors.blue);

  logInfo(`Host: ${process.env.ERP_HOST || 'mytupac.mooo.com'}`);
  logInfo(`Port: ${process.env.ERP_PORT || '1030'}`);
  logInfo(`HS: ${process.env.ERP_HS || 'DEMIURGO10-MCANET'}\n`);

  // Test 1: Buscar cliente por CUIT del ejemplo
  log('\n--- Test 1: Buscar cliente por CUIT ---', colors.yellow);
  try {
    const cuit = '30697982473';
    logInfo(`Buscando cliente con CUIT: ${cuit}`);
    
    const client = await ERPService.getClientByCUIT(cuit);
    
    logSuccess('Cliente encontrado!');
    console.log('\nDatos del cliente:');
    console.log(JSON.stringify(client, null, 2));
    
    if (client.ERROR === '0') {
      logSuccess(`✓ Cliente: ${client.nombre?.trim()}`);
      logSuccess(`✓ Dirección: ${client.direccion?.trim()}`);
      logSuccess(`✓ Localidad: ${client.localidad?.trim()}`);
      logSuccess(`✓ CUIT: ${client.nrodoc}`);
    }
  } catch (error) {
    logError(`Error al buscar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  // Test 2: Buscar cliente por número interno
  log('\n--- Test 2: Buscar cliente por Número Interno ---', colors.yellow);
  try {
    const nroCliente = '100149';
    logInfo(`Buscando cliente con número interno: ${nroCliente}`);
    
    const client = await ERPService.getClientByNumber(nroCliente);
    
    logSuccess('Cliente encontrado!');
    
    if (client.ERROR === '0') {
      logSuccess(`✓ Número de cliente: ${client.nro_cliente}`);
      logSuccess(`✓ Nombre: ${client.nombre?.trim()}`);
      logSuccess(`✓ Situación IVA: ${client.desc_situacion_iva?.trim()}`);
    }
  } catch (error) {
    logError(`Error al buscar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  // Test 3: Buscar cliente inexistente (para probar manejo de errores)
  log('\n--- Test 3: Buscar cliente inexistente (test de error) ---', colors.yellow);
  try {
    const cuitInexistente = '00000000000';
    logInfo(`Buscando cliente con CUIT: ${cuitInexistente}`);
    
    const client = await ERPService.getClientByCUIT(cuitInexistente);
    
    if (client.ERROR !== '0') {
      logWarning(`Cliente no encontrado: ${client.STRERROR}`);
    } else {
      logInfo('Respuesta recibida del ERP');
    }
  } catch (error) {
    logWarning(`Error esperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  // Test 4: Sincronización de cliente
  log('\n--- Test 4: Sincronizar cliente ---', colors.yellow);
  try {
    const cuit = '30697982473';
    logInfo(`Sincronizando cliente con CUIT: ${cuit}`);
    
    const result = await ERPService.syncClient({ cuit });
    
    logSuccess('Cliente sincronizado!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    logError(`Error al sincronizar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  log('\n==============================================', colors.blue);
  log('   FIN DE LOS TESTS', colors.blue);
  log('==============================================\n', colors.blue);
}

// Ejecutar los tests
testERPConnection()
  .then(() => {
    logSuccess('\n✨ Tests completados exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    logError(`\n💥 Error fatal: ${error.message}\n`);
    process.exit(1);
  });
