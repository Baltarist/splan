import api, { ApiResponse, handleApiError } from './api';
import { AxiosError } from 'axios';

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  dueDate?: string;
  sprintId?: string;
  goalId?: string;
  dependencies: string;
  tags: string;
  notes?: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  sprintId?: string;
  goalId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  dueDate?: string;
  dependencies?: string;
  tags?: string;
  notes?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  sprintId?: string;
  goalId?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  dueDate?: string;
  dependencies?: string;
  tags?: string;
  notes?: string;
}

// Task Service
class TaskService {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<Task[]>>('/tasks');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch tasks');
    }
  }

  // Get task by ID
  async getTaskById(id: string): Promise<Task> {
    try {
      const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch task');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch task');
    }
  }

  // Get tasks by sprint ID
  async getTasksBySprint(sprintId: string): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<Task[]>>(`/sprints/${sprintId}/tasks`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sprint tasks');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch sprint tasks');
    }
  }

  // Get tasks by goal ID
  async getTasksByGoal(goalId: string): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse<Task[]>>(`/goals/${goalId}/tasks`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch goal tasks');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to fetch goal tasks');
    }
  }

  // Create task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create task');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to create task');
    }
  }

  // Update task
  async updateTask(id: string, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update task');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to update task');
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/tasks/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete task');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to delete task');
    }
  }

  // Update task status
  async updateTaskStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'): Promise<Task> {
    try {
      const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update task status');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to update task status');
    }
  }

  // Time tracking
  async timeTracking(taskId: string, startTime: string, endTime?: string, duration?: number, description?: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tasks/${taskId}/time-tracking`, {
        taskId,
        startTime,
        endTime,
        duration,
        description
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create time entry');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Failed to create time entry');
    }
  }
}

export default new TaskService(); 