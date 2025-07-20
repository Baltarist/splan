import api, { ApiResponse } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineSync {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastRetryAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineData {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  data: string;
  version: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncStatus {
  pendingCount: number;
  failedCount: number;
  lastSyncAt?: string;
  isOnline: boolean;
  needsSync: boolean;
}

export interface SyncQueueItem {
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
}

export interface SyncResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export interface AddToSyncQueueRequest {
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
}

export interface UpdateOfflineDataRequest {
  entityType: string;
  entityId: string;
  data: any;
}

// Local storage keys
const SYNC_QUEUE_KEY = 'splan_sync_queue';
const OFFLINE_DATA_KEY = 'splan_offline_data';
const LAST_SYNC_KEY = 'splan_last_sync';

export const offlineSyncService = {
  // Sync queue'ya işlem ekle (local storage)
  addToSyncQueue: async (item: SyncQueueItem): Promise<void> => {
    try {
      const queue = await offlineSyncService.getLocalSyncQueue();
      
      // Mevcut işlemi kontrol et ve güncelle
      const existingIndex = queue.findIndex(
        q => q.entityType === item.entityType && q.entityId === item.entityId
      );
      
      if (existingIndex !== -1) {
        queue[existingIndex] = item;
      } else {
        queue.push(item);
      }
      
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  },

  // Local sync queue'yu getir
  getLocalSyncQueue: async (): Promise<SyncQueueItem[]> => {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get local sync queue:', error);
      return [];
    }
  },

  // Local sync queue'yu temizle
  clearLocalSyncQueue: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear local sync queue:', error);
      throw error;
    }
  },

  // Offline data'yı local storage'a kaydet
  saveOfflineData: async (entityType: string, entityId: string, data: any): Promise<void> => {
    try {
      const offlineData = await offlineSyncService.getLocalOfflineData();
      
      const existingIndex = offlineData.findIndex(
        item => item.entityType === entityType && item.entityId === entityId
      );
      
      const offlineItem = {
        entityType,
        entityId,
        data,
        version: existingIndex !== -1 ? offlineData[existingIndex].version + 1 : 1,
        lastSyncedAt: new Date().toISOString()
      };
      
      if (existingIndex !== -1) {
        offlineData[existingIndex] = offlineItem;
      } else {
        offlineData.push(offlineItem);
      }
      
      await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
    } catch (error) {
      console.error('Failed to save offline data:', error);
      throw error;
    }
  },

  // Local offline data'yı getir
  getLocalOfflineData: async (entityType?: string): Promise<any[]> => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      const offlineData = data ? JSON.parse(data) : [];
      
      if (entityType) {
        return offlineData.filter((item: OfflineData) => item.entityType === entityType);
      }
      
      return offlineData;
    } catch (error) {
      console.error('Failed to get local offline data:', error);
      return [];
    }
  },

  // Belirli entity type için offline data getir
  getLocalOfflineDataByType: async (entityType: string): Promise<OfflineData[]> => {
    try {
      const offlineData = await offlineSyncService.getLocalOfflineData();
      return offlineData.filter((item: OfflineData) => item.entityType === entityType);
    } catch (error) {
      console.error('Failed to get local offline data by type:', error);
      return [];
    }
  },

  // Local offline data'yı temizle
  clearLocalOfflineData: async (entityType?: string): Promise<void> => {
    try {
      if (entityType) {
        const data = await offlineSyncService.getLocalOfflineData();
        const filteredData = data.filter((item: OfflineData) => item.entityType !== entityType);
        await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(filteredData));
      } else {
        await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      }
    } catch (error) {
      console.error('Failed to clear local offline data:', error);
      throw error;
    }
  },

  // Son sync zamanını kaydet
  setLastSyncTime: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to set last sync time:', error);
    }
  },

  // Son sync zamanını getir
  getLastSyncTime: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(LAST_SYNC_KEY);
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  },

  // Sync queue'yu server'a gönder
  syncToServer: async (): Promise<SyncResult> => {
    try {
      const queue = await offlineSyncService.getLocalSyncQueue();
      
      if (queue.length === 0) {
        return { processed: 0, successful: 0, failed: 0, errors: [] };
      }

      const results: SyncResult = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const item of queue) {
        try {
          await api.post<ApiResponse>('/offline-sync/queue', {
            entityType: item.entityType,
            entityId: item.entityId,
            operation: item.operation,
            data: item.data
          });
          
          results.successful++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${item.entityType}:${item.entityId} - ${error.message}`);
        }
        
        results.processed++;
      }

      // Başarılı sync'lerden sonra local queue'yu temizle
      if (results.successful > 0) {
        await offlineSyncService.clearLocalSyncQueue();
        await offlineSyncService.setLastSyncTime();
      }

      return results;
    } catch (error) {
      console.error('Failed to sync to server:', error);
      throw error;
    }
  },

  // Server'dan sync queue'yu getir
  getServerSyncQueue: async (filters?: {
    status?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ syncQueue: OfflineSync[]; pagination: any }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `/offline-sync/queue${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<{ syncQueue: OfflineSync[]; pagination: any }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sync queue');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sync queue');
    }
  },

  // Server'da sync queue'yu işle
  processServerSyncQueue: async (): Promise<SyncResult> => {
    try {
      const response = await api.post<ApiResponse<SyncResult>>('/offline-sync/process');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to process sync queue');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process sync queue');
    }
  },

  // Server'dan offline data'yı getir
  getServerOfflineData: async (filters?: {
    entityType?: string;
    entityId?: string;
    lastSyncedAfter?: string;
  }): Promise<OfflineData[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.entityType) params.append('entityType', filters.entityType);
      if (filters?.entityId) params.append('entityId', filters.entityId);
      if (filters?.lastSyncedAfter) params.append('lastSyncedAfter', filters.lastSyncedAfter);

      const url = `/offline-sync/data${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<OfflineData[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch offline data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch offline data');
    }
  },

  // Server'da offline data'yı güncelle
  updateServerOfflineData: async (params: UpdateOfflineDataRequest): Promise<OfflineData> => {
    try {
      const response = await api.put<ApiResponse<OfflineData>>('/offline-sync/data', params);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update offline data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update offline data');
    }
  },

  // Sync durumunu getir
  getSyncStatus: async (): Promise<SyncStatus> => {
    try {
      const response = await api.get<ApiResponse<SyncStatus>>('/offline-sync/status');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sync status');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sync status');
    }
  },

  // Server'da sync queue'yu temizle
  clearServerSyncQueue: async (status?: string): Promise<{ deletedCount: number }> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const url = `/offline-sync/queue${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.delete<ApiResponse<{ deletedCount: number }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to clear sync queue');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear sync queue');
    }
  },

  // Server'da offline data'yı temizle
  clearServerOfflineData: async (entityType?: string): Promise<{ deletedCount: number }> => {
    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);

      const url = `/offline-sync/data${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.delete<ApiResponse<{ deletedCount: number }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to clear offline data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear offline data');
    }
  },

  // Network bağlantısını kontrol et
  checkNetworkConnection: async (): Promise<boolean> => {
    try {
      // Basit bir network kontrolü
      await api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Otomatik sync işlemi
  autoSync: async (): Promise<SyncResult> => {
    try {
      const isOnline = await offlineSyncService.checkNetworkConnection();
      
      if (!isOnline) {
        return { processed: 0, successful: 0, failed: 0, errors: ['No network connection'] };
      }

      // Local queue'yu server'a gönder
      const localSyncResult = await offlineSyncService.syncToServer();
      
      // Server queue'yu işle
      const serverSyncResult = await offlineSyncService.processServerSyncQueue();
      
      return {
        processed: localSyncResult.processed + serverSyncResult.processed,
        successful: localSyncResult.successful + serverSyncResult.successful,
        failed: localSyncResult.failed + serverSyncResult.failed,
        errors: [...localSyncResult.errors, ...serverSyncResult.errors]
      };
    } catch (error) {
      console.error('Auto sync failed:', error);
      throw error;
    }
  },

  // Utility functions
  getEntityTypeLabel: (entityType: string): string => {
    const labels: Record<string, string> = {
      'GOAL': 'Hedef',
      'SPRINT': 'Sprint',
      'TASK': 'Görev',
      'TIME_ENTRY': 'Zaman Kaydı',
      'LEAVE_REQUEST': 'İzin Talebi'
    };
    return labels[entityType] || entityType;
  },

  getOperationLabel: (operation: string): string => {
    const labels: Record<string, string> = {
      'CREATE': 'Oluştur',
      'UPDATE': 'Güncelle',
      'DELETE': 'Sil'
    };
    return labels[operation] || operation;
  },

  getStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      'PENDING': 'Beklemede',
      'SYNCED': 'Senkronize',
      'FAILED': 'Başarısız'
    };
    return labels[status] || status;
  },

  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'PENDING': '#FF9800',
      'SYNCED': '#4CAF50',
      'FAILED': '#F44336'
    };
    return colors[status] || '#666';
  }
}; 