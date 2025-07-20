import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  leaveManagementService, 
  LeaveRequest, 
  CreateLeaveRequestRequest,
  UpdateLeaveRequestRequest,
  UpdateLeaveRequestStatusRequest,
  LeaveStatistics 
} from '../../services/leaveManagementService';

// Async Thunks
export const fetchLeaveRequests = createAsyncThunk(
  'leaveManagement/fetchLeaveRequests',
  async (filters?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await leaveManagementService.getLeaveRequests(filters);
    return response;
  }
);

export const createLeaveRequest = createAsyncThunk(
  'leaveManagement/createLeaveRequest',
  async (leaveData: CreateLeaveRequestRequest) => {
    const response = await leaveManagementService.createLeaveRequest(leaveData);
    return response;
  }
);

export const updateLeaveRequest = createAsyncThunk(
  'leaveManagement/updateLeaveRequest',
  async ({ id, leaveData }: { id: string; leaveData: UpdateLeaveRequestRequest }) => {
    const response = await leaveManagementService.updateLeaveRequest(id, leaveData);
    return response;
  }
);

export const deleteLeaveRequest = createAsyncThunk(
  'leaveManagement/deleteLeaveRequest',
  async (id: string) => {
    await leaveManagementService.deleteLeaveRequest(id);
    return id;
  }
);

export const updateLeaveRequestStatus = createAsyncThunk(
  'leaveManagement/updateLeaveRequestStatus',
  async ({ id, statusData }: { id: string; statusData: UpdateLeaveRequestStatusRequest }) => {
    const response = await leaveManagementService.updateLeaveRequestStatus(id, statusData);
    return response;
  }
);

export const fetchLeaveStatistics = createAsyncThunk(
  'leaveManagement/fetchLeaveStatistics',
  async (year?: number) => {
    const response = await leaveManagementService.getLeaveStatistics(year);
    return response;
  }
);

// State interface
interface LeaveManagementState {
  leaveRequests: {
    data: LeaveRequest[];
    loading: boolean;
    error: string | null;
  };
  currentLeaveRequest: {
    data: LeaveRequest | null;
    loading: boolean;
    error: string | null;
  };
  statistics: {
    data: LeaveStatistics | null;
    loading: boolean;
    error: string | null;
  };
  createLeaveRequest: {
    loading: boolean;
    error: string | null;
  };
  updateLeaveRequest: {
    loading: boolean;
    error: string | null;
  };
  deleteLeaveRequest: {
    loading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: LeaveManagementState = {
  leaveRequests: {
    data: [],
    loading: false,
    error: null,
  },
  currentLeaveRequest: {
    data: null,
    loading: false,
    error: null,
  },
  statistics: {
    data: null,
    loading: false,
    error: null,
  },
  createLeaveRequest: {
    loading: false,
    error: null,
  },
  updateLeaveRequest: {
    loading: false,
    error: null,
  },
  deleteLeaveRequest: {
    loading: false,
    error: null,
  },
};

// Leave Management slice
const leaveManagementSlice = createSlice({
  name: 'leaveManagement',
  initialState,
  reducers: {
    clearLeaveManagementError: (state, action: PayloadAction<keyof LeaveManagementState>) => {
      state[action.payload].error = null;
    },
    clearAllLeaveManagementErrors: (state) => {
      Object.keys(state).forEach((key) => {
        const leaveKey = key as keyof LeaveManagementState;
        state[leaveKey].error = null;
      });
    },
    setCurrentLeaveRequest: (state, action: PayloadAction<LeaveRequest | null>) => {
      state.currentLeaveRequest.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Leave Requests
    builder
      .addCase(fetchLeaveRequests.pending, (state) => {
        state.leaveRequests.loading = true;
        state.leaveRequests.error = null;
      })
      .addCase(fetchLeaveRequests.fulfilled, (state, action) => {
        state.leaveRequests.loading = false;
        state.leaveRequests.data = action.payload;
      })
      .addCase(fetchLeaveRequests.rejected, (state, action) => {
        state.leaveRequests.loading = false;
        state.leaveRequests.error = action.error.message || 'Failed to fetch leave requests';
      });

    // Create Leave Request
    builder
      .addCase(createLeaveRequest.pending, (state) => {
        state.createLeaveRequest.loading = true;
        state.createLeaveRequest.error = null;
      })
      .addCase(createLeaveRequest.fulfilled, (state, action) => {
        state.createLeaveRequest.loading = false;
        state.leaveRequests.data.unshift(action.payload);
      })
      .addCase(createLeaveRequest.rejected, (state, action) => {
        state.createLeaveRequest.loading = false;
        state.createLeaveRequest.error = action.error.message || 'Failed to create leave request';
      });

    // Update Leave Request
    builder
      .addCase(updateLeaveRequest.pending, (state) => {
        state.updateLeaveRequest.loading = true;
        state.updateLeaveRequest.error = null;
      })
      .addCase(updateLeaveRequest.fulfilled, (state, action) => {
        state.updateLeaveRequest.loading = false;
        const index = state.leaveRequests.data.findIndex(lr => lr.id === action.payload.id);
        if (index !== -1) {
          state.leaveRequests.data[index] = action.payload;
        }
        if (state.currentLeaveRequest.data?.id === action.payload.id) {
          state.currentLeaveRequest.data = action.payload;
        }
      })
      .addCase(updateLeaveRequest.rejected, (state, action) => {
        state.updateLeaveRequest.loading = false;
        state.updateLeaveRequest.error = action.error.message || 'Failed to update leave request';
      });

    // Delete Leave Request
    builder
      .addCase(deleteLeaveRequest.pending, (state) => {
        state.deleteLeaveRequest.loading = true;
        state.deleteLeaveRequest.error = null;
      })
      .addCase(deleteLeaveRequest.fulfilled, (state, action) => {
        state.deleteLeaveRequest.loading = false;
        state.leaveRequests.data = state.leaveRequests.data.filter(lr => lr.id !== action.payload);
        if (state.currentLeaveRequest.data?.id === action.payload) {
          state.currentLeaveRequest.data = null;
        }
      })
      .addCase(deleteLeaveRequest.rejected, (state, action) => {
        state.deleteLeaveRequest.loading = false;
        state.deleteLeaveRequest.error = action.error.message || 'Failed to delete leave request';
      });

    // Update Leave Request Status
    builder
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        const index = state.leaveRequests.data.findIndex(lr => lr.id === action.payload.id);
        if (index !== -1) {
          state.leaveRequests.data[index] = action.payload;
        }
        if (state.currentLeaveRequest.data?.id === action.payload.id) {
          state.currentLeaveRequest.data = action.payload;
        }
      });

    // Fetch Leave Statistics
    builder
      .addCase(fetchLeaveStatistics.pending, (state) => {
        state.statistics.loading = true;
        state.statistics.error = null;
      })
      .addCase(fetchLeaveStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false;
        state.statistics.data = action.payload;
      })
      .addCase(fetchLeaveStatistics.rejected, (state, action) => {
        state.statistics.loading = false;
        state.statistics.error = action.error.message || 'Failed to fetch leave statistics';
      });
  },
});

// Selectors
export const selectLeaveRequests = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.leaveRequests;
export const selectCurrentLeaveRequest = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.currentLeaveRequest;
export const selectLeaveStatistics = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.statistics;
export const selectCreateLeaveRequest = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.createLeaveRequest;
export const selectUpdateLeaveRequest = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.updateLeaveRequest;
export const selectDeleteLeaveRequest = (state: { leaveManagement: LeaveManagementState }) => state.leaveManagement.deleteLeaveRequest;

// Actions
export const { 
  clearLeaveManagementError, 
  clearAllLeaveManagementErrors, 
  setCurrentLeaveRequest 
} = leaveManagementSlice.actions;

export default leaveManagementSlice.reducer; 