import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import goalService, { Goal, CreateGoalRequest, UpdateGoalRequest } from '@/services/goalService';

interface GoalState {
  goals: Goal[];
  currentGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const goals = await goalService.getGoals();
      return goals;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch goals';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGoalById = createAsyncThunk(
  'goals/fetchGoalById',
  async (id: string, { rejectWithValue }) => {
    try {
      const goal = await goalService.getGoalById(id);
      return goal;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch goal';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData: CreateGoalRequest, { rejectWithValue }) => {
    try {
      const goal = await goalService.createGoal(goalData);
      return goal;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }: { id: string; goalData: UpdateGoalRequest }, { rejectWithValue }) => {
    try {
      const goal = await goalService.updateGoal(id, goalData);
      return goal;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      await goalService.deleteGoal(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGoalStatus = createAsyncThunk(
  'goals/updateGoalStatus',
  async ({ id, status }: { id: string; status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' }, { rejectWithValue }) => {
    try {
      const goal = await goalService.updateGoalStatus(id, status);
      return goal;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update goal status';
      return rejectWithValue(errorMessage);
    }
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGoal: (state, action) => {
      state.currentGoal = action.payload;
    },
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch goals
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
        state.error = null;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch goal by ID
    builder
      .addCase(fetchGoalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGoal = action.payload;
        state.error = null;
      })
      .addCase(fetchGoalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create goal
    builder
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals.push(action.payload);
        state.error = null;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update goal
    builder
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.currentGoal?.id === action.payload.id) {
          state.currentGoal = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete goal
    builder
      .addCase(deleteGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = state.goals.filter(goal => goal.id !== action.payload);
        if (state.currentGoal?.id === action.payload) {
          state.currentGoal = null;
        }
        state.error = null;
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update goal status
    builder
      .addCase(updateGoalStatus.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.currentGoal?.id === action.payload.id) {
          state.currentGoal = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentGoal, clearCurrentGoal } = goalSlice.actions;
export default goalSlice.reducer; 