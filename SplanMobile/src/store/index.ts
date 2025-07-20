import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import goalReducer from './slices/goalSlice';
import sprintReducer from './slices/sprintSlice';
import taskReducer from './slices/taskSlice';
import aiReducer from './slices/aiSlice';
import analyticsReducer from './slices/analyticsSlice';
import leaveManagementReducer from './slices/leaveManagementSlice';
import notificationReducer from './slices/notificationSlice';
import dataExportImportReducer from './slices/dataExportImportSlice';
import offlineSyncReducer from './slices/offlineSyncSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalReducer,
    sprints: sprintReducer,
    tasks: taskReducer,
    ai: aiReducer,
    analytics: analyticsReducer,
    leaveManagement: leaveManagementReducer,
    notification: notificationReducer,
    dataExportImport: dataExportImportReducer,
    offlineSync: offlineSyncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 