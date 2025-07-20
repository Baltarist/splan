import api, { ApiResponse } from './api';

export interface DashboardData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    totalSprints: number;
    completedSprints: number;
    activeSprints: number;
  };
  productivity: {
    score: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    efficiency: number;
  };
  trends: {
    weekly: Array<{
      week: string;
      completed: number;
      total: number;
    }>;
    taskCompletionRate: number;
    goalCompletionRate: number;
  };
  recentActivity: {
    lastCompletedTask: any;
    lastCompletedGoal: any;
    upcomingDeadlines: any[];
  };
}

export interface ProductivityData {
  period: string;
  dailyData: Array<{
    date: string;
    completed: number;
    hours: number;
    total: number;
  }>;
  categoryData: Array<{
    category: string;
    completed: number;
    total: number;
    hours: number;
    completionRate: number;
  }>;
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalHours: number;
    averageCompletionRate: number;
  };
}

export interface GoalAnalytics {
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    totalTasks: number;
    completedTasks: number;
    status: string;
    category: string;
    createdAt: string;
    targetDate: string;
  }>;
  summary: {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    averageProgress: number;
  };
}

export interface SprintAnalytics {
  sprints: Array<{
    id: string;
    title: string;
    progress: number;
    totalTasks: number;
    completedTasks: number;
    status: string;
    startDate: string;
    endDate: string;
    velocity: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    efficiency: number;
  }>;
  summary: {
    totalSprints: number;
    completedSprints: number;
    activeSprints: number;
    averageVelocity: number;
    averageEfficiency: number;
  };
}

export interface TaskAnalytics {
  period: string;
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    averageCompletionTime: number;
  };
  priorityData: Array<{
    priority: string;
    completed: number;
    total: number;
    hours: number;
    completionRate: number;
  }>;
  statusData: Array<{
    status: string;
    count: number;
    hours: number;
  }>;
  categoryData: Array<{
    category: string;
    completed: number;
    total: number;
    hours: number;
    completionRate: number;
  }>;
}

export interface TimeTrackingData {
  period: string;
  dailyData: Array<{
    date: string;
    hours: number;
    tasks: number;
  }>;
  weeklyData: Array<{
    week: string;
    hours: number;
    tasks: number;
  }>;
  summary: {
    totalHours: number;
    averageDailyHours: number;
    totalTasks: number;
    averageHoursPerTask: number;
  };
}

export const analyticsService = {
  // Ana dashboard verileri
  getDashboard: async (): Promise<DashboardData> => {
    try {
      const response = await api.get<ApiResponse<DashboardData>>('/analytics/dashboard');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Üretkenlik metrikleri
  getProductivityMetrics: async (period: number = 30): Promise<ProductivityData> => {
    try {
      const response = await api.get<ApiResponse<ProductivityData>>(`/analytics/productivity?period=${period}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch productivity metrics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch productivity metrics');
    }
  },

  // Hedef analitikleri
  getGoalAnalytics: async (goalId?: string): Promise<GoalAnalytics> => {
    try {
      const url = goalId ? `/analytics/goals/${goalId}` : '/analytics/goals';
      const response = await api.get<ApiResponse<GoalAnalytics>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch goal analytics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch goal analytics');
    }
  },

  // Sprint analitikleri
  getSprintAnalytics: async (): Promise<SprintAnalytics> => {
    try {
      const response = await api.get<ApiResponse<SprintAnalytics>>('/analytics/sprints');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch sprint analytics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sprint analytics');
    }
  },

  // Görev analitikleri
  getTaskAnalytics: async (period: number = 30): Promise<TaskAnalytics> => {
    try {
      const response = await api.get<ApiResponse<TaskAnalytics>>(`/analytics/tasks?period=${period}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch task analytics');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch task analytics');
    }
  },

  // Zaman takibi analitikleri
  getTimeTracking: async (period: number = 7): Promise<TimeTrackingData> => {
    try {
      const response = await api.get<ApiResponse<TimeTrackingData>>(`/analytics/time-tracking?period=${period}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch time tracking data');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch time tracking data');
    }
  }
}; 