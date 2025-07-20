import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  analyticsService, 
  DashboardData, 
  ProductivityData, 
  GoalAnalytics, 
  SprintAnalytics, 
  TaskAnalytics, 
  TimeTrackingData 
} from '../../services/analyticsService';

// Async Thunks
export const fetchDashboard = createAsyncThunk(
  'analytics/fetchDashboard',
  async () => {
    const response = await analyticsService.getDashboard();
    return response;
  }
);

export const fetchProductivityMetrics = createAsyncThunk(
  'analytics/fetchProductivityMetrics',
  async (period: number = 30) => {
    const response = await analyticsService.getProductivityMetrics(period);
    return response;
  }
);

export const fetchGoalAnalytics = createAsyncThunk(
  'analytics/fetchGoalAnalytics',
  async (goalId?: string) => {
    const response = await analyticsService.getGoalAnalytics(goalId);
    return response;
  }
);

export const fetchSprintAnalytics = createAsyncThunk(
  'analytics/fetchSprintAnalytics',
  async () => {
    const response = await analyticsService.getSprintAnalytics();
    return response;
  }
);

export const fetchTaskAnalytics = createAsyncThunk(
  'analytics/fetchTaskAnalytics',
  async (period: number = 30) => {
    const response = await analyticsService.getTaskAnalytics(period);
    return response;
  }
);

export const fetchTimeTracking = createAsyncThunk(
  'analytics/fetchTimeTracking',
  async (period: number = 7) => {
    const response = await analyticsService.getTimeTracking(period);
    return response;
  }
);

// State interface
interface AnalyticsState {
  dashboard: {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
  };
  productivity: {
    data: ProductivityData | null;
    loading: boolean;
    error: string | null;
  };
  goals: {
    data: GoalAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  sprints: {
    data: SprintAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  tasks: {
    data: TaskAnalytics | null;
    loading: boolean;
    error: string | null;
  };
  timeTracking: {
    data: TimeTrackingData | null;
    loading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: AnalyticsState = {
  dashboard: {
    data: null,
    loading: false,
    error: null,
  },
  productivity: {
    data: null,
    loading: false,
    error: null,
  },
  goals: {
    data: null,
    loading: false,
    error: null,
  },
  sprints: {
    data: null,
    loading: false,
    error: null,
  },
  tasks: {
    data: null,
    loading: false,
    error: null,
  },
  timeTracking: {
    data: null,
    loading: false,
    error: null,
  },
};

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state, action: PayloadAction<keyof AnalyticsState>) => {
      state[action.payload].error = null;
    },
    clearAllAnalyticsErrors: (state) => {
      Object.keys(state).forEach((key) => {
        const analyticsKey = key as keyof AnalyticsState;
        state[analyticsKey].error = null;
      });
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.error.message || 'Failed to fetch dashboard data';
      });

    // Productivity
    builder
      .addCase(fetchProductivityMetrics.pending, (state) => {
        state.productivity.loading = true;
        state.productivity.error = null;
      })
      .addCase(fetchProductivityMetrics.fulfilled, (state, action) => {
        state.productivity.loading = false;
        state.productivity.data = action.payload;
      })
      .addCase(fetchProductivityMetrics.rejected, (state, action) => {
        state.productivity.loading = false;
        state.productivity.error = action.error.message || 'Failed to fetch productivity metrics';
      });

    // Goals
    builder
      .addCase(fetchGoalAnalytics.pending, (state) => {
        state.goals.loading = true;
        state.goals.error = null;
      })
      .addCase(fetchGoalAnalytics.fulfilled, (state, action) => {
        state.goals.loading = false;
        state.goals.data = action.payload;
      })
      .addCase(fetchGoalAnalytics.rejected, (state, action) => {
        state.goals.loading = false;
        state.goals.error = action.error.message || 'Failed to fetch goal analytics';
      });

    // Sprints
    builder
      .addCase(fetchSprintAnalytics.pending, (state) => {
        state.sprints.loading = true;
        state.sprints.error = null;
      })
      .addCase(fetchSprintAnalytics.fulfilled, (state, action) => {
        state.sprints.loading = false;
        state.sprints.data = action.payload;
      })
      .addCase(fetchSprintAnalytics.rejected, (state, action) => {
        state.sprints.loading = false;
        state.sprints.error = action.error.message || 'Failed to fetch sprint analytics';
      });

    // Tasks
    builder
      .addCase(fetchTaskAnalytics.pending, (state) => {
        state.tasks.loading = true;
        state.tasks.error = null;
      })
      .addCase(fetchTaskAnalytics.fulfilled, (state, action) => {
        state.tasks.loading = false;
        state.tasks.data = action.payload;
      })
      .addCase(fetchTaskAnalytics.rejected, (state, action) => {
        state.tasks.loading = false;
        state.tasks.error = action.error.message || 'Failed to fetch task analytics';
      });

    // Time Tracking
    builder
      .addCase(fetchTimeTracking.pending, (state) => {
        state.timeTracking.loading = true;
        state.timeTracking.error = null;
      })
      .addCase(fetchTimeTracking.fulfilled, (state, action) => {
        state.timeTracking.loading = false;
        state.timeTracking.data = action.payload;
      })
      .addCase(fetchTimeTracking.rejected, (state, action) => {
        state.timeTracking.loading = false;
        state.timeTracking.error = action.error.message || 'Failed to fetch time tracking data';
      });
  },
});

// Selectors
export const selectDashboard = (state: { analytics: AnalyticsState }) => state.analytics.dashboard;
export const selectProductivity = (state: { analytics: AnalyticsState }) => state.analytics.productivity;
export const selectGoals = (state: { analytics: AnalyticsState }) => state.analytics.goals;
export const selectSprints = (state: { analytics: AnalyticsState }) => state.analytics.sprints;
export const selectTasks = (state: { analytics: AnalyticsState }) => state.analytics.tasks;
export const selectTimeTracking = (state: { analytics: AnalyticsState }) => state.analytics.timeTracking;

// Actions
export const { clearAnalyticsError, clearAllAnalyticsErrors } = analyticsSlice.actions;

export default analyticsSlice.reducer; 