import api, { ApiResponse, handleApiError } from './api';
import { AxiosError } from 'axios';

// Types
export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  targetDate?: string;
}

// Goal Service
class GoalService {
  // Get all goals
  async getGoals(): Promise<Goal[]> {
    try {
      const response = await api.get<ApiResponse<Goal[]>>('/goals');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch goals');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch goals');
    }
  }

  // Get goal by ID
  async getGoalById(id: string): Promise<Goal> {
    try {
      const response = await api.get<ApiResponse<Goal>>(`/goals/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch goal');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch goal');
    }
  }

  // Create goal
  async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    try {
      const response = await api.post<ApiResponse<Goal>>('/goals', goalData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create goal');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to create goal');
    }
  }

  // Update goal
  async updateGoal(id: string, goalData: UpdateGoalRequest): Promise<Goal> {
    try {
      const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, goalData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update goal');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to update goal');
    }
  }

  // Delete goal
  async deleteGoal(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/goals/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete goal');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to delete goal');
    }
  }

  // Update goal status
  async updateGoalStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'): Promise<Goal> {
    return this.updateGoal(id, { status });
  }
}

export default new GoalService(); 