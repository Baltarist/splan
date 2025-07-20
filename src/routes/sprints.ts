import { Router } from 'express';
import { sprintController } from '../controllers/sprintController';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createSprintSchema,
  updateSprintSchema,
  getSprintSchema,
  listSprintsSchema,
  startSprintSchema,
  completeSprintSchema
} from '../schemas/sprintSchemas';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// POST /api/v1/sprints
router.post('/', validateRequest(createSprintSchema), sprintController.createSprint);

// GET /api/v1/sprints
router.get('/', validateRequest(listSprintsSchema), sprintController.getSprints);

// GET /api/v1/sprints/:id
router.get('/:id', validateRequest(getSprintSchema), sprintController.getSprintById);

// PUT /api/v1/sprints/:id
router.put('/:id', validateRequest(updateSprintSchema), sprintController.updateSprint);

// DELETE /api/v1/sprints/:id
router.delete('/:id', validateRequest(getSprintSchema), sprintController.deleteSprint);

// POST /api/v1/sprints/:id/start
router.post('/:id/start', validateRequest(startSprintSchema), sprintController.startSprint);

// POST /api/v1/sprints/:id/complete
router.post('/:id/complete', validateRequest(completeSprintSchema), sprintController.completeSprint);

export default router; 