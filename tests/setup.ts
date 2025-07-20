import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Test database setup
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
  
  // Clean up any existing test data
  const prisma = new PrismaClient();
  await prisma.user.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

// Global test teardown
afterAll(async () => {
  // Cleanup test database
  const prisma = new PrismaClient();
  await prisma.user.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as Console; 