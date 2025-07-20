import api, { ApiResponse } from './api';

export interface DataExport {
  id: string;
  userId: string;
  format: 'JSON' | 'CSV';
  filename: string;
  fileSize: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  exportedAt: string;
  errors?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataImport {
  id: string;
  userId: string;
  filename: string;
  fileSize: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  conflictResolution: 'SKIP' | 'UPDATE' | 'REPLACE';
  importedRecords?: number;
  skippedRecords?: number;
  errorCount?: number;
  errors?: string;
  importedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataBackup {
  id: string;
  userId: string;
  description: string;
  filename?: string;
  fileSize?: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errors?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface DataRestore {
  id: string;
  userId: string;
  backupId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  conflictResolution: 'SKIP' | 'UPDATE' | 'REPLACE';
  restoredRecords?: number;
  skippedRecords?: number;
  errorCount?: number;
  errors?: string;
  restoredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBackupRequest {
  description?: string;
  includeSettings?: boolean;
}

export interface RestoreBackupRequest {
  conflictResolution?: 'SKIP' | 'UPDATE' | 'REPLACE';
}

export interface ImportDataRequest {
  file: any; // File object
  conflictResolution?: 'SKIP' | 'UPDATE' | 'REPLACE';
}

export interface ExportDataRequest {
  format?: 'JSON' | 'CSV';
  includeDeleted?: boolean;
}

export interface ExportImportHistory {
  exports: DataExport[];
  imports: DataImport[];
  restores: DataRestore[];
}

export const dataExportImportService = {
  // Kullanıcı verilerini export et
  exportUserData: async (params?: ExportDataRequest): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format.toLowerCase());
      if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

      const url = `/data/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export user data');
    }
  },

  // Kullanıcı verilerini import et
  importUserData: async (params: ImportDataRequest): Promise<{
    importId: string;
    importedRecords: number;
    skippedRecords: number;
    errorCount: number;
    errors: string[];
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', params.file);
      if (params.conflictResolution) {
        formData.append('conflictResolution', params.conflictResolution);
      }

      const response = await api.post<ApiResponse<{
        importId: string;
        importedRecords: number;
        skippedRecords: number;
        errorCount: number;
        errors: string[];
      }>>('/data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to import user data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to import user data');
    }
  },

  // Backup oluştur
  createBackup: async (params: CreateBackupRequest): Promise<{
    backupId: string;
    filename: string;
  }> => {
    try {
      const response = await api.post<ApiResponse<{
        backupId: string;
        filename: string;
      }>>('/data/backup', params);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create backup');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create backup');
    }
  },

  // Backup'ları listele
  getBackups: async (): Promise<DataBackup[]> => {
    try {
      const response = await api.get<ApiResponse<DataBackup[]>>('/data/backup');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch backups');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch backups');
    }
  },

  // Backup'ı indir
  downloadBackup: async (backupId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/data/backup/${backupId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download backup');
    }
  },

  // Backup'ı geri yükle
  restoreBackup: async (backupId: string, params?: RestoreBackupRequest): Promise<{
    restoreId: string;
    restoredRecords: number;
    skippedRecords: number;
    errorCount: number;
    errors: string[];
  }> => {
    try {
      const response = await api.post<ApiResponse<{
        restoreId: string;
        restoredRecords: number;
        skippedRecords: number;
        errorCount: number;
        errors: string[];
      }>>(`/data/backup/${backupId}/restore`, params);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to restore backup');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to restore backup');
    }
  },

  // Export/Import geçmişini getir
  getExportImportHistory: async (): Promise<ExportImportHistory> => {
    try {
      const response = await api.get<ApiResponse<ExportImportHistory>>('/data/history');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch export/import history');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch export/import history');
    }
  },

  // Utility functions
  getStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      'PROCESSING': 'İşleniyor',
      'COMPLETED': 'Tamamlandı',
      'FAILED': 'Başarısız'
    };
    return labels[status] || status;
  },

  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'PROCESSING': '#FF9800',
      'COMPLETED': '#4CAF50',
      'FAILED': '#F44336'
    };
    return colors[status] || '#666';
  },

  getConflictResolutionLabel: (resolution: string): string => {
    const labels: Record<string, string> = {
      'SKIP': 'Atla',
      'UPDATE': 'Güncelle',
      'REPLACE': 'Değiştir'
    };
    return labels[resolution] || resolution;
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  parseErrors: (errorsString?: string): string[] => {
    if (!errorsString) return [];
    
    try {
      return JSON.parse(errorsString);
    } catch (error) {
      console.error('Failed to parse errors:', error);
      return [errorsString];
    }
  },

  // File handling utilities
  createFileFromBlob: (blob: Blob, filename: string): File => {
    return new File([blob], filename, { 
      type: blob.type,
      lastModified: Date.now()
    });
  },

  downloadBlob: (blob: Blob, filename: string): void => {
    // React Native doesn't support browser download APIs
    // This would need to be implemented using React Native file system APIs
    console.log('Download functionality not available in React Native');
    console.log('Blob:', blob);
    console.log('Filename:', filename);
  },

  // Data validation
  validateImportFile: (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/json', 'text/csv'];
    const allowedExtensions = ['.json', '.csv'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type) && 
        !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return { isValid: false, error: 'Only JSON and CSV files are allowed' };
    }

    return { isValid: true };
  },

  // Backup utilities
  getBackupDescription: (backup: DataBackup): string => {
    if (backup.description && backup.description !== 'Manual backup') {
      return backup.description;
    }
    
    const date = new Date(backup.createdAt);
    return `Backup - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  },

  getBackupStatusInfo: (backup: DataBackup): {
    label: string;
    color: string;
    icon: string;
  } => {
    switch (backup.status) {
      case 'PROCESSING':
        return {
          label: 'İşleniyor',
          color: '#FF9800',
          icon: '⏳'
        };
      case 'COMPLETED':
        return {
          label: 'Tamamlandı',
          color: '#4CAF50',
          icon: '✅'
        };
      case 'FAILED':
        return {
          label: 'Başarısız',
          color: '#F44336',
          icon: '❌'
        };
      default:
        return {
          label: backup.status,
          color: '#666',
          icon: '❓'
        };
    }
  }
}; 