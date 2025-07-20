import { Router } from 'express';
import { dataExportImportController } from '../controllers/dataExportImportController';
import { authenticateToken } from '../middleware/authenticateToken';
import multer from 'multer';

const router = Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/json' || 
        file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.json') || 
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'));
    }
  }
});

// Tüm routes authentication gerektirir
router.use(authenticateToken);

// GET /api/v1/data-export - Kullanıcı verilerini export et
router.get('/export', dataExportImportController.exportData);

// POST /api/v1/data-import - Kullanıcı verilerini import et
router.post('/import', upload.single('file'), dataExportImportController.importData);

// POST /api/v1/data-backup - Backup oluştur
router.post('/backup', dataExportImportController.backupData);

// GET /api/v1/data-backup - Backup'ları listele
router.get('/backup', dataExportImportController.getBackups);

// GET /api/v1/data-backup/:id/download - Backup'ı indir
router.get('/backup/:id/download', dataExportImportController.downloadBackup);

// POST /api/v1/data-backup/:id/restore - Backup'ı geri yükle
router.post('/backup/:id/restore', dataExportImportController.restoreBackup);

// GET /api/v1/data-history - Export/Import geçmişini getir
router.get('/history', dataExportImportController.getExportImportHistory);

export default router; 