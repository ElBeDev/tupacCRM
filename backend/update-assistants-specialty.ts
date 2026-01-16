/**
 * Script para actualizar los asistentes existentes con specialty y delegatesTo
 * Ejecutar: npx ts-node update-assistants-specialty.ts
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Actualizando asistentes con specialty y delegatesTo...\n');

  try {
    // Obtener todos los asistentes
    const assistants = await prisma.assistant.findMany();

    if (assistants.length === 0) {
      console.log('⚠️  No hay asistentes en el sistema. Ejecuta seed-assistants.ts primero.');
      return;
    }

    console.log(`📋 Encontrados ${assistants.length} asistentes:\n`);

    const updates: Record<string, { specialty: string; delegatesTo: string[] }> = {};

    // Mapear especialidades según el nombre
    for (const assistant of assistants) {
      console.log(`   - ${assistant.name} (${assistant.id})`);

      if (assistant.name.includes('Consultor de Precios')) {
        updates[assistant.id] = { specialty: 'precios', delegatesTo: [] };
      } else if (assistant.name.includes('Consultor de Stock')) {
        updates[assistant.id] = { specialty: 'stock', delegatesTo: [] };
      } else if (assistant.name.includes('Gestor de Pedidos')) {
        updates[assistant.id] = { specialty: 'pedidos', delegatesTo: [] };
      } else if (assistant.name.includes('Gestor de Reclamos')) {
        updates[assistant.id] = { specialty: 'reclamos', delegatesTo: [] };
      } else if (assistant.name.includes('Atención al Cliente') || assistant.isWhatsAppResponder) {
        updates[assistant.id] = { specialty: 'general', delegatesTo: [] };
      } else if (assistant.name.includes('ERP')) {
        updates[assistant.id] = { specialty: 'erp', delegatesTo: [] };
      }
    }

    console.log('\n🔧 Aplicando actualizaciones...\n');

    // Actualizar cada asistente
    let updated = 0;
    for (const [id, data] of Object.entries(updates)) {
      const assistant = assistants.find(a => a.id === id);
      await prisma.assistant.update({
        where: { id },
        data: {
          specialty: data.specialty,
          delegatesTo: data.delegatesTo,
        },
      });
      console.log(`   ✅ ${assistant?.name} → specialty: ${data.specialty}`);
      updated++;
    }

    // Configurar delegación del asistente principal
    console.log('\n🔗 Configurando delegación del asistente principal...\n');

    const mainAssistant = assistants.find(a => 
      a.name.includes('Atención al Cliente') || a.isWhatsAppResponder
    );

    if (mainAssistant) {
      const specialistIds = assistants
        .filter(a => 
          a.id !== mainAssistant.id && 
          (a.name.includes('Consultor') || a.name.includes('Gestor'))
        )
        .map(a => a.id);

      if (specialistIds.length > 0) {
        await prisma.assistant.update({
          where: { id: mainAssistant.id },
          data: {
            delegatesTo: specialistIds,
          },
        });

        console.log(`   ✅ ${mainAssistant.name} puede delegar a ${specialistIds.length} especialistas:`);
        for (const id of specialistIds) {
          const specialist = assistants.find(a => a.id === id);
          console.log(`      - ${specialist?.name}`);
        }
      }
    }

    console.log('\n🎉 ¡Actualización completada!\n');
    console.log('📊 Resumen:');
    console.log(`   - Asistentes actualizados: ${updated}`);
    console.log(`   - Delegación configurada: ${mainAssistant ? 'SÍ' : 'NO'}`);
    console.log('\n💡 El sistema multi-agente está listo para usar con especialidades.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
