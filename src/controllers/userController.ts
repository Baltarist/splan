import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const userController = {
  getProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Access token required' });
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      next(error);
      return;
    }
  },
  updateProfile: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Access token required' });
      }
      const { firstName, lastName } = req.body;
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }
      const user = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          firstName: true,
          lastName: true
        }
      });
      return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      next(error);
      return;
    }
  },
  getConfiguration: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Implement get user configuration
    return res.status(200).json({ message: 'User configuration (mock)' });
  },
  updateConfiguration: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // TODO: Implement update user configuration
    return res.status(200).json({ message: 'User configuration updated (mock)' });
  },
}; 