import api, { ApiResponse } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'PUSH' | 'EMAIL' | 'IN_APP';
  title: string;
  message: string;
  category: 'TASK' | 'SPRINT' | 'GOAL' | 'LEAVE' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  type: 'PUSH' | 'EMAIL' | 'IN_APP';
  title: string;
  message: string;
  category: 'TASK' | 'SPRINT' | 'GOAL' | 'LEAVE' | 'SYSTEM';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  categories?: string;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesRequest {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  categories?: string[];
  frequency?: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'PUSH' | 'EMAIL' | 'IN_APP';
  category: 'TASK' | 'SPRINT' | 'GOAL' | 'LEAVE' | 'SYSTEM';
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
  variables?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationTemplateRequest {
  name: string;
  type: 'PUSH' | 'EMAIL' | 'IN_APP';
  category: 'TASK' | 'SPRINT' | 'GOAL' | 'LEAVE' | 'SYSTEM';
  titleTemplate: string;
  messageTemplate: string;
  variables?: string[];
}

export interface NotificationStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  unreadCount: number;
}

export interface NotificationPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const notificationService = {
  // Bildirim oluştur
  createNotification: async (notificationData: CreateNotificationRequest): Promise<Notification> => {
    try {
      const response = await api.post<ApiResponse<Notification>>('/notifications', notificationData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create notification');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  },

  // Bildirimleri listele
  getNotifications: async (filters?: {
    status?: string;
    category?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; pagination: NotificationPagination }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `/notifications${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<{ notifications: Notification[]; pagination: NotificationPagination }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async (): Promise<void> => {
    try {
      const response = await api.patch<ApiResponse>('/notifications/read-all');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark all notifications as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Bildirimi sil
  deleteNotification: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/notifications/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  // Bildirim tercihlerini getir
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification preferences');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
    }
  },

  // Bildirim tercihlerini güncelle
  updateNotificationPreferences: async (preferences: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> => {
    try {
      const response = await api.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', preferences);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update notification preferences');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  },

  // Bildirim şablonlarını listele
  getNotificationTemplates: async (filters?: {
    type?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const url = `/notifications/templates${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<NotificationTemplate[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification templates');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
    }
  },

  // Bildirim şablonu oluştur
  createNotificationTemplate: async (templateData: CreateNotificationTemplateRequest): Promise<NotificationTemplate> => {
    try {
      const response = await api.post<ApiResponse<NotificationTemplate>>('/notifications/templates', templateData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create notification template');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create notification template');
    }
  },

  // Bildirim istatistikleri
  getNotificationStatistics: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationStatistics> => {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const url = `/notifications/statistics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<NotificationStatistics>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification statistics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification statistics');
    }
  },

  // Utility functions
  getNotificationTypeLabel: (type: string): string => {
    const labels: Record<string, string> = {
      'PUSH': 'Push Bildirimi',
      'EMAIL': 'E-posta',
      'IN_APP': 'Uygulama İçi'
    };
    return labels[type] || type;
  },

  getNotificationCategoryLabel: (category: string): string => {
    const labels: Record<string, string> = {
      'TASK': 'Görev',
      'SPRINT': 'Sprint',
      'GOAL': 'Hedef',
      'LEAVE': 'İzin',
      'SYSTEM': 'Sistem'
    };
    return labels[category] || category;
  },

  getNotificationPriorityLabel: (priority: string): string => {
    const labels: Record<string, string> = {
      'LOW': 'Düşük',
      'MEDIUM': 'Orta',
      'HIGH': 'Yüksek',
      'URGENT': 'Acil'
    };
    return labels[priority] || priority;
  },

  getNotificationStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      'PENDING': 'Beklemede',
      'SENT': 'Gönderildi',
      'FAILED': 'Başarısız',
      'READ': 'Okundu'
    };
    return labels[status] || status;
  },

  getNotificationPriorityColor: (priority: string): string => {
    const colors: Record<string, string> = {
      'LOW': '#4CAF50',
      'MEDIUM': '#FF9800',
      'HIGH': '#F44336',
      'URGENT': '#9C27B0'
    };
    return colors[priority] || '#666';
  },

  getNotificationStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'PENDING': '#FF9800',
      'SENT': '#4CAF50',
      'FAILED': '#F44336',
      'READ': '#9E9E9E'
    };
    return colors[status] || '#666';
  },

  parseMetadata: (metadataString?: string): Record<string, any> | null => {
    if (!metadataString) return null;
    
    try {
      return JSON.parse(metadataString);
    } catch (error) {
      console.error('Failed to parse notification metadata:', error);
      return null;
    }
  },

  parseCategories: (categoriesString?: string): string[] => {
    if (!categoriesString) return [];
    
    try {
      return JSON.parse(categoriesString);
    } catch (error) {
      console.error('Failed to parse notification categories:', error);
      return [];
    }
  }
}; 