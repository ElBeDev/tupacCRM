import { ERPService } from './src/services/erp.service';

async function testProductSearch() {
  const erpService = new ERPService();
  
  console.log('🔍 Probando búsqueda de productos...\n');
  
  // Caso 1: Queso crema
  console.log('=== Búsqueda: "queso crema" ===');
  try {
    const productos1 = await erpService.searchProductsByName('queso crema');
    console.log(`✅ Encontrados ${productos1.length} productos`);
    
    if (productos1.length > 0) {
      console.log('\n📦 Primer producto:');
      console.log(JSON.stringify({
        id: productos1[0].id,
        nombre: productos1[0].nombre,
        marca: productos1[0].marca,
        stock: productos1[0].stock,
        precio_normal: productos1[0].precio_normal,
      }, null, 2));
      
      console.log('\n📋 Formato presentable:');
      console.log(erpService.formatProductInfo(productos1[0]));
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Caso 2: Cremoso punta de agua
  console.log('=== Búsqueda: "cremoso punta de agua" ===');
  try {
    const productos2 = await erpService.searchProductsByName('cremoso punta de agua');
    console.log(`✅ Encontrados ${productos2.length} productos`);
    
    if (productos2.length > 0) {
      console.log('\n📦 Primer producto:');
      console.log(JSON.stringify({
        id: productos2[0].id,
        nombre: productos2[0].nombre,
        marca: productos2[0].marca,
        stock: productos2[0].stock,
      }, null, 2));
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Caso 3: Cremoso / cremo
  console.log('=== Búsqueda: "cremoso" ===');
  try {
    const productos3 = await erpService.searchProductsByName('cremoso');
    console.log(`✅ Encontrados ${productos3.length} productos`);
    
    if (productos3.length > 0) {
      // Mostrar primeros 3 productos
      productos3.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. Producto ID ${p.id}:`);
        console.log(`   Nombre: ${p.nombre}`);
        console.log(`   Marca: ${p.marca || 'Sin marca'}`);
        console.log(`   Stock: ${p.stock}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Caso 4: Bebida en lata
  console.log('=== Búsqueda: "bebida en lata" ===');
  try {
    const productos4 = await erpService.searchProductsByName('bebida en lata');
    console.log(`✅ Encontrados ${productos4.length} productos`);
    
    if (productos4.length > 0) {
      // Mostrar primeros 3 productos
      productos4.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. Producto ID ${p.id}:`);
        console.log(`   Nombre: ${p.nombre}`);
        console.log(`   Marca: ${p.marca || 'Sin marca'}`);
        console.log(`   Stock: ${p.stock}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testProductSearch().catch(console.error);
