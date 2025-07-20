import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import goalRoutes from './goals';
import sprintRoutes from './sprints';
import taskRoutes from './tasks';
import aiRoutes from './ai';
import analyticsRoutes from './analytics';
import userConfigurationRoutes from './userConfigurationRoutes';
import leaveManagementRoutes from './leaveManagement';
import notificationRoutes from './notifications';
import dataExportImportRoutes from './dataExportImport';
import offlineSyncRoutes from './offlineSync';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/goals`, goalRoutes);
router.use(`${API_PREFIX}/sprints`, sprintRoutes);
router.use(`${API_PREFIX}/tasks`, taskRoutes);
router.use(`${API_PREFIX}/ai`, aiRoutes);
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);
router.use(`${API_PREFIX}/user-configuration`, userConfigurationRoutes);
router.use(`${API_PREFIX}/leave-requests`, leaveManagementRoutes);
router.use(`${API_PREFIX}/notifications`, notificationRoutes);
router.use(`${API_PREFIX}/data`, dataExportImportRoutes);
router.use(`${API_PREFIX}/offline-sync`, offlineSyncRoutes);

export default router; 