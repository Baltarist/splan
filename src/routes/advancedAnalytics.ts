import { Router } from 'express';
import { advancedAnalyticsController } from '../controllers/advancedAnalyticsController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

/**
 * @swagger
 * /api/v1/advanced-analytics/productivity:
 *   get:
 *     summary: Get comprehensive productivity metrics
 *     description: Retrieve detailed productivity metrics including completion rates, trends, and scores
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time period for metrics calculation
 *         example: month
 *     responses:
 *       200:
 *         description: Productivity metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: number
 *                     completedTasks:
 *                       type: number
 *                     completionRate:
 *                       type: number
 *                     productivityScore:
 *                       type: number
 *                     weeklyTrend:
 *                       type: array
 *                       items:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/productivity', 
  authenticateToken, 
  advancedAnalyticsController.getProductivityMetrics
);

/**
 * @swagger
 * /api/v1/advanced-analytics/predictions/{taskId}:
 *   get:
 *     summary: Get task completion prediction
 *     description: Use machine learning to predict task completion time and identify risk factors
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID for prediction
 *     responses:
 *       200:
 *         description: Task prediction generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     estimatedCompletionDate:
 *                       type: string
 *                       format: date-time
 *                     confidence:
 *                       type: number
 *                     riskFactors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/predictions/:taskId', 
  authenticateToken, 
  advancedAnalyticsController.getTaskPrediction
);

/**
 * @swagger
 * /api/v1/advanced-analytics/insights:
 *   get:
 *     summary: Get personalized user insights
 *     description: Analyze user patterns and provide personalized insights
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User insights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     productivityPatterns:
 *                       type: array
 *                       items:
 *                         type: string
 *                     peakHours:
 *                       type: array
 *                       items:
 *                         type: string
 *                     preferredTaskTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     improvementAreas:
 *                       type: array
 *                       items:
 *                         type: string
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/insights', 
  authenticateToken, 
  advancedAnalyticsController.getUserInsights
);

/**
 * @swagger
 * /api/v1/advanced-analytics/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     description: Generate AI-powered recommendations for productivity improvement
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get('/recommendations', 
  authenticateToken, 
  advancedAnalyticsController.getRecommendations
);

/**
 * @swagger
 * /api/v1/advanced-analytics/team/{teamId}:
 *   get:
 *     summary: Get team analytics
 *     description: Retrieve team-wide analytics and performance metrics
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID for analytics
 *     responses:
 *       200:
 *         description: Team analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     teamSize:
 *                       type: number
 *                     averageProductivity:
 *                       type: number
 *                     topPerformers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     teamTrends:
 *                       type: object
 *       403:
 *         description: Access denied to team analytics
 *       500:
 *         description: Internal server error
 */
router.get('/team/:teamId', 
  authenticateToken, 
  advancedAnalyticsController.getTeamAnalytics
);

/**
 * @swagger
 * /api/v1/advanced-analytics/trends:
 *   get:
 *     summary: Get performance trends
 *     description: Analyze performance trends over a specified period
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Number of days for trend analysis
 *         example: "30"
 *     responses:
 *       200:
 *         description: Performance trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           completed:
 *                             type: number
 *                           total:
 *                             type: number
 *                           completionRate:
 *                             type: number
 *                     period:
 *                       type: number
 *                     averageCompletionRate:
 *                       type: number
 *       500:
 *         description: Internal server error
 */
router.get('/trends', 
  authenticateToken, 
  advancedAnalyticsController.getPerformanceTrends
);

/**
 * @swagger
 * /api/v1/advanced-analytics/comparison:
 *   get:
 *     summary: Get productivity comparison
 *     description: Compare current productivity with previous periods or team averages
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: compareWith
 *         schema:
 *           type: string
 *           enum: [previous, team]
 *         description: Comparison baseline
 *         example: "previous"
 *     responses:
 *       200:
 *         description: Productivity comparison retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: object
 *                     comparison:
 *                       type: object
 *                     improvement:
 *                       type: object
 *                       properties:
 *                         productivityScore:
 *                           type: number
 *                         completionRate:
 *                           type: number
 *                         percentage:
 *                           type: number
 *       500:
 *         description: Internal server error
 */
router.get('/comparison', 
  authenticateToken, 
  advancedAnalyticsController.getProductivityComparison
);

/**
 * @swagger
 * /api/v1/advanced-analytics/ai-insights:
 *   get:
 *     summary: Get AI-powered insights
 *     description: Generate comprehensive AI-powered insights and recommendations
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI insights generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: string
 *                     keyMetrics:
 *                       type: object
 *                       properties:
 *                         productivityScore:
 *                           type: number
 *                         completionRate:
 *                           type: number
 *                         averageTaskDuration:
 *                           type: number
 *                     patterns:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/ai-insights', 
  authenticateToken, 
  advancedAnalyticsController.getAIInsights
);

export default router; 