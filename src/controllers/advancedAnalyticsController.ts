import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { advancedAnalyticsService } from '../services/advancedAnalyticsService';

const prisma = new PrismaClient();

export const advancedAnalyticsController = {
  // Get comprehensive productivity metrics
  getProductivityMetrics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { timeframe = 'month' } = req.query;

      const metrics = await advancedAnalyticsService.getProductivityMetrics(userId, timeframe as 'week' | 'month' | 'year');

      res.status(200).json({
        success: true,
        data: metrics,
        message: 'Productivity metrics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting productivity metrics:', error);
      next(error);
    }
  },

  // Get task completion prediction
  getTaskPrediction: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({
          success: false,
          message: 'Task ID is required',
        });
        return;
      }

      // Verify task exists and belongs to user
      const task = await prisma.task.findUnique({
        where: { id: taskId, userId },
      });

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        });
        return;
      }

      const prediction = await advancedAnalyticsService.predictTaskCompletion(taskId);

      res.status(200).json({
        success: true,
        data: prediction,
        message: 'Task prediction generated successfully',
      });
    } catch (error) {
      logger.error('Error getting task prediction:', error);
      next(error);
    }
  },

  // Get personalized user insights
  getUserInsights: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const insights = await advancedAnalyticsService.getUserInsights(userId);

      res.status(200).json({
        success: true,
        data: insights,
        message: 'User insights retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting user insights:', error);
      next(error);
    }
  },

  // Get personalized recommendations
  getRecommendations: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const recommendations = await advancedAnalyticsService.getRecommendations(userId);

      res.status(200).json({
        success: true,
        data: recommendations,
        message: 'Personalized recommendations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      next(error);
    }
  },

  // Get team analytics
  getTeamAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { teamId } = req.params;

      // For now, return individual analytics (team functionality can be added later)
      const teamAnalytics = await advancedAnalyticsService.getTeamAnalytics(userId, teamId);

      res.status(200).json({
        success: true,
        data: teamAnalytics,
        message: 'Team analytics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting team analytics:', error);
      next(error);
    }
  },

  // Get performance trends
  getPerformanceTrends: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { period = '30' } = req.query;

      const trends = await advancedAnalyticsService.getPerformanceTrends(userId, parseInt(period as string));

      res.status(200).json({
        success: true,
        data: trends,
        message: 'Performance trends retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting performance trends:', error);
      next(error);
    }
  },

  // Get productivity comparison
  getProductivityComparison: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { compareWith = 'previous' } = req.query;

      const comparison = await advancedAnalyticsService.getProductivityComparison(userId, compareWith as string);

      res.status(200).json({
        success: true,
        data: comparison,
        message: 'Productivity comparison retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting productivity comparison:', error);
      next(error);
    }
  },

  // Get AI-powered insights
  getAIInsights: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const aiInsights = await advancedAnalyticsService.getAIInsights(userId);

      res.status(200).json({
        success: true,
        data: aiInsights,
        message: 'AI insights generated successfully',
      });
    } catch (error) {
      logger.error('Error getting AI insights:', error);
      next(error);
    }
  },
}; 