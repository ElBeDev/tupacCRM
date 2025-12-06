import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Limpiar datos existentes (opcional - comentar si no quieres borrar)
  console.log('🗑️  Cleaning existing data...');
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.whatsAppSession.deleteMany();
  await prisma.aIConfig.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear usuarios
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tupaccrm.com',
      password: hashedPassword,
      name: 'Admin Usuario',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@tupaccrm.com',
      password: hashedPassword,
      name: 'Manager Usuario',
      role: 'MANAGER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      email: 'agente1@tupaccrm.com',
      password: hashedPassword,
      name: 'María García',
      role: 'AGENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: 'agente2@tupaccrm.com',
      password: hashedPassword,
      name: 'Carlos López',
      role: 'AGENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    },
  });

  console.log(`✅ Created ${4} users`);

  // 2. Crear contactos con diferentes estados
  console.log('📇 Creating contacts...');
  
  const contactsData = [
    // NEW - Nuevos leads
    {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+52155512345678',
      source: 'WHATSAPP',
      status: 'NEW',
      score: 45,
      tags: ['lead', 'interesado'],
      assignedToId: agent1.id,
    },
    {
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+52155512345679',
      source: 'INSTAGRAM',
      status: 'NEW',
      score: 38,
      tags: ['lead', 'seguimiento'],
      assignedToId: agent1.id,
    },
    {
      name: 'Pedro Sánchez',
      email: 'pedro.sanchez@email.com',
      phone: '+52155512345680',
      source: 'FACEBOOK',
      status: 'NEW',
      score: 52,
      tags: ['lead'],
      assignedToId: agent2.id,
    },
    
    // CONTACTED - Contactados
    {
      name: 'Laura Rodríguez',
      email: 'laura.rodriguez@email.com',
      phone: '+52155512345681',
      source: 'WHATSAPP',
      status: 'CONTACTED',
      score: 65,
      tags: ['caliente', 'urgente'],
      assignedToId: agent1.id,
    },
    {
      name: 'Roberto Gómez',
      email: 'roberto.gomez@email.com',
      phone: '+52155512345682',
      source: 'WEBSITE',
      status: 'CONTACTED',
      score: 58,
      tags: ['interesado', 'empresa'],
      assignedToId: agent2.id,
    },
    {
      name: 'Carmen Silva',
      email: 'carmen.silva@email.com',
      phone: '+52155512345683',
      source: 'MANUAL',
      status: 'CONTACTED',
      score: 61,
      tags: ['referido'],
      assignedToId: agent1.id,
    },
    
    // QUALIFIED - Calificados
    {
      name: 'Miguel Torres',
      email: 'miguel.torres@email.com',
      phone: '+52155512345684',
      source: 'WHATSAPP',
      status: 'QUALIFIED',
      score: 78,
      tags: ['caliente', 'listo-compra'],
      assignedToId: agent1.id,
    },
    {
      name: 'Isabel Morales',
      email: 'isabel.morales@email.com',
      phone: '+52155512345685',
      source: 'INSTAGRAM',
      status: 'QUALIFIED',
      score: 82,
      tags: ['caliente', 'vip'],
      assignedToId: agent2.id,
    },
    {
      name: 'Fernando Díaz',
      email: 'fernando.diaz@email.com',
      phone: '+52155512345686',
      source: 'FACEBOOK',
      status: 'QUALIFIED',
      score: 75,
      tags: ['interesado', 'seguimiento'],
      assignedToId: agent1.id,
    },
    {
      name: 'Patricia Ruiz',
      email: 'patricia.ruiz@email.com',
      phone: '+52155512345687',
      source: 'WHATSAPP',
      status: 'QUALIFIED',
      score: 80,
      tags: ['caliente'],
      assignedToId: agent2.id,
    },
    
    // PROPOSAL - En propuesta
    {
      name: 'Jorge Ramírez',
      email: 'jorge.ramirez@email.com',
      phone: '+52155512345688',
      source: 'WEBSITE',
      status: 'PROPOSAL',
      score: 88,
      tags: ['propuesta-enviada', 'alto-valor'],
      assignedToId: agent1.id,
    },
    {
      name: 'Sofía Castro',
      email: 'sofia.castro@email.com',
      phone: '+52155512345689',
      source: 'WHATSAPP',
      status: 'PROPOSAL',
      score: 85,
      tags: ['propuesta-enviada', 'urgente'],
      assignedToId: agent2.id,
    },
    {
      name: 'Ricardo Vargas',
      email: 'ricardo.vargas@email.com',
      phone: '+52155512345690',
      source: 'MANUAL',
      status: 'PROPOSAL',
      score: 90,
      tags: ['propuesta-enviada', 'negociacion'],
      assignedToId: agent1.id,
    },
    
    // WON - Ganados
    {
      name: 'Gabriela Mendoza',
      email: 'gabriela.mendoza@email.com',
      phone: '+52155512345691',
      source: 'INSTAGRAM',
      status: 'WON',
      score: 95,
      tags: ['cliente', 'vip'],
      assignedToId: agent1.id,
    },
    {
      name: 'Andrés Herrera',
      email: 'andres.herrera@email.com',
      phone: '+52155512345692',
      source: 'WHATSAPP',
      status: 'WON',
      score: 98,
      tags: ['cliente', 'alto-valor'],
      assignedToId: agent2.id,
    },
    {
      name: 'Lucía Flores',
      email: 'lucia.flores@email.com',
      phone: '+52155512345693',
      source: 'FACEBOOK',
      status: 'WON',
      score: 92,
      tags: ['cliente'],
      assignedToId: agent1.id,
    },
    
    // LOST - Perdidos
    {
      name: 'Daniel Ortiz',
      email: 'daniel.ortiz@email.com',
      phone: '+52155512345694',
      source: 'WEBSITE',
      status: 'LOST',
      score: 42,
      tags: ['sin-interes', 'precio'],
      assignedToId: agent2.id,
    },
    {
      name: 'Elena Navarro',
      email: 'elena.navarro@email.com',
      phone: '+52155512345695',
      source: 'WHATSAPP',
      status: 'LOST',
      score: 35,
      tags: ['sin-respuesta'],
      assignedToId: agent1.id,
    },
  ];

  const contacts = await Promise.all(
    contactsData.map((data) => prisma.contact.create({ data }))
  );

  console.log(`✅ Created ${contacts.length} contacts`);

  // 3. Crear conversaciones y mensajes
  console.log('💬 Creating conversations and messages...');
  
  const conversationsData = [
    {
      contactId: contacts[0].id,
      channel: 'WHATSAPP',
      status: 'OPEN',
      assignedToId: agent1.id,
    },
    {
      contactId: contacts[3].id,
      channel: 'WHATSAPP',
      status: 'OPEN',
      assignedToId: agent1.id,
    },
    {
      contactId: contacts[6].id,
      channel: 'WHATSAPP',
      status: 'PENDING',
      assignedToId: agent1.id,
    },
    {
      contactId: contacts[10].id,
      channel: 'WHATSAPP',
      status: 'OPEN',
      assignedToId: agent1.id,
    },
  ];

  for (const convData of conversationsData) {
    const conversation = await prisma.conversation.create({
      data: convData,
    });

    // Crear mensajes para cada conversación
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderType: 'CONTACT',
          content: '¡Hola! Me interesa conocer más sobre sus servicios.',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 3600000), // Hace 1 hora
        },
        {
          conversationId: conversation.id,
          senderType: 'AGENT',
          senderId: conversation.assignedToId,
          content: '¡Hola! Claro, con gusto te ayudo. ¿Qué te gustaría saber específicamente?',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 3500000),
        },
        {
          conversationId: conversation.id,
          senderType: 'CONTACT',
          content: 'Me gustaría saber los precios y si tienen planes mensuales.',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 3400000),
        },
        {
          conversationId: conversation.id,
          senderType: 'AGENT',
          senderId: conversation.assignedToId,
          content: 'Perfecto, te envío la información detallada de nuestros planes...',
          messageType: 'TEXT',
          sentAt: new Date(Date.now() - 3300000),
        },
      ],
    });
  }

  console.log(`✅ Created ${conversationsData.length} conversations with messages`);

  // 4. Crear campañas
  console.log('📢 Creating campaigns...');
  
  const campaigns = await prisma.campaign.createMany({
    data: [
      {
        name: 'Promoción Black Friday',
        type: 'BROADCAST',
        channel: 'WHATSAPP',
        status: 'COMPLETED',
        messageTemplate: '¡Hola {{nombre}}! 🎉 Black Friday: 50% OFF en todos nuestros planes. ¡No te lo pierdas!',
        metrics: { sent: 150, delivered: 145, read: 120, replied: 45 },
        createdById: admin.id,
        scheduledAt: new Date(Date.now() - 86400000 * 7), // Hace 7 días
        completedAt: new Date(Date.now() - 86400000 * 6),
      },
      {
        name: 'Seguimiento Leads Noviembre',
        type: 'AUTOMATED',
        channel: 'WHATSAPP',
        status: 'RUNNING',
        messageTemplate: 'Hola {{nombre}}, ¿todavía estás interesado en nuestros servicios? Estoy aquí para ayudarte.',
        metrics: { sent: 85, delivered: 82, read: 70, replied: 28 },
        createdById: manager.id,
        scheduledAt: new Date(Date.now() - 86400000 * 3), // Hace 3 días
      },
      {
        name: 'Campaña Navideña',
        type: 'BROADCAST',
        channel: 'WHATSAPP',
        status: 'SCHEDULED',
        messageTemplate: '🎄 {{nombre}}, este diciembre tenemos ofertas especiales para ti. ¿Hablamos?',
        metrics: { sent: 0, delivered: 0, read: 0, replied: 0 },
        createdById: admin.id,
        scheduledAt: new Date(Date.now() + 86400000 * 5), // En 5 días
      },
      {
        name: 'Reactivación Leads Fríos',
        type: 'AUTOMATED',
        channel: 'WHATSAPP',
        status: 'DRAFT',
        messageTemplate: 'Hola {{nombre}}, hace tiempo que no conversamos. ¿Puedo ayudarte con algo?',
        metrics: { sent: 0, delivered: 0, read: 0, replied: 0 },
        createdById: manager.id,
      },
    ],
  });

  console.log(`✅ Created 4 campaigns`);

  // 5. Crear configuración de IA
  console.log('🤖 Creating AI config...');
  
  await prisma.aIConfig.create({
    data: {
      name: 'Configuración Principal',
      model: 'gpt-4-turbo-preview',
      systemPrompt: 'Eres un asistente de ventas profesional y amigable. Tu objetivo es ayudar a calificar leads y cerrar ventas de manera efectiva.',
      temperature: 0.7,
      maxTokens: 500,
      autoReply: false,
    },
  });

  console.log(`✅ Created AI config`);

  // Resumen
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👤 Users: 4 (1 Admin, 1 Manager, 2 Agents)`);
  console.log(`   📇 Contacts: ${contacts.length}`);
  console.log(`      - NEW: 3`);
  console.log(`      - CONTACTED: 3`);
  console.log(`      - QUALIFIED: 4`);
  console.log(`      - PROPOSAL: 3`);
  console.log(`      - WON: 3`);
  console.log(`      - LOST: 2`);
  console.log(`   💬 Conversations: ${conversationsData.length}`);
  console.log(`   📢 Campaigns: 4`);
  console.log(`   🤖 AI Config: 1`);
  console.log('\n🔐 Login credentials:');
  console.log('   Email: admin@tupaccrm.com');
  console.log('   Password: password123');
  console.log('   (También: manager@tupaccrm.com, agente1@tupaccrm.com, agente2@tupaccrm.com)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
