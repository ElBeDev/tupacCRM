const { PrismaClient } = require('@prisma/client');

async function checkAssistants() {
  const prisma = new PrismaClient();
  
  try {
    const assistants = await prisma.assistant.findMany({
      select: {
        id: true,
        name: true,
        specialty: true,
        isWhatsAppResponder: true,
        delegatesTo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 ASISTENTES EN LA BASE DE DATOS:\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (assistants.length === 0) {
      console.log('❌ No hay asistentes en la base de datos\n');
    } else {
      console.log(`✅ Total: ${assistants.length} asistentes\n`);
      
      assistants.forEach((a, i) => {
        console.log(`${i + 1}. ${a.name}`);
        console.log(`   ID: ${a.id}`);
        console.log(`   Specialty: ${a.specialty || '❌ NO DEFINIDA'}`);
        console.log(`   WhatsApp Responder: ${a.isWhatsAppResponder ? '✅ SÍ' : 'No'}`);
        console.log(`   Delega a: ${a.delegatesTo?.length || 0} asistente(s)`);
        console.log('');
      });
    }
    
    // Verificar usuarios
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('👥 USUARIOS EN LA BASE DE DATOS:\n');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos\n');
    } else {
      console.log(`✅ Total: ${users.length} usuarios\n`);
      users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name} (${u.email}) - ${u.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssistants();
