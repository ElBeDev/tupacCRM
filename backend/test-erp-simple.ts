/**
 * Script de prueba simple para probar diferentes configuraciones de XML con el ERP
 */

import * as net from 'net';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.ERP_HOST || 'mytupac.mooo.com';
const port = parseInt(process.env.ERP_PORT || '1030', 10);

function sendXML(xml: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = '';

    client.setTimeout(10000);

    client.connect(port, host, () => {
      console.log(`\n✓ Conectado a ${host}:${port}`);
      console.log(`→ Enviando XML...`);
      client.write(xml + '\n', 'utf8');
    });

    client.on('data', (data) => {
      const chunk = data.toString();
      responseData += chunk;
      console.log(`← Recibido: ${chunk.length} bytes`);
      
      if (responseData.includes('</document>')) {
        client.end();
      }
    });

    client.on('end', () => {
      resolve(responseData);
    });

    client.on('timeout', () => {
      client.destroy();
      if (responseData) {
        resolve(responseData);
      } else {
        reject(new Error('Timeout'));
      }
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

async function test1_ConFechasVacias() {
  console.log('\n=== Test 1: Con FECHA_TRASMITE y HORA_TRASMITE vacíos (como en el ejemplo) ===');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>30697982473</cuit>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado:');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

async function test2_SinFechas() {
  console.log('\n=== Test 2: Sin campos FECHA_TRASMITE y HORA_TRASMITE ===');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>30697982473</cuit>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado:');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

async function test3_SoloCUIT() {
  console.log('\n=== Test 3: Solo con CUIT (sin nro_interno) ===');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>30697982473</cuit>
<nro_interno></nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado:');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

async function test4_SoloNroInterno() {
  console.log('\n=== Test 4: Solo con nro_interno (sin CUIT) ===');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit></cuit>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado:');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

async function test5_ExactamenteComoEjemplo() {
  console.log('\n=== Test 5: Exactamente como el ejemplo (formato raw sin formateo) ===');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>30697982473</cuit>
<nro_interno>100149</nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado (sin formateo adicional):');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

async function test6_OtroCUIT() {
  console.log('\n=== Test 6: Probando con otro CUIT para ver si hay datos ===');
  
  // Probemos con un CUIT de prueba común
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<dni></dni>
<cuit>20123456789</cuit>
<nro_interno></nro_interno>
<program>Interfaz_CRM_ERP_Cliente</program>
</document>`;

  console.log('XML enviado (CUIT: 20123456789):');
  console.log(xml);
  
  try {
    const response = await sendXML(xml);
    console.log('\n✅ Respuesta recibida:');
    console.log(response);
  } catch (error) {
    console.log('\n❌ Error:', error);
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   TESTS DE CONEXIÓN ERP - Diferentes Configuraciones      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nHost: ${host}`);
  console.log(`Port: ${port}\n`);

  await test1_ConFechasVacias();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 seg entre tests

  await test2_SinFechas();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await test3_SoloCUIT();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await test4_SoloNroInterno();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await test5_ExactamenteComoEjemplo();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await test6_OtroCUIT();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                  TESTS COMPLETADOS                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

runAllTests().catch(console.error);
