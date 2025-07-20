import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

// AI Chat
router.post('/chat', authenticateToken, aiController.chat);

// Goal Suggestions
router.post('/suggest-goals', authenticateToken, aiController.suggestGoals);

// Task Suggestions
router.post('/suggest-tasks', authenticateToken, aiController.suggestTasks);

// Regenerate Goal Scope
router.post('/regenerate-goal-scope/:goalId', authenticateToken, aiController.regenerateGoalScope);

// Get Conversation History
router.get('/conversations/:conversationId', authenticateToken, aiController.getConversationHistory);

// Get User Conversations
router.get('/conversations', authenticateToken, aiController.getUserConversations);

export default router; 