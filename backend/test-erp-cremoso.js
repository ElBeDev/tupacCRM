const net = require('net');

function consultarERP(nombre) {
  return new Promise((resolve, reject) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>${nombre}</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>`;

    const client = new net.Socket();
    client.setTimeout(30000);
    let response = '';

    client.connect(1030, 'mytupac.mooo.com', () => {
      console.log(`✅ Conectado al ERP - Buscando: "${nombre}"\n`);
      client.write(xml + '\n');
    });

    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('end', () => {
      resolve(response);
    });

    client.on('timeout', () => {
      client.destroy();
      resolve(response);
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

async function test() {
  try {
    // Prueba 1: cremoso punta de agua
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PRUEBA 1: "cremoso punta de agua"');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const resp1 = await consultarERP('cremoso punta de agua');
    console.log('📦 RESPUESTA DEL ERP:\n');
    console.log(resp1);
    console.log('\n\n');
    
    // Prueba 2: queso crema
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PRUEBA 2: "queso crema"');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const resp2 = await consultarERP('queso crema');
    console.log('📦 RESPUESTA DEL ERP:\n');
    console.log(resp2);
    console.log('\n\n');
    
    // Prueba 3: bebida en lata
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PRUEBA 3: "bebida en lata"');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const resp3 = await consultarERP('bebida en lata');
    console.log('📦 RESPUESTA DEL ERP:\n');
    console.log(resp3);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

test();
