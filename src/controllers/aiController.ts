import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const aiController = {
  // AI ile sohbet
  chat: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Message is required'
        });
        return;
      }

      const result = await aiService.chat(userId, message, conversationId);

      res.status(200).json({
        success: true,
        message: 'AI response generated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Hedef önerileri
  suggestGoals: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { context } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!context) {
        res.status(400).json({
          success: false,
          message: 'Context is required'
        });
        return;
      }

      const suggestions = await aiService.suggestGoals(userId, context);

      res.status(200).json({
        success: true,
        message: 'Goal suggestions generated successfully',
        data: { suggestions }
      });
    } catch (error) {
      next(error);
    }
  },

  // Görev önerileri
  suggestTasks: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { goalId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!goalId) {
        res.status(400).json({
          success: false,
          message: 'Goal ID is required'
        });
        return;
      }

      const suggestions = await aiService.suggestTasks(userId, goalId);

      res.status(200).json({
        success: true,
        message: 'Task suggestions generated successfully',
        data: { suggestions }
      });
    } catch (error) {
      next(error);
    }
  },

  // Hedef kapsamını yeniden oluştur
  regenerateGoalScope: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { goalId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!goalId) {
        res.status(400).json({
          success: false,
          message: 'Goal ID is required'
        });
        return;
      }

      const scope = await aiService.regenerateGoalScope(userId, goalId);

      res.status(200).json({
        success: true,
        message: 'Goal scope regenerated successfully',
        data: { scope }
      });
    } catch (error) {
      next(error);
    }
  },

  // Sohbet geçmişini al
  getConversationHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: 'Conversation ID is required'
        });
        return;
      }

      const messages = await aiService.getConversationHistory(userId, conversationId);

      res.status(200).json({
        success: true,
        message: 'Conversation history retrieved successfully',
        data: { messages }
      });
    } catch (error) {
      next(error);
    }
  },

  // Kullanıcının sohbetlerini listele
  getUserConversations: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const conversations = await aiService.getUserConversations(userId);

      res.status(200).json({
        success: true,
        message: 'User conversations retrieved successfully',
        data: { conversations }
      });
    } catch (error) {
      next(error);
    }
  }
}; 