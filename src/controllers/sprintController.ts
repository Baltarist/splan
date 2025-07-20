import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const sprintController = {
  createSprint: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, goalId, startDate, endDate, capacity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const sprint = await prisma.sprint.create({
        data: {
          title,
          description,
          goalId: goalId || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          capacity: capacity || null,
          status: 'PLANNED',
          userId,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Sprint created successfully',
        data: sprint
      });
    } catch (error) {
      next(error);
    }
  },

  getSprints: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const sprints = await prisma.sprint.findMany({
        where: { userId },
        include: {
          goal: true,
          tasks: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        message: 'Sprints retrieved successfully',
        data: sprints
      });
    } catch (error) {
      next(error);
    }
  },

  getSprintById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid sprint ID'
        });
        return;
      }

      const sprint = await prisma.sprint.findFirst({
        where: {
          id,
          userId
        },
        include: {
          goal: true,
          tasks: true,
        }
      });

      if (!sprint) {
        res.status(404).json({
          success: false,
          message: 'Sprint not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sprint retrieved successfully',
        data: sprint
      });
    } catch (error) {
      next(error);
    }
  },

  updateSprint: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, goalId, startDate, endDate, capacity, status } = req.body;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid sprint ID'
        });
        return;
      }

      const sprint = await prisma.sprint.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!sprint) {
        res.status(404).json({
          success: false,
          message: 'Sprint not found'
        });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (goalId !== undefined) updateData.goalId = goalId || null;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (capacity !== undefined) updateData.capacity = capacity;
      if (status !== undefined) updateData.status = status;

      const updatedSprint = await prisma.sprint.update({
        where: { id },
        data: updateData,
        include: {
          goal: true,
          tasks: true,
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sprint updated successfully',
        data: updatedSprint
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSprint: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid sprint ID'
        });
        return;
      }

      const sprint = await prisma.sprint.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!sprint) {
        res.status(404).json({
          success: false,
          message: 'Sprint not found'
        });
        return;
      }

      await prisma.sprint.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Sprint deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  startSprint: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid sprint ID'
        });
        return;
      }

      const sprint = await prisma.sprint.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!sprint) {
        res.status(404).json({
          success: false,
          message: 'Sprint not found'
        });
        return;
      }

      const updatedSprint = await prisma.sprint.update({
        where: { id },
        data: {
          status: 'ACTIVE',
        },
        include: {
          goal: true,
          tasks: true,
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sprint started successfully',
        data: updatedSprint
      });
    } catch (error) {
      next(error);
    }
  },

  completeSprint: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid sprint ID'
        });
        return;
      }

      const sprint = await prisma.sprint.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!sprint) {
        res.status(404).json({
          success: false,
          message: 'Sprint not found'
        });
        return;
      }

      const updatedSprint = await prisma.sprint.update({
        where: { id },
        data: {
          status: 'COMPLETED',
        },
        include: {
          goal: true,
          tasks: true,
        }
      });

      res.status(200).json({
        success: true,
        message: 'Sprint completed successfully',
        data: updatedSprint
      });
    } catch (error) {
      next(error);
    }
  },
}; 