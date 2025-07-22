import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const goalController = {
  createGoal: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, priority, targetDate, category, estimatedEffort } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }
      if (!title || title.trim() === '') {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const goal = await prisma.goal.create({
        data: {
          title,
          description,
          priority: priority || 'MEDIUM',
          targetDate: targetDate ? new Date(targetDate) : null,
          status: 'ACTIVE',
          userId,
          category: category || 'WORK',
          estimatedEffort: estimatedEffort || null
        }
      });

      res.status(201).json({
        message: 'Goal created successfully',
        goal
      });
    } catch (error) {
      next(error);
    }
  },

  getGoals: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ goals });
    } catch (error) {
      next(error);
    }
  },

  getGoalById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!goal) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      res.status(200).json({ goal });
    } catch (error) {
      next(error);
    }
  },

  updateGoal: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, priority, targetDate, status, category, estimatedEffort } = req.body;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!goal) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      const updatedGoal = await prisma.goal.update({
        where: { id },
        data: {
          title,
          description,
          priority,
          targetDate: targetDate ? new Date(targetDate) : null,
          status,
          category,
          estimatedEffort
        }
      });

      res.status(200).json({
        message: 'Goal updated successfully',
        goal: updatedGoal
      });
    } catch (error) {
      next(error);
    }
  },

  deleteGoal: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!goal) {
        res.status(404).json({ error: 'Goal not found' });
        return;
      }

      await prisma.goal.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  regenerateScope: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // TODO: Implement AI scope regeneration
      res.status(200).json({
        success: true,
        message: 'Goal scope regenerated successfully'
      });
    } catch (error) {
      next(error);
    }
  },
}; 