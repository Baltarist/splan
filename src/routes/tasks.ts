import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  listTasksSchema,
  timeTrackingSchema
} from '../schemas/taskSchemas';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// POST /api/v1/tasks
router.post('/', validateRequest(createTaskSchema), taskController.createTask);

// GET /api/v1/tasks
router.get('/', validateRequest(listTasksSchema), taskController.getTasks);

// GET /api/v1/tasks/:id
router.get('/:id', validateRequest(getTaskSchema), taskController.getTaskById);

// PUT /api/v1/tasks/:id
router.put('/:id', validateRequest(updateTaskSchema), taskController.updateTask);

// PATCH /api/v1/tasks/:id/status
router.patch('/:id/status', validateRequest(getTaskSchema), taskController.updateTaskStatus);

// DELETE /api/v1/tasks/:id
router.delete('/:id', validateRequest(getTaskSchema), taskController.deleteTask);

// POST /api/v1/tasks/:id/time-tracking
router.post('/:id/time-tracking', validateRequest(timeTrackingSchema), taskController.timeTracking);

export default router; 