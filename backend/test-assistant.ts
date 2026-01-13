/**
 * Script para probar asistentes desde la consola
 * Uso: npx ts-node test-assistant.ts "Consultor de Precios" "¿Cuánto cuesta la coca cola?"
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import assistantService from './src/services/assistant.service';

dotenv.config();

const prisma = new PrismaClient();

async function testAssistant(assistantName: string, message: string) {
  try {
    console.log('\n🤖 Testing Assistant System\n');
    console.log('━'.repeat(60));
    
    // Buscar el asistente por nombre
    console.log(`📝 Buscando asistente: "${assistantName}"...`);
    const assistant = await prisma.assistant.findFirst({
      where: { 
        name: {
          contains: assistantName,
          mode: 'insensitive'
        }
      },
    });

    if (!assistant) {
      console.error(`❌ Asistente "${assistantName}" no encontrado`);
      console.log('\n💡 Asistentes disponibles:');
      
      const allAssistants = await prisma.assistant.findMany({
        select: { name: true, description: true }
      });
      
      allAssistants.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.name}`);
        if (a.description) {
          console.log(`      ${a.description}`);
        }
      });
      
      process.exit(1);
    }

    console.log(`✅ Asistente encontrado: ${assistant.name}`);
    console.log(`   ID: ${assistant.id}`);
    console.log(`   Modelo: ${assistant.model}`);
    console.log(`   Temperatura: ${assistant.temperature}`);
    
    console.log('\n━'.repeat(60));
    console.log(`\n💬 Pregunta: "${message}"\n`);
    console.log('⏳ Consultando...\n');

    // Si es un asistente especialista, simular consulta directa
    if (assistant.name.includes('Consultor') || assistant.name.includes('Gestor')) {
      console.log('🔗 Modo: Consulta directa al especialista');
      
      // Detectar intención basada en el nombre del asistente
      let intent: string | undefined;
      if (assistant.name.includes('Precios')) {
        intent = 'consulta_precio';
      } else if (assistant.name.includes('Stock')) {
        intent = 'consulta_stock';
      } else if (assistant.name.includes('Pedidos')) {
        intent = 'pedido';
      } else if (assistant.name.includes('Reclamos')) {
        intent = 'reclamo';
      }
      
      // Usar consultSpecialist para simular el flujo real
      const response = await assistantService.consultSpecialist(
        intent || 'consulta_precio',
        message,
        { contactId: 'test', conversationId: 'test' }
      );
      
      console.log('━'.repeat(60));
      console.log('\n✅ Respuesta del especialista:\n');
      console.log(response || 'No se recibió respuesta');
      console.log('\n' + '━'.repeat(60));
      
    } else {
      // Si es el asistente principal, usar generateResponse
      console.log('🔗 Modo: Asistente principal (puede consultar especialistas)');
      
      const response = await assistantService.generateResponse(
        assistant.id,
        message,
        undefined, // intent se detectará automáticamente
        { contactId: 'test', conversationId: 'test' }
      );
      
      console.log('━'.repeat(60));
      console.log('\n✅ Respuesta del asistente:\n');
      console.log(response || 'No se recibió respuesta');
      console.log('\n' + '━'.repeat(60));
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n🤖 Test de Asistentes - TupacCRM\n');
  console.log('Uso:');
  console.log('  npx ts-node test-assistant.ts "<nombre-asistente>" "<pregunta>"\n');
  console.log('Ejemplos:');
  console.log('  npx ts-node test-assistant.ts "Consultor de Precios" "¿Cuánto cuesta la coca cola?"');
  console.log('  npx ts-node test-assistant.ts "Consultor de Stock" "Hay stock de pepsi?"');
  console.log('  npx ts-node test-assistant.ts "Gestor de Pedidos" "Quiero 10 cajas de coca cola"');
  console.log('  npx ts-node test-assistant.ts "Atención" "Hola, necesito ayuda"\n');
  
  console.log('💡 Tip: Puedes usar parte del nombre del asistente\n');
  process.exit(0);
}

const [assistantName, message] = args;

testAssistant(assistantName, message);
