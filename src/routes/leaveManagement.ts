import { Router } from 'express';
import { leaveManagementController } from '../controllers/leaveManagementController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// POST /api/v1/leave-requests - İzin talebi oluştur
router.post('/', leaveManagementController.createLeaveRequest);

// GET /api/v1/leave-requests - İzin taleplerini listele
router.get('/', leaveManagementController.getLeaveRequests);

// GET /api/v1/leave-requests/:id - İzin talebi detayı
router.get('/:id', leaveManagementController.getLeaveRequestById);

// PUT /api/v1/leave-requests/:id - İzin talebini güncelle
router.put('/:id', leaveManagementController.updateLeaveRequest);

// DELETE /api/v1/leave-requests/:id - İzin talebini sil
router.delete('/:id', leaveManagementController.deleteLeaveRequest);

// PATCH /api/v1/leave-requests/:id/status - İzin talebi durumunu güncelle
router.patch('/:id/status', leaveManagementController.updateLeaveRequestStatus);

// GET /api/v1/leave-requests/statistics - İzin istatistikleri
router.get('/statistics', leaveManagementController.getLeaveStatistics);

export default router; 