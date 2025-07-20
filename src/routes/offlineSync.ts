import { Router } from 'express';
import { offlineSyncController } from '../controllers/offlineSyncController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// POST /api/v1/offline-sync/queue - Sync queue'ya işlem ekle
router.post('/queue', offlineSyncController.addToSyncQueue);

// GET /api/v1/offline-sync/queue - Sync queue'daki işlemleri getir
router.get('/queue', offlineSyncController.getSyncQueue);

// POST /api/v1/offline-sync/process - Sync queue'daki işlemleri işle
router.post('/process', offlineSyncController.processSyncQueue);

// GET /api/v1/offline-sync/data - Offline data'yı getir
router.get('/data', offlineSyncController.getOfflineData);

// PUT /api/v1/offline-sync/data - Offline data'yı güncelle
router.put('/data', offlineSyncController.updateOfflineData);

// GET /api/v1/offline-sync/status - Sync durumunu getir
router.get('/status', offlineSyncController.getSyncStatus);

// DELETE /api/v1/offline-sync/queue - Sync queue'yu temizle
router.delete('/queue', offlineSyncController.clearSyncQueue);

// DELETE /api/v1/offline-sync/data - Offline data'yı temizle
router.delete('/data', offlineSyncController.clearOfflineData);

export default router; 