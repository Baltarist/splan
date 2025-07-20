import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import {
  getUserConfiguration,
  updateUserConfiguration,
  updateWorkingHours,
  updateSprintSettings,
  updateAIPreferences,
  updateLeaveSettings
} from '../controllers/userConfigurationController';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// User configuration CRUD
router.get('/', getUserConfiguration);
router.put('/', updateUserConfiguration);

// Specific configuration updates
router.put('/working-hours', updateWorkingHours);
router.put('/sprint-settings', updateSprintSettings);
router.put('/ai-preferences', updateAIPreferences);
router.put('/leave-settings', updateLeaveSettings);

export default router; 