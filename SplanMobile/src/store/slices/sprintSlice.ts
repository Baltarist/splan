import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sprintService, { Sprint, CreateSprintRequest, UpdateSprintRequest } from '@/services/sprintService';

interface SprintState {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SprintState = {
  sprints: [],
  currentSprint: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSprints = createAsyncThunk(
  'sprints/fetchSprints',
  async (_, { rejectWithValue }) => {
    try {
      const sprints = await sprintService.getSprints();
      return sprints;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sprints';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSprintById = createAsyncThunk(
  'sprints/fetchSprintById',
  async (id: string, { rejectWithValue }) => {
    try {
      const sprint = await sprintService.getSprintById(id);
      return sprint;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sprint';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSprintsByGoal = createAsyncThunk(
  'sprints/fetchSprintsByGoal',
  async (goalId: string, { rejectWithValue }) => {
    try {
      const sprints = await sprintService.getSprintsByGoal(goalId);
      return sprints;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch goal sprints';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprints/createSprint',
  async (sprintData: CreateSprintRequest, { rejectWithValue }) => {
    try {
      const sprint = await sprintService.createSprint(sprintData);
      return sprint;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create sprint';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async ({ id, sprintData }: { id: string; sprintData: UpdateSprintRequest }, { rejectWithValue }) => {
    try {
      const sprint = await sprintService.updateSprint(id, sprintData);
      return sprint;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sprint';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteSprint = createAsyncThunk(
  'sprints/deleteSprint',
  async (id: string, { rejectWithValue }) => {
    try {
      await sprintService.deleteSprint(id);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete sprint';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSprintStatus = createAsyncThunk(
  'sprints/updateSprintStatus',
  async ({ id, status }: { id: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' }, { rejectWithValue }) => {
    try {
      const sprint = await sprintService.updateSprintStatus(id, status);
      return sprint;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update sprint status';
      return rejectWithValue(errorMessage);
    }
  }
);

const sprintSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSprint: (state, action) => {
      state.currentSprint = action.payload;
    },
    clearCurrentSprint: (state) => {
      state.currentSprint = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sprints
    builder
      .addCase(fetchSprints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = action.payload;
        state.error = null;
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sprint by ID
    builder
      .addCase(fetchSprintById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSprintById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSprint = action.payload;
        state.error = null;
      })
      .addCase(fetchSprintById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sprints by goal
    builder
      .addCase(fetchSprintsByGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSprintsByGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = action.payload;
        state.error = null;
      })
      .addCase(fetchSprintsByGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create sprint
    builder
      .addCase(createSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints.push(action.payload);
        state.error = null;
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update sprint
    builder
      .addCase(updateSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sprints.findIndex(sprint => sprint.id === action.payload.id);
        if (index !== -1) {
          state.sprints[index] = action.payload;
        }
        if (state.currentSprint?.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete sprint
    builder
      .addCase(deleteSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = state.sprints.filter(sprint => sprint.id !== action.payload);
        if (state.currentSprint?.id === action.payload) {
          state.currentSprint = null;
        }
        state.error = null;
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update sprint status
    builder
      .addCase(updateSprintStatus.fulfilled, (state, action) => {
        const index = state.sprints.findIndex(sprint => sprint.id === action.payload.id);
        if (index !== -1) {
          state.sprints[index] = action.payload;
        }
        if (state.currentSprint?.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentSprint, clearCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer; 