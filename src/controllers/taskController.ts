import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const taskController = {
  createTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, sprintId, goalId, priority, estimatedHours, dueDate, tags } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          sprintId: sprintId || null,
          goalId: goalId || null,
          priority: priority || 'MEDIUM',
          estimatedHours: estimatedHours || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          tags: tags || '',
          dependencies: '',
          status: 'TODO',
          userId,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  getTasks: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const tasks = await prisma.task.findMany({
        where: { userId },
        include: {
          sprint: true,
          goal: true,
          timeEntries: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  getTaskById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid task ID'
        });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId
        },
        include: {
          sprint: true,
          goal: true,
          timeEntries: true,
        }
      });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  updateTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, sprintId, goalId, status, priority, estimatedHours, actualHours, progress, dueDate, tags, notes } = req.body;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid task ID'
        });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (sprintId !== undefined) updateData.sprintId = sprintId || null;
      if (goalId !== undefined) updateData.goalId = goalId || null;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
      if (actualHours !== undefined) updateData.actualHours = actualHours;
      if (progress !== undefined) updateData.progress = progress;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (tags !== undefined) updateData.tags = tags;
      if (notes !== undefined) updateData.notes = notes;

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          sprint: true,
          goal: true,
          timeEntries: true,
        }
      });

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid task ID'
        });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      await prisma.task.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  updateTaskStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId || !id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated or invalid task ID'
        });
        return;
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          sprint: true,
          goal: true,
          timeEntries: true,
        }
      });

      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  },

  timeTracking: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId, startTime, endTime, duration, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const timeEntry = await prisma.timeEntry.create({
        data: {
          userId,
          taskId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          duration: duration || null,
          description: description || null,
        }
      });

      res.status(201).json({
        success: true,
        message: 'Time entry created successfully',
        data: timeEntry
      });
    } catch (error) {
      next(error);
    }
  },
}; 