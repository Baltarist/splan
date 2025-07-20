import api, { ApiResponse } from './api';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  impactAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestRequest {
  type?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface UpdateLeaveRequestStatusRequest {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
}

export interface LeaveStatistics {
  year: number;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  byType: Record<string, number>;
  totalDays: number;
}

export interface LeaveImpactAnalysis {
  sprintImpact: 'High' | 'Medium' | 'Low';
  taskRisks: string[];
  timelineAdjustments: string[];
  recommendations: string[];
  overallImpact: 'High' | 'Medium' | 'Low';
}

export const leaveManagementService = {
  // İzin talebi oluştur
  createLeaveRequest: async (leaveData: CreateLeaveRequestRequest): Promise<LeaveRequest> => {
    try {
      const response = await api.post<ApiResponse<LeaveRequest>>('/leave-requests', leaveData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create leave request');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create leave request');
    }
  },

  // İzin taleplerini listele
  getLeaveRequests: async (filters?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<LeaveRequest[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const url = `/leave-requests${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<ApiResponse<LeaveRequest[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch leave requests');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  },

  // İzin talebi detayı
  getLeaveRequestById: async (id: string): Promise<LeaveRequest> => {
    try {
      const response = await api.get<ApiResponse<LeaveRequest>>(`/leave-requests/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch leave request');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave request');
    }
  },

  // İzin talebini güncelle
  updateLeaveRequest: async (id: string, leaveData: UpdateLeaveRequestRequest): Promise<LeaveRequest> => {
    try {
      const response = await api.put<ApiResponse<LeaveRequest>>(`/leave-requests/${id}`, leaveData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update leave request');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update leave request');
    }
  },

  // İzin talebini sil
  deleteLeaveRequest: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/leave-requests/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete leave request');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete leave request');
    }
  },

  // İzin talebi durumunu güncelle
  updateLeaveRequestStatus: async (id: string, statusData: UpdateLeaveRequestStatusRequest): Promise<LeaveRequest> => {
    try {
      const response = await api.patch<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/status`, statusData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update leave request status');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update leave request status');
    }
  },

  // İzin istatistikleri
  getLeaveStatistics: async (year?: number): Promise<LeaveStatistics> => {
    try {
      const params = year ? `?year=${year}` : '';
      const response = await api.get<ApiResponse<LeaveStatistics>>(`/leave-requests/statistics${params}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch leave statistics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave statistics');
    }
  },

  // İzin etkisi analizi parse et
  parseImpactAnalysis: (impactAnalysisString?: string): LeaveImpactAnalysis | null => {
    if (!impactAnalysisString) return null;
    
    try {
      return JSON.parse(impactAnalysisString);
    } catch (error) {
      console.error('Failed to parse impact analysis:', error);
      return null;
    }
  },

  // İzin türleri
  getLeaveTypes: (): string[] => {
    return [
      'ANNUAL_LEAVE',
      'SICK_LEAVE',
      'MATERNITY_LEAVE',
      'PATERNITY_LEAVE',
      'UNPAID_LEAVE',
      'COMPASSIONATE_LEAVE',
      'BEREAVEMENT_LEAVE',
      'OTHER'
    ];
  },

  // İzin türü etiketleri
  getLeaveTypeLabel: (type: string): string => {
    const labels: Record<string, string> = {
      'ANNUAL_LEAVE': 'Yıllık İzin',
      'SICK_LEAVE': 'Hastalık İzni',
      'MATERNITY_LEAVE': 'Doğum İzni',
      'PATERNITY_LEAVE': 'Babalar İzni',
      'UNPAID_LEAVE': 'Ücretsiz İzin',
      'COMPASSIONATE_LEAVE': 'Müşfik İzin',
      'BEREAVEMENT_LEAVE': 'Yas İzni',
      'OTHER': 'Diğer'
    };
    return labels[type] || type;
  },

  // İzin durumu etiketleri
  getStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      'PENDING': 'Beklemede',
      'APPROVED': 'Onaylandı',
      'REJECTED': 'Reddedildi',
      'CANCELLED': 'İptal Edildi'
    };
    return labels[status] || status;
  },

  // İzin durumu renkleri
  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      'PENDING': '#FF9800',
      'APPROVED': '#4CAF50',
      'REJECTED': '#F44336',
      'CANCELLED': '#9E9E9E'
    };
    return colors[status] || '#666';
  }
}; 