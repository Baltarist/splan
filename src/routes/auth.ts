import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authenticateToken';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/authSchemas';
import { validateRequest } from '../middleware/validateRequest';
import { userController } from '../controllers/userController';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validateRequest(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validateRequest(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, authController.logout);

// GET /api/v1/auth/profile (proxy)
router.get('/profile', authenticateToken, userController.getProfile);
// PUT /api/v1/auth/profile (proxy)
router.put('/profile', authenticateToken, userController.updateProfile);

export default router; 