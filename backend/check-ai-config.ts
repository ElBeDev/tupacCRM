import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const configs = await prisma.aIConfig.findMany();
    
    console.log(`\n📊 Total configuraciones: ${configs.length}\n`);
    
    if (configs.length === 0) {
      console.log('📝 No hay configuraciones. Creando una por defecto...');
      const config = await prisma.aIConfig.create({
        data: {
          name: 'Configuración Principal',
          systemPrompt: 'Eres un asistente de ventas profesional y amigable. Tu objetivo es ayudar a calificar leads, responder preguntas de manera clara y profesional, identificar oportunidades de venta, y ser empático con los clientes.',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 500,
          isActive: true,
          autoReply: true,
        }
      });
      console.log('✅ Configuración creada:', {
        id: config.id,
        name: config.name,
        model: config.model,
        isActive: config.isActive,
        autoReply: config.autoReply
      });
    } else {
      configs.forEach((config, index) => {
        console.log(`Configuración #${index + 1}:`);
        console.log(`  ID: ${config.id}`);
        console.log(`  Name: ${config.name}`);
        console.log(`  Model: ${config.model}`);
        console.log(`  Active: ${config.isActive ? '✅' : '❌'}`);
        console.log(`  Auto-reply: ${config.autoReply ? '✅' : '❌'}`);
        console.log(`  Temperature: ${config.temperature}`);
        console.log(`  Max Tokens: ${config.maxTokens}`);
        console.log('');
      });
      
      // Asegurar que al menos una esté activa
      const activeConfig = configs.find(c => c.isActive);
      if (!activeConfig) {
        console.log('⚠️  No hay configuración activa. Activando la primera...');
        await prisma.aIConfig.update({
          where: { id: configs[0].id },
          data: { isActive: true }
        });
        console.log('✅ Configuración activada');
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
