import api, { ApiResponse, handleApiError } from './api';
import { AxiosError } from 'axios';

// Types
export interface Sprint {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  goalId?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  goalId?: string;
  capacity?: number;
}

export interface UpdateSprintRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  goalId?: string;
  capacity?: number;
}

// Sprint Service
class SprintService {
  // Get all sprints
  async getSprints(): Promise<Sprint[]> {
    try {
      const response = await api.get<ApiResponse<Sprint[]>>('/sprints');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sprints');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch sprints');
    }
  }

  // Get sprint by ID
  async getSprintById(id: string): Promise<Sprint> {
    try {
      const response = await api.get<ApiResponse<Sprint>>(`/sprints/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sprint');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch sprint');
    }
  }

  // Get sprints by goal ID
  async getSprintsByGoal(goalId: string): Promise<Sprint[]> {
    try {
      const response = await api.get<ApiResponse<Sprint[]>>(`/goals/${goalId}/sprints`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch goal sprints');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch goal sprints');
    }
  }

  // Create sprint
  async createSprint(sprintData: CreateSprintRequest): Promise<Sprint> {
    try {
      const response = await api.post<ApiResponse<Sprint>>('/sprints', sprintData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create sprint');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to create sprint');
    }
  }

  // Update sprint
  async updateSprint(id: string, sprintData: UpdateSprintRequest): Promise<Sprint> {
    try {
      const response = await api.put<ApiResponse<Sprint>>(`/sprints/${id}`, sprintData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update sprint');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to update sprint');
    }
  }

  // Delete sprint
  async deleteSprint(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/sprints/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete sprint');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to delete sprint');
    }
  }

  // Update sprint status
  async updateSprintStatus(id: string, status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'): Promise<Sprint> {
    return this.updateSprint(id, { status });
  }
}

export default new SprintService(); 