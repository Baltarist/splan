import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/authenticateToken';
import { updateProfileSchema } from '../schemas/userSchemas';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// GET /api/v1/users/profile
router.get('/profile', userController.getProfile);

// PUT /api/v1/users/profile
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);

// GET /api/v1/users/configuration
router.get('/configuration', userController.getConfiguration);

// PUT /api/v1/users/configuration
router.put('/configuration', userController.updateConfiguration);

export default router; 