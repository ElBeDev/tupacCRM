const net = require('net');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
<FECHA_TRASMITE></FECHA_TRASMITE>
<HORA_TRASMITE></HORA_TRASMITE>
<hs>DEMIURGO10-MCANET</hs>
<service>PROGRAM</service>
<program>Interfaz_CRM_ERP_Articulo</program>
<nombre>cremoso</nombre>
</document>`;

console.log('🔌 Buscando: punta de agua');

const client = new net.Socket();
client.setTimeout(10000);

let response = '';

client.connect(1030, 'mytupac.mooo.com', () => {
  console.log('✅ Conectado');
  client.write(xml + '\n');
});

client.on('data', (data) => {
  response += data.toString();
  const openTags = (response.match(/<document>/g) || []).length;
  const closeTags = (response.match(/<\/document>/g) || []).length;
  if (openTags > 0 && openTags === closeTags) {
    console.log('\nProductos encontrados:');
    const regex = /<nombre><!\[CDATA\[(.*?)\]\]><\/nombre>/g;
    let match;
    while ((match = regex.exec(response)) !== null) {
      console.log('  -', match[1].trim());
    }
    client.destroy();
    process.exit(0);
  }
});

client.on('timeout', () => {
  console.log('❌ Timeout');
  console.log('Respuesta parcial:', response.substring(0, 500));
  client.destroy();
  process.exit(1);
});

client.on('error', (err) => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});
