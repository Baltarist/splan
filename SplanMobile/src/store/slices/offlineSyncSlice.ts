import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  offlineSyncService, 
  OfflineSync,
  OfflineData,
  SyncStatus,
  SyncQueueItem,
  SyncResult,
  AddToSyncQueueRequest,
  UpdateOfflineDataRequest
} from '../../services/offlineSyncService';

// Async Thunks
export const addToSyncQueue = createAsyncThunk(
  'offlineSync/addToSyncQueue',
  async (item: SyncQueueItem) => {
    await offlineSyncService.addToSyncQueue(item);
    return item;
  }
);

export const getLocalSyncQueue = createAsyncThunk(
  'offlineSync/getLocalSyncQueue',
  async () => {
    const queue = await offlineSyncService.getLocalSyncQueue();
    return queue;
  }
);

export const clearLocalSyncQueue = createAsyncThunk(
  'offlineSync/clearLocalSyncQueue',
  async () => {
    await offlineSyncService.clearLocalSyncQueue();
  }
);

export const saveOfflineData = createAsyncThunk(
  'offlineSync/saveOfflineData',
  async ({ entityType, entityId, data }: { entityType: string; entityId: string; data: any }) => {
    await offlineSyncService.saveOfflineData(entityType, entityId, data);
    return { entityType, entityId, data };
  }
);

export const getLocalOfflineData = createAsyncThunk(
  'offlineSync/getLocalOfflineData',
  async (entityType?: string) => {
    const data = await offlineSyncService.getLocalOfflineData(entityType);
    return { data, entityType };
  }
);

export const syncToServer = createAsyncThunk(
  'offlineSync/syncToServer',
  async () => {
    const result = await offlineSyncService.syncToServer();
    return result;
  }
);

export const getServerSyncQueue = createAsyncThunk(
  'offlineSync/getServerSyncQueue',
  async (filters?: {
    status?: string;
    entityType?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await offlineSyncService.getServerSyncQueue(filters);
    return response;
  }
);

export const processServerSyncQueue = createAsyncThunk(
  'offlineSync/processServerSyncQueue',
  async () => {
    const result = await offlineSyncService.processServerSyncQueue();
    return result;
  }
);

export const getServerOfflineData = createAsyncThunk(
  'offlineSync/getServerOfflineData',
  async (filters?: {
    entityType?: string;
    entityId?: string;
    lastSyncedAfter?: string;
  }) => {
    const data = await offlineSyncService.getServerOfflineData(filters);
    return data;
  }
);

export const updateServerOfflineData = createAsyncThunk(
  'offlineSync/updateServerOfflineData',
  async (params: UpdateOfflineDataRequest) => {
    const response = await offlineSyncService.updateServerOfflineData(params);
    return response;
  }
);

export const getSyncStatus = createAsyncThunk(
  'offlineSync/getSyncStatus',
  async () => {
    const status = await offlineSyncService.getSyncStatus();
    return status;
  }
);

export const autoSync = createAsyncThunk(
  'offlineSync/autoSync',
  async () => {
    const result = await offlineSyncService.autoSync();
    return result;
  }
);

export const checkNetworkConnection = createAsyncThunk(
  'offlineSync/checkNetworkConnection',
  async () => {
    const isOnline = await offlineSyncService.checkNetworkConnection();
    return isOnline;
  }
);

// State interface
interface OfflineSyncState {
  localSyncQueue: {
    data: SyncQueueItem[];
    loading: boolean;
    error: string | null;
  };
  serverSyncQueue: {
    data: OfflineSync[];
    pagination: any;
    loading: boolean;
    error: string | null;
  };
  localOfflineData: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  serverOfflineData: {
    data: OfflineData[];
    loading: boolean;
    error: string | null;
  };
  syncStatus: {
    data: SyncStatus | null;
    loading: boolean;
    error: string | null;
  };
  networkConnection: {
    isOnline: boolean;
    loading: boolean;
  };
  syncOperations: {
    syncToServer: {
      loading: boolean;
      error: string | null;
    };
    processServerQueue: {
      loading: boolean;
      error: string | null;
    };
    autoSync: {
      loading: boolean;
      error: string | null;
    };
  };
}

// Initial state
const initialState: OfflineSyncState = {
  localSyncQueue: {
    data: [],
    loading: false,
    error: null,
  },
  serverSyncQueue: {
    data: [],
    pagination: null,
    loading: false,
    error: null,
  },
  localOfflineData: {
    data: [],
    loading: false,
    error: null,
  },
  serverOfflineData: {
    data: [],
    loading: false,
    error: null,
  },
  syncStatus: {
    data: null,
    loading: false,
    error: null,
  },
  networkConnection: {
    isOnline: true,
    loading: false,
  },
  syncOperations: {
    syncToServer: {
      loading: false,
      error: null,
    },
    processServerQueue: {
      loading: false,
      error: null,
    },
    autoSync: {
      loading: false,
      error: null,
    },
  },
};

// Offline Sync slice
const offlineSyncSlice = createSlice({
  name: 'offlineSync',
  initialState,
  reducers: {
    clearOfflineSyncError: (state, action: PayloadAction<keyof OfflineSyncState>) => {
      const stateKey = state[action.payload] as any;
      if (stateKey && typeof stateKey === 'object' && 'error' in stateKey) {
        stateKey.error = null;
      }
    },
    clearAllOfflineSyncErrors: (state) => {
      Object.keys(state).forEach((key) => {
        const offlineSyncKey = key as keyof OfflineSyncState;
        const stateKey = state[offlineSyncKey] as any;
        if (stateKey && typeof stateKey === 'object' && 'error' in stateKey) {
          stateKey.error = null;
        }
      });
    },
    setNetworkStatus: (state, action: PayloadAction<boolean>) => {
      state.networkConnection.isOnline = action.payload;
    },
    addToLocalQueue: (state, action: PayloadAction<SyncQueueItem>) => {
      const existingIndex = state.localSyncQueue.data.findIndex(
        item => item.entityType === action.payload.entityType && item.entityId === action.payload.entityId
      );
      
      if (existingIndex !== -1) {
        state.localSyncQueue.data[existingIndex] = action.payload;
      } else {
        state.localSyncQueue.data.push(action.payload);
      }
    },
    removeFromLocalQueue: (state, action: PayloadAction<{ entityType: string; entityId: string }>) => {
      state.localSyncQueue.data = state.localSyncQueue.data.filter(
        item => !(item.entityType === action.payload.entityType && item.entityId === action.payload.entityId)
      );
    },
    updateLocalOfflineData: (state, action: PayloadAction<{ entityType: string; entityId: string; data: any }>) => {
      const existingIndex = state.localOfflineData.data.findIndex(
        item => item.entityType === action.payload.entityType && item.entityId === action.payload.entityId
      );
      
      if (existingIndex !== -1) {
        state.localOfflineData.data[existingIndex] = action.payload;
      } else {
        state.localOfflineData.data.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Add to Sync Queue
    builder
      .addCase(addToSyncQueue.pending, (state) => {
        state.localSyncQueue.loading = true;
        state.localSyncQueue.error = null;
      })
      .addCase(addToSyncQueue.fulfilled, (state, action) => {
        state.localSyncQueue.loading = false;
        // Queue'ya eklenen item zaten reducer'da ekleniyor
      })
      .addCase(addToSyncQueue.rejected, (state, action) => {
        state.localSyncQueue.loading = false;
        state.localSyncQueue.error = action.error.message || 'Failed to add to sync queue';
      });

    // Get Local Sync Queue
    builder
      .addCase(getLocalSyncQueue.pending, (state) => {
        state.localSyncQueue.loading = true;
        state.localSyncQueue.error = null;
      })
      .addCase(getLocalSyncQueue.fulfilled, (state, action) => {
        state.localSyncQueue.loading = false;
        state.localSyncQueue.data = action.payload;
      })
      .addCase(getLocalSyncQueue.rejected, (state, action) => {
        state.localSyncQueue.loading = false;
        state.localSyncQueue.error = action.error.message || 'Failed to get local sync queue';
      });

    // Clear Local Sync Queue
    builder
      .addCase(clearLocalSyncQueue.fulfilled, (state) => {
        state.localSyncQueue.data = [];
      });

    // Save Offline Data
    builder
      .addCase(saveOfflineData.fulfilled, (state, action) => {
        // Offline data zaten reducer'da güncelleniyor
      });

    // Get Local Offline Data
    builder
      .addCase(getLocalOfflineData.pending, (state) => {
        state.localOfflineData.loading = true;
        state.localOfflineData.error = null;
      })
      .addCase(getLocalOfflineData.fulfilled, (state, action) => {
        state.localOfflineData.loading = false;
        state.localOfflineData.data = action.payload.data;
      })
      .addCase(getLocalOfflineData.rejected, (state, action) => {
        state.localOfflineData.loading = false;
        state.localOfflineData.error = action.error.message || 'Failed to get local offline data';
      });

    // Sync to Server
    builder
      .addCase(syncToServer.pending, (state) => {
        state.syncOperations.syncToServer.loading = true;
        state.syncOperations.syncToServer.error = null;
      })
      .addCase(syncToServer.fulfilled, (state, action) => {
        state.syncOperations.syncToServer.loading = false;
        // Başarılı sync'den sonra local queue'yu temizle
        if (action.payload.successful > 0) {
          state.localSyncQueue.data = [];
        }
      })
      .addCase(syncToServer.rejected, (state, action) => {
        state.syncOperations.syncToServer.loading = false;
        state.syncOperations.syncToServer.error = action.error.message || 'Failed to sync to server';
      });

    // Get Server Sync Queue
    builder
      .addCase(getServerSyncQueue.pending, (state) => {
        state.serverSyncQueue.loading = true;
        state.serverSyncQueue.error = null;
      })
      .addCase(getServerSyncQueue.fulfilled, (state, action) => {
        state.serverSyncQueue.loading = false;
        state.serverSyncQueue.data = action.payload.syncQueue;
        state.serverSyncQueue.pagination = action.payload.pagination;
      })
      .addCase(getServerSyncQueue.rejected, (state, action) => {
        state.serverSyncQueue.loading = false;
        state.serverSyncQueue.error = action.error.message || 'Failed to get server sync queue';
      });

    // Process Server Sync Queue
    builder
      .addCase(processServerSyncQueue.pending, (state) => {
        state.syncOperations.processServerQueue.loading = true;
        state.syncOperations.processServerQueue.error = null;
      })
      .addCase(processServerSyncQueue.fulfilled, (state, action) => {
        state.syncOperations.processServerQueue.loading = false;
      })
      .addCase(processServerSyncQueue.rejected, (state, action) => {
        state.syncOperations.processServerQueue.loading = false;
        state.syncOperations.processServerQueue.error = action.error.message || 'Failed to process server sync queue';
      });

    // Get Server Offline Data
    builder
      .addCase(getServerOfflineData.pending, (state) => {
        state.serverOfflineData.loading = true;
        state.serverOfflineData.error = null;
      })
      .addCase(getServerOfflineData.fulfilled, (state, action) => {
        state.serverOfflineData.loading = false;
        state.serverOfflineData.data = action.payload;
      })
      .addCase(getServerOfflineData.rejected, (state, action) => {
        state.serverOfflineData.loading = false;
        state.serverOfflineData.error = action.error.message || 'Failed to get server offline data';
      });

    // Update Server Offline Data
    builder
      .addCase(updateServerOfflineData.fulfilled, (state, action) => {
        // Server offline data güncellendi
      });

    // Get Sync Status
    builder
      .addCase(getSyncStatus.pending, (state) => {
        state.syncStatus.loading = true;
        state.syncStatus.error = null;
      })
      .addCase(getSyncStatus.fulfilled, (state, action) => {
        state.syncStatus.loading = false;
        state.syncStatus.data = action.payload;
      })
      .addCase(getSyncStatus.rejected, (state, action) => {
        state.syncStatus.loading = false;
        state.syncStatus.error = action.error.message || 'Failed to get sync status';
      });

    // Auto Sync
    builder
      .addCase(autoSync.pending, (state) => {
        state.syncOperations.autoSync.loading = true;
        state.syncOperations.autoSync.error = null;
      })
      .addCase(autoSync.fulfilled, (state, action) => {
        state.syncOperations.autoSync.loading = false;
        // Auto sync sonuçlarına göre state'i güncelle
        if (action.payload.successful > 0) {
          state.localSyncQueue.data = [];
        }
      })
      .addCase(autoSync.rejected, (state, action) => {
        state.syncOperations.autoSync.loading = false;
        state.syncOperations.autoSync.error = action.error.message || 'Failed to auto sync';
      });

    // Check Network Connection
    builder
      .addCase(checkNetworkConnection.pending, (state) => {
        state.networkConnection.loading = true;
      })
      .addCase(checkNetworkConnection.fulfilled, (state, action) => {
        state.networkConnection.loading = false;
        state.networkConnection.isOnline = action.payload;
      })
      .addCase(checkNetworkConnection.rejected, (state) => {
        state.networkConnection.loading = false;
        state.networkConnection.isOnline = false;
      });
  },
});

// Selectors
export const selectLocalSyncQueue = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.localSyncQueue;
export const selectServerSyncQueue = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.serverSyncQueue;
export const selectLocalOfflineData = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.localOfflineData;
export const selectServerOfflineData = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.serverOfflineData;
export const selectSyncStatus = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.syncStatus;
export const selectNetworkConnection = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.networkConnection;
export const selectSyncOperations = (state: { offlineSync: OfflineSyncState }) => state.offlineSync.syncOperations;

// Actions
export const { 
  clearOfflineSyncError, 
  clearAllOfflineSyncErrors, 
  setNetworkStatus,
  addToLocalQueue, 
  removeFromLocalQueue,
  updateLocalOfflineData
} = offlineSyncSlice.actions;

export default offlineSyncSlice.reducer; 