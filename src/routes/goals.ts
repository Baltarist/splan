import { Router } from 'express';
import { goalController } from '../controllers/goalController';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createGoalSchema,
  updateGoalSchema,
  getGoalSchema,
  listGoalsSchema,
} from '../schemas/goalSchemas';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// POST /api/v1/goals
router.post('/', validateRequest(createGoalSchema), goalController.createGoal);

// GET /api/v1/goals
router.get('/', validateRequest(listGoalsSchema), goalController.getGoals);

// GET /api/v1/goals/:id
router.get('/:id', validateRequest(getGoalSchema), goalController.getGoalById);

// PUT /api/v1/goals/:id
router.put('/:id', validateRequest(updateGoalSchema), goalController.updateGoal);

// DELETE /api/v1/goals/:id
router.delete('/:id', validateRequest(getGoalSchema), goalController.deleteGoal);

// POST /api/v1/goals/:id/regenerate-scope
router.post('/:id/regenerate-scope', validateRequest(getGoalSchema), goalController.regenerateScope);

export default router; 