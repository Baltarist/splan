import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  dataExportImportService, 
  DataExport,
  DataImport,
  DataBackup,
  DataRestore,
  CreateBackupRequest,
  RestoreBackupRequest,
  ImportDataRequest,
  ExportDataRequest,
  ExportImportHistory
} from '../../services/dataExportImportService';

// Async Thunks
export const exportUserData = createAsyncThunk(
  'dataExportImport/exportUserData',
  async (params?: ExportDataRequest) => {
    const response = await dataExportImportService.exportUserData(params);
    return response;
  }
);

export const importUserData = createAsyncThunk(
  'dataExportImport/importUserData',
  async (params: ImportDataRequest) => {
    const response = await dataExportImportService.importUserData(params);
    return response;
  }
);

export const createBackup = createAsyncThunk(
  'dataExportImport/createBackup',
  async (params: CreateBackupRequest) => {
    const response = await dataExportImportService.createBackup(params);
    return response;
  }
);

export const fetchBackups = createAsyncThunk(
  'dataExportImport/fetchBackups',
  async () => {
    const response = await dataExportImportService.getBackups();
    return response;
  }
);

export const downloadBackup = createAsyncThunk(
  'dataExportImport/downloadBackup',
  async (backupId: string) => {
    const response = await dataExportImportService.downloadBackup(backupId);
    return { backupId, blob: response };
  }
);

export const restoreBackup = createAsyncThunk(
  'dataExportImport/restoreBackup',
  async ({ backupId, params }: { backupId: string; params?: RestoreBackupRequest }) => {
    const response = await dataExportImportService.restoreBackup(backupId, params);
    return response;
  }
);

export const fetchExportImportHistory = createAsyncThunk(
  'dataExportImport/fetchHistory',
  async () => {
    const response = await dataExportImportService.getExportImportHistory();
    return response;
  }
);

// State interface
interface DataExportImportState {
  exports: {
    data: DataExport[];
    loading: boolean;
    error: string | null;
  };
  imports: {
    data: DataImport[];
    loading: boolean;
    error: string | null;
  };
  backups: {
    data: DataBackup[];
    loading: boolean;
    error: string | null;
  };
  restores: {
    data: DataRestore[];
    loading: boolean;
    error: string | null;
  };
  history: {
    data: ExportImportHistory | null;
    loading: boolean;
    error: string | null;
  };
  exportData: {
    loading: boolean;
    error: string | null;
    blob: Blob | null;
  };
  importData: {
    loading: boolean;
    error: string | null;
  };
  createBackup: {
    loading: boolean;
    error: string | null;
  };
  downloadBackup: {
    loading: boolean;
    error: string | null;
  };
  restoreBackup: {
    loading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: DataExportImportState = {
  exports: {
    data: [],
    loading: false,
    error: null,
  },
  imports: {
    data: [],
    loading: false,
    error: null,
  },
  backups: {
    data: [],
    loading: false,
    error: null,
  },
  restores: {
    data: [],
    loading: false,
    error: null,
  },
  history: {
    data: null,
    loading: false,
    error: null,
  },
  exportData: {
    loading: false,
    error: null,
    blob: null,
  },
  importData: {
    loading: false,
    error: null,
  },
  createBackup: {
    loading: false,
    error: null,
  },
  downloadBackup: {
    loading: false,
    error: null,
  },
  restoreBackup: {
    loading: false,
    error: null,
  },
};

// Data Export/Import slice
const dataExportImportSlice = createSlice({
  name: 'dataExportImport',
  initialState,
  reducers: {
    clearDataExportImportError: (state, action: PayloadAction<keyof DataExportImportState>) => {
      state[action.payload].error = null;
    },
    clearAllDataExportImportErrors: (state) => {
      Object.keys(state).forEach((key) => {
        const dataExportImportKey = key as keyof DataExportImportState;
        state[dataExportImportKey].error = null;
      });
    },
    clearExportBlob: (state) => {
      state.exportData.blob = null;
    },
    addExport: (state, action: PayloadAction<DataExport>) => {
      state.exports.data.unshift(action.payload);
    },
    addImport: (state, action: PayloadAction<DataImport>) => {
      state.imports.data.unshift(action.payload);
    },
    addBackup: (state, action: PayloadAction<DataBackup>) => {
      state.backups.data.unshift(action.payload);
    },
    addRestore: (state, action: PayloadAction<DataRestore>) => {
      state.restores.data.unshift(action.payload);
    },
    updateBackup: (state, action: PayloadAction<DataBackup>) => {
      const index = state.backups.data.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.backups.data[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Export User Data
    builder
      .addCase(exportUserData.pending, (state) => {
        state.exportData.loading = true;
        state.exportData.error = null;
      })
      .addCase(exportUserData.fulfilled, (state, action) => {
        state.exportData.loading = false;
        state.exportData.blob = action.payload;
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.exportData.loading = false;
        state.exportData.error = action.error.message || 'Failed to export user data';
      });

    // Import User Data
    builder
      .addCase(importUserData.pending, (state) => {
        state.importData.loading = true;
        state.importData.error = null;
      })
      .addCase(importUserData.fulfilled, (state, action) => {
        state.importData.loading = false;
        // Import başarılı olduğunda history'yi yenile
        state.history.data = null;
      })
      .addCase(importUserData.rejected, (state, action) => {
        state.importData.loading = false;
        state.importData.error = action.error.message || 'Failed to import user data';
      });

    // Create Backup
    builder
      .addCase(createBackup.pending, (state) => {
        state.createBackup.loading = true;
        state.createBackup.error = null;
      })
      .addCase(createBackup.fulfilled, (state, action) => {
        state.createBackup.loading = false;
        // Backup oluşturulduğunda listeyi yenile
        state.backups.data = [];
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.createBackup.loading = false;
        state.createBackup.error = action.error.message || 'Failed to create backup';
      });

    // Fetch Backups
    builder
      .addCase(fetchBackups.pending, (state) => {
        state.backups.loading = true;
        state.backups.error = null;
      })
      .addCase(fetchBackups.fulfilled, (state, action) => {
        state.backups.loading = false;
        state.backups.data = action.payload;
      })
      .addCase(fetchBackups.rejected, (state, action) => {
        state.backups.loading = false;
        state.backups.error = action.error.message || 'Failed to fetch backups';
      });

    // Download Backup
    builder
      .addCase(downloadBackup.pending, (state) => {
        state.downloadBackup.loading = true;
        state.downloadBackup.error = null;
      })
      .addCase(downloadBackup.fulfilled, (state, action) => {
        state.downloadBackup.loading = false;
        // Download başarılı olduğunda blob'u kullan
        dataExportImportService.downloadBlob(action.payload.blob, `backup-${action.payload.backupId}.zip`);
      })
      .addCase(downloadBackup.rejected, (state, action) => {
        state.downloadBackup.loading = false;
        state.downloadBackup.error = action.error.message || 'Failed to download backup';
      });

    // Restore Backup
    builder
      .addCase(restoreBackup.pending, (state) => {
        state.restoreBackup.loading = true;
        state.restoreBackup.error = null;
      })
      .addCase(restoreBackup.fulfilled, (state, action) => {
        state.restoreBackup.loading = false;
        // Restore başarılı olduğunda history'yi yenile
        state.history.data = null;
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.restoreBackup.loading = false;
        state.restoreBackup.error = action.error.message || 'Failed to restore backup';
      });

    // Fetch Export/Import History
    builder
      .addCase(fetchExportImportHistory.pending, (state) => {
        state.history.loading = true;
        state.history.error = null;
      })
      .addCase(fetchExportImportHistory.fulfilled, (state, action) => {
        state.history.loading = false;
        state.history.data = action.payload;
        // History'den exports ve imports'ları güncelle
        state.exports.data = action.payload.exports;
        state.imports.data = action.payload.imports;
        state.restores.data = action.payload.restores;
      })
      .addCase(fetchExportImportHistory.rejected, (state, action) => {
        state.history.loading = false;
        state.history.error = action.error.message || 'Failed to fetch export/import history';
      });
  },
});

// Selectors
export const selectExports = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.exports;
export const selectImports = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.imports;
export const selectBackups = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.backups;
export const selectRestores = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.restores;
export const selectHistory = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.history;
export const selectExportData = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.exportData;
export const selectImportData = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.importData;
export const selectCreateBackup = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.createBackup;
export const selectDownloadBackup = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.downloadBackup;
export const selectRestoreBackup = (state: { dataExportImport: DataExportImportState }) => state.dataExportImport.restoreBackup;

// Actions
export const { 
  clearDataExportImportError, 
  clearAllDataExportImportErrors, 
  clearExportBlob,
  addExport, 
  addImport, 
  addBackup, 
  addRestore,
  updateBackup
} = dataExportImportSlice.actions;

export default dataExportImportSlice.reducer; 