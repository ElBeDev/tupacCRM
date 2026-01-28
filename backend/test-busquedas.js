const net = require('net');

async function buscar(termino) {
  return new Promise((resolve) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<nombre>${termino}</nombre>
<program>Interfaz_CRM_ERP_Articulo</program>
</document>`;

    const client = new net.Socket();
    client.setTimeout(30000);
    let response = '';

    client.connect(1030, 'mytupac.mooo.com', () => {
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

    client.on('error', () => {
      resolve('ERROR');
    });
  });
}

async function test() {
  console.log('=== Búsqueda 1: "coca cola" ===');
  const r1 = await buscar('coca cola');
  const productos1 = r1.match(/<nombre><!\[CDATA\[(.*?)\]\]><\/nombre>/g);
  console.log('Productos encontrados:', productos1 ? productos1.length : 0);
  if (productos1) {
    productos1.slice(0, 5).forEach((p, i) => {
      const nombre = p.match(/CDATA\[(.*?)\]/)[1];
      console.log(`  ${i+1}. ${nombre}`);
    });
  }
  
  console.log('\n=== Búsqueda 2: "coca" ===');
  const r2 = await buscar('coca');
  const productos2 = r2.match(/<nombre><!\[CDATA\[(.*?)\]\]><\/nombre>/g);
  console.log('Productos encontrados:', productos2 ? productos2.length : 0);
  if (productos2) {
    productos2.slice(0, 5).forEach((p, i) => {
      const nombre = p.match(/CDATA\[(.*?)\]/)[1];
      console.log(`  ${i+1}. ${nombre}`);
    });
  }
  
  console.log('\n=== Búsqueda 3: "bebida lata" ===');
  const r3 = await buscar('bebida lata');
  const errorMatch = r3.match(/<ERROR>(\d+)<\/ERROR>/);
  if (errorMatch && errorMatch[1] !== '0') {
    console.log('ERROR en búsqueda:', r3.match(/<STRERROR>(.*?)<\/STRERROR>/)?.[1]);
  }
  const productos3 = r3.match(/<nombre><!\[CDATA\[(.*?)\]\]><\/nombre>/g);
  console.log('Productos encontrados:', productos3 ? productos3.length : 0);
  
  console.log('\n=== Búsqueda 4: "lata" ===');
  const r4 = await buscar('lata');
  const productos4 = r4.match(/<nombre><!\[CDATA\[(.*?)\]\]><\/nombre>/g);
  console.log('Productos encontrados:', productos4 ? productos4.length : 0);
  if (productos4) {
    productos4.slice(0, 5).forEach((p, i) => {
      const nombre = p.match(/CDATA\[(.*?)\]/)[1];
      console.log(`  ${i+1}. ${nombre}`);
    });
  }
  
  process.exit(0);
}

test();
