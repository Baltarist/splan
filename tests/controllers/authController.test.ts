import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Auth Controller', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Cleanup users before each test
    await prisma.user.deleteMany({
      where: {
        email: { in: ['auth-test@example.com', 'newuser@example.com'] }
      }
    });
    // Create test user with unique credentials
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'auth-test@example.com',
        username: 'authtestuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      },
    });
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'auth-test@example.com',
        password: 'testpassword123',
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: { in: ['auth-test@example.com', 'newuser@example.com'] }
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'newpassword123',
        firstName: 'New',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'auth-test@example.com',
        username: 'duplicateuser',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid data', async () => {
      const userData = {
        email: 'invalid-email',
        username: '',
        password: '123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'auth-test@example.com',
        password: 'testpassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');

      authToken = response.body.token;
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'auth-test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'auth-test@example.com',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('auth-test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
    });

    it('should return 400 for invalid update data', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
}); 