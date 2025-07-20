import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Goal Controller', () => {
  let testUser: any;
  let authToken: string;
  let testGoal: any;

  beforeAll(async () => {
    // Create test user with unique credentials
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'goal-test@example.com',
        username: 'goaltestuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'goal-test@example.com',
        password: 'testpassword123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.goal.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: 'goal-test@example.com'
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/goals', () => {
    it('should create a new goal successfully', async () => {
      const goalData = {
        title: 'Test Goal',
        description: 'This is a test goal',
        category: 'WORK',
        priority: 'HIGH',
        targetDate: '2024-12-31T23:59:59.000Z',
        estimatedEffort: '2 weeks',
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Goal created successfully');
      expect(response.body).toHaveProperty('goal');
      expect(response.body.goal.title).toBe(goalData.title);
      expect(response.body.goal.userId).toBe(testUser.id);

      testGoal = response.body.goal;
    });

    it('should return 400 for invalid goal data', async () => {
      const goalData = {
        title: '',
        description: 'This is a test goal',
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const goalData = {
        title: 'Test Goal',
        description: 'This is a test goal',
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .send(goalData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/goals', () => {
    it('should return user goals successfully', async () => {
      const response = await request(app)
        .get('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('goals');
      expect(Array.isArray(response.body.goals)).toBe(true);
      expect(response.body.goals.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/goals')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/goals/:id', () => {
    it('should return specific goal successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/goals/${testGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('goal');
      expect(response.body.goal.id).toBe(testGoal.id);
      expect(response.body.goal.title).toBe(testGoal.title);
    });

    it('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .get('/api/v1/goals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Goal not found');
    });
  });

  describe('PUT /api/v1/goals/:id', () => {
    it('should update goal successfully', async () => {
      const updateData = {
        title: 'Updated Test Goal',
        description: 'This is an updated test goal',
        priority: 'MEDIUM',
      };

      const response = await request(app)
        .put(`/api/v1/goals/${testGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Goal updated successfully');
      expect(response.body).toHaveProperty('goal');
      expect(response.body.goal.title).toBe(updateData.title);
      expect(response.body.goal.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent goal', async () => {
      const updateData = {
        title: 'Updated Test Goal',
      };

      const response = await request(app)
        .put('/api/v1/goals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Goal not found');
    });
  });

  describe('DELETE /api/v1/goals/:id', () => {
    it('should delete goal successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/goals/${testGoal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Goal deleted successfully');
    });

    it('should return 404 for non-existent goal', async () => {
      const response = await request(app)
        .delete('/api/v1/goals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Goal not found');
    });
  });
}); 