import erpService from './src/services/erp.service';

async function testFormatting() {
  
  console.log('🔍 Probando formateo de productos...\n');
  
  try {
    const productos = await erpService.searchProductsByName('queso crema');
    console.log(`✅ Encontrados ${productos.length} productos\n`);
    
    if (productos.length > 0) {
      // Mostrar primeros 3 productos formateados
      productos.slice(0, 3).forEach((p, i) => {
        console.log(`═══════════════════════════════════════════════════════════`);
        console.log(`PRODUCTO ${i + 1}:`);
        console.log(`═══════════════════════════════════════════════════════════\n`);
        console.log(erpService.formatProductInfo(p));
        console.log('\n');
      });
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testFormatting();
