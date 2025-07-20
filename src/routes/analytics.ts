import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// GET /api/v1/analytics/dashboard - Ana dashboard verileri
router.get('/dashboard', analyticsController.getDashboard);

// GET /api/v1/analytics/productivity - Üretkenlik metrikleri
router.get('/productivity', analyticsController.getProductivityMetrics);

// GET /api/v1/analytics/goals - Hedef analitikleri
router.get('/goals', analyticsController.getGoalAnalytics);

// GET /api/v1/analytics/goals/:goalId - Belirli hedef analitikleri
router.get('/goals/:goalId', analyticsController.getGoalAnalytics);

// GET /api/v1/analytics/sprints - Sprint analitikleri
router.get('/sprints', analyticsController.getSprintAnalytics);

// GET /api/v1/analytics/tasks - Görev analitikleri
router.get('/tasks', analyticsController.getTaskAnalytics);

// GET /api/v1/analytics/time-tracking - Zaman takibi analitikleri
router.get('/time-tracking', analyticsController.getTimeTracking);

export default router; 