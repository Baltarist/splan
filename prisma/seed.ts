import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Test kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash('test12345', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
    },
  });

  console.log('✅ Test user created:', testUser.username);

  // Örnek hedef oluştur
  const sampleGoal = await prisma.goal.upsert({
    where: { id: 'sample-goal-1' },
    update: {},
    create: {
      id: 'sample-goal-1',
      title: 'React Native Uygulaması Geliştirme',
      description: 'Personal Scrum uygulamasının mobile versiyonunu geliştirmek',
      status: 'ACTIVE',
      priority: 'HIGH',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      userId: testUser.id,
      scopeDocument: JSON.stringify({
        features: ['Authentication', 'Goal Management', 'Sprint Planning', 'Task Tracking'],
        requirements: ['Modern UI/UX', 'Offline Support', 'AI Integration'],
        timeline: '6-8 weeks'
      }),
      aiConfidenceScore: 0.85,
    },
  });

  console.log('✅ Sample goal created:', sampleGoal.title);

  // Örnek sprint oluştur
  const sampleSprint = await prisma.sprint.upsert({
    where: { id: 'sample-sprint-1' },
    update: {},
    create: {
      id: 'sample-sprint-1',
      title: 'Sprint 1: Foundation',
      description: 'Backend ve mobile app foundation geliştirme',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
      goalId: sampleGoal.id,
      userId: testUser.id,
      capacity: 40,
      velocity: 0,
      aiGeneratedPlan: JSON.stringify({
        tasks: ['Backend Setup', 'Database Schema', 'Mobile App Setup', 'Navigation'],
        capacity: 40,
        velocity: 0
      }),
    },
  });

  console.log('✅ Sample sprint created:', sampleSprint.title);

  // Örnek görevler oluştur
  const sampleTasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'sample-task-1' },
      update: {},
      create: {
        id: 'sample-task-1',
        title: 'Backend API Setup',
        description: 'Express.js ile REST API endpoints oluşturma',
        status: 'DONE',
        priority: 'HIGH',
        sprintId: sampleSprint.id,
        userId: testUser.id,
        estimatedHours: 8,
        actualHours: 6,
        dependencies: '',
        tags: 'backend,api,express',
      },
    }),
    prisma.task.upsert({
      where: { id: 'sample-task-2' },
      update: {},
      create: {
        id: 'sample-task-2',
        title: 'Database Schema Design',
        description: 'Prisma ile veritabanı şeması tasarlama',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        sprintId: sampleSprint.id,
        userId: testUser.id,
        estimatedHours: 6,
        actualHours: 4,
        dependencies: 'sample-task-1',
        tags: 'database,prisma,schema',
      },
    }),
    prisma.task.upsert({
      where: { id: 'sample-task-3' },
      update: {},
      create: {
        id: 'sample-task-3',
        title: 'Mobile App Navigation',
        description: 'React Navigation ile tab ve stack navigation',
        status: 'TODO',
        priority: 'MEDIUM',
        sprintId: sampleSprint.id,
        userId: testUser.id,
        estimatedHours: 4,
        actualHours: 0,
        dependencies: 'sample-task-2',
        tags: 'mobile,navigation,react-native',
      },
    }),
  ]);

  console.log('✅ Sample tasks created:', sampleTasks.length);

  // Örnek AI konuşması oluştur
  const sampleConversation = await prisma.conversation.upsert({
    where: { id: 'sample-conversation-1' },
    update: {},
    create: {
      id: 'sample-conversation-1',
      userId: testUser.id,
      type: 'daily_standup',
      context: JSON.stringify({
        goal: sampleGoal.title,
        sprint: sampleSprint.title,
        previousTasks: ['Backend Setup']
      }),
    },
  });

  // Örnek AI mesajları oluştur
  await Promise.all([
    prisma.message.upsert({
      where: { id: 'sample-message-1' },
      update: {},
      create: {
        id: 'sample-message-1',
        conversationId: sampleConversation.id,
        role: 'user',
        content: 'Bugün neler yapacağım?',
      },
    }),
    prisma.message.upsert({
      where: { id: 'sample-message-2' },
      update: {},
      create: {
        id: 'sample-message-2',
        conversationId: sampleConversation.id,
        role: 'assistant',
        content: 'Bugün için önerilerim:\n1. Database schema tasarımını tamamla\n2. Mobile app navigation yapısını kur\n3. Redux store setup yap\n\nHangi görevle başlamak istiyorsun?',
      },
    }),
  ]);

  console.log('✅ Sample AI conversation created with messages');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 