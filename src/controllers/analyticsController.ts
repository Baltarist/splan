import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const analyticsController = {
  // Get dashboard analytics
  getDashboard: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const [goals, sprints, tasks] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.sprint.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.task.findMany({
          where: { userId },
          include: { timeEntries: true },
        }),
      ]);

      const dashboardData = {
        goals: {
          total: goals.length,
          completed: goals.filter((goal: any) => goal.status === 'COMPLETED').length,
          inProgress: goals.filter((goal: any) => goal.status === 'IN_PROGRESS').length,
        },
        sprints: {
          total: sprints.length,
          active: sprints.filter((sprint: any) => sprint.status === 'ACTIVE').length,
          completed: sprints.filter((sprint: any) => sprint.status === 'COMPLETED').length,
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((task: any) => task.status === 'DONE').length,
          inProgress: tasks.filter((task: any) => task.status === 'IN_PROGRESS').length,
          overdue: tasks.filter((task: any) => 
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
          ).length,
        },
        productivity: {
          completionRate: tasks.length > 0 ? (tasks.filter((task: any) => task.status === 'DONE').length / tasks.length) * 100 : 0,
          averageTaskDuration: tasks.length > 0 ? 
            tasks.reduce((sum: number, task: any) => sum + (task.actualHours || 0), 0) / tasks.length : 0,
        },
      };

      res.status(200).json({
        success: true,
        data: dashboardData,
        message: 'Dashboard analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting dashboard analytics:', error);
      next(error);
    }
  },

  // Get productivity metrics
  getProductivityMetrics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { timeframe = 'month' } = req.query;

      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        include: { timeEntries: true },
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task: any) => task.status === 'DONE').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const taskDurations = tasks
        .filter((task: any) => task.actualHours && task.actualHours > 0)
        .map((task: any) => task.actualHours!);
      
      const averageTaskDuration = taskDurations.length > 0 
        ? taskDurations.reduce((sum: number, duration: number) => sum + duration, 0) / taskDurations.length 
        : 0;

      const productivityScore = Math.min(100, completionRate * 0.6 + (100 - averageTaskDuration * 10) * 0.4);

      res.status(200).json({
        success: true,
        data: {
          totalTasks,
          completedTasks,
          completionRate,
          averageTaskDuration,
          productivityScore: Math.round(productivityScore),
          timeframe,
        },
        message: 'Productivity metrics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting productivity metrics:', error);
      next(error);
    }
  },

  // Get goal analytics
  getGoalAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { goalId } = req.params;

      if (goalId) {
        // Single goal analytics
        const goal = await prisma.goal.findUnique({
          where: { id: goalId, userId },
          include: { tasks: true },
        });

        if (!goal) {
          res.status(404).json({
            success: false,
            message: 'Goal not found',
          });
          return;
        }

        const goalTasks = goal.tasks;
        const completedTasks = goalTasks.filter((task: any) => task.status === 'DONE').length;
        const progress = goalTasks.length > 0 ? (completedTasks / goalTasks.length) * 100 : 0;

        res.status(200).json({
          success: true,
          data: {
            goal,
            progress,
            completedTasks,
            totalTasks: goalTasks.length,
          },
          message: 'Goal analytics retrieved successfully',
        });
      } else {
        // All goals analytics
        const goals = await prisma.goal.findMany({
          where: { userId },
          include: { tasks: true },
        });

        const goalsAnalytics = goals.map((goal: any) => {
          const goalTasks = goal.tasks;
          const completedTasks = goalTasks.filter((task: any) => task.status === 'DONE').length;
          const progress = goalTasks.length > 0 ? (completedTasks / goalTasks.length) * 100 : 0;

          return {
            id: goal.id,
            title: goal.title,
            progress,
            completedTasks,
            totalTasks: goalTasks.length,
            status: goal.status,
          };
        });

        res.status(200).json({
          success: true,
          data: goalsAnalytics,
          message: 'Goals analytics retrieved successfully',
        });
      }
    } catch (error) {
      logger.error('Error getting goal analytics:', error);
      next(error);
    }
  },

  // Get sprint analytics
  getSprintAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const sprints = await prisma.sprint.findMany({
        where: { userId },
        include: { tasks: true },
      });

      const sprintAnalytics = sprints.map((sprint: any) => {
        const sprintTasks = sprint.tasks;
        const completedTasks = sprintTasks.filter((task: any) => task.status === 'DONE').length;
        const progress = sprintTasks.length > 0 ? (completedTasks / sprintTasks.length) * 100 : 0;

        return {
          id: sprint.id,
          title: sprint.title,
          progress,
          completedTasks,
          totalTasks: sprintTasks.length,
          status: sprint.status,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
        };
      });

      res.status(200).json({
        success: true,
        data: sprintAnalytics,
        message: 'Sprint analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting sprint analytics:', error);
      next(error);
    }
  },

  // Get task analytics
  getTaskAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { timeframe = 'month' } = req.query;

      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        include: { timeEntries: true },
      });

      const taskAnalytics = {
        total: tasks.length,
        byStatus: {
          todo: tasks.filter((task: any) => task.status === 'TODO').length,
          inProgress: tasks.filter((task: any) => task.status === 'IN_PROGRESS').length,
          done: tasks.filter((task: any) => task.status === 'DONE').length,
        },
        byPriority: {
          low: tasks.filter((task: any) => task.priority === 'LOW').length,
          medium: tasks.filter((task: any) => task.priority === 'MEDIUM').length,
          high: tasks.filter((task: any) => task.priority === 'HIGH').length,
        },
        overdue: tasks.filter((task: any) => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
        ).length,
        averageDuration: tasks.length > 0 ? 
          tasks.reduce((sum: number, task: any) => sum + (task.actualHours || 0), 0) / tasks.length : 0,
      };

      res.status(200).json({
        success: true,
        data: taskAnalytics,
        message: 'Task analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting task analytics:', error);
      next(error);
    }
  },

  // Get time tracking analytics
  getTimeTracking: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { timeframe = 'week' } = req.query;

      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          userId,
          startTime: { gte: startDate },
        },
        include: { task: true },
      });

      const totalHours = timeEntries.reduce((sum: number, entry: any) => {
        if (entry.endTime) {
          const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
          return sum + duration;
        }
        return sum;
      }, 0);

      const dailyHours = timeEntries.reduce((acc: Record<string, number>, entry: any) => {
        const date = new Date(entry.startTime).toDateString();
        if (!acc[date]) acc[date] = 0;
        
        if (entry.endTime) {
          const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
          acc[date] += duration;
        }
        
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: {
          totalHours: Math.round(totalHours * 100) / 100,
          dailyHours,
          totalSessions: timeEntries.length,
          averageSessionLength: timeEntries.length > 0 ? totalHours / timeEntries.length : 0,
          timeframe,
        },
        message: 'Time tracking analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting time tracking analytics:', error);
      next(error);
    }
  },
}; 