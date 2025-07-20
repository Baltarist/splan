import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const notificationController = {
  // Create notification
  createNotification: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { title, message, type, data } = req.body;

      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          category: 'SYSTEM',
          metadata: data ? JSON.stringify(data) : null,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      logger.error('Error creating notification:', error);
      next(error);
    }
  },

  // Get notifications
  getNotifications: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, read, type } = req.query;

      const where: any = { userId };
      if (read !== undefined) {
        where.status = read === 'true' ? 'READ' : 'PENDING';
      }
      if (type) {
        where.type = type;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.notification.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
          },
        },
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting notifications:', error);
      next(error);
    }
  },

  // Get notification by ID
  getNotificationById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
        });
        return;
      }

      const notification = await prisma.notification.findUnique({
        where: { id, userId },
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting notification by ID:', error);
      next(error);
    }
  },

  // Mark notification as read
  markAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
        });
        return;
      }

      const notification = await prisma.notification.update({
        where: { id, userId },
        data: { status: 'READ', readAt: new Date() },
      });

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification marked as read successfully',
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, status: 'PENDING' },
        data: { status: 'READ', readAt: new Date() },
      });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read successfully',
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  },

  // Delete notification
  deleteNotification: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Notification ID is required',
        });
        return;
      }

      await prisma.notification.delete({
        where: { id, userId },
      });

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      next(error);
    }
  },

  // Clear read notifications
  clearReadNotifications: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const result = await prisma.notification.deleteMany({
        where: { userId, status: 'READ' },
      });

      res.status(200).json({
        success: true,
        data: { deletedCount: result.count },
        message: 'Read notifications cleared successfully',
      });
    } catch (error) {
      logger.error('Error clearing read notifications:', error);
      next(error);
    }
  },

  // Get notification settings
  getNotificationSettings: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const settings = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      const defaultSettings = {
        pushEnabled: true,
        emailEnabled: true,
        inAppEnabled: true,
        quietHoursStart: null,
        quietHoursEnd: null,
        categories: null,
        frequency: 'IMMEDIATE',
      };

      res.status(200).json({
        success: true,
        data: settings || defaultSettings,
        message: 'Notification settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting notification settings:', error);
      next(error);
    }
  },

  // Update notification settings
  updateNotificationSettings: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { pushEnabled, emailEnabled, inAppEnabled, quietHoursStart, quietHoursEnd, categories, frequency } = req.body;

      const settings = await prisma.notificationPreference.upsert({
        where: { userId },
        update: {
          pushEnabled,
          emailEnabled,
          inAppEnabled,
          quietHoursStart,
          quietHoursEnd,
          categories: categories ? JSON.stringify(categories) : null,
          frequency,
        },
        create: {
          userId,
          pushEnabled,
          emailEnabled,
          inAppEnabled,
          quietHoursStart,
          quietHoursEnd,
          categories: categories ? JSON.stringify(categories) : null,
          frequency,
        },
      });

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Notification settings updated successfully',
      });
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      next(error);
    }
  },

  // Get notification statistics
  getNotificationStats: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const [total, unread, byType] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, status: 'PENDING' } }),
        prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true },
        }),
      ]);

      const stats = {
        total,
        unread,
        read: total - unread,
        byType: byType.reduce((acc: Record<string, number>, item: any) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
      };

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Notification statistics retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting notification statistics:', error);
      next(error);
    }
  },
}; 