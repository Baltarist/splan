import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        res.status(400).json({ error: 'User with this email or username already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(200).json({
        message: 'Token refreshed successfully',
        user,
        token: newToken
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(200).json({ message: 'Logged out successfully' });
  },
}; 