import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  notificationService, 
  Notification, 
  CreateNotificationRequest,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  NotificationTemplate,
  CreateNotificationTemplateRequest,
  NotificationStatistics 
} from '../../services/notificationService';

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (filters?: {
    status?: string;
    category?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await notificationService.getNotifications(filters);
    return response;
  }
);

export const createNotification = createAsyncThunk(
  'notification/createNotification',
  async (notificationData: CreateNotificationRequest) => {
    const response = await notificationService.createNotification(notificationData);
    return response;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string) => {
    const response = await notificationService.markAsRead(id);
    return response;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async () => {
    await notificationService.markAllAsRead();
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string) => {
    await notificationService.deleteNotification(id);
    return id;
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notification/fetchPreferences',
  async () => {
    const response = await notificationService.getNotificationPreferences();
    return response;
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notification/updatePreferences',
  async (preferences: UpdateNotificationPreferencesRequest) => {
    const response = await notificationService.updateNotificationPreferences(preferences);
    return response;
  }
);

export const fetchNotificationTemplates = createAsyncThunk(
  'notification/fetchTemplates',
  async (filters?: {
    type?: string;
    category?: string;
    isActive?: boolean;
  }) => {
    const response = await notificationService.getNotificationTemplates(filters);
    return response;
  }
);

export const createNotificationTemplate = createAsyncThunk(
  'notification/createTemplate',
  async (templateData: CreateNotificationTemplateRequest) => {
    const response = await notificationService.createNotificationTemplate(templateData);
    return response;
  }
);

export const fetchNotificationStatistics = createAsyncThunk(
  'notification/fetchStatistics',
  async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await notificationService.getNotificationStatistics(filters);
    return response;
  }
);

// State interface
interface NotificationState {
  notifications: {
    data: Notification[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    } | null;
    loading: boolean;
    error: string | null;
  };
  preferences: {
    data: NotificationPreferences | null;
    loading: boolean;
    error: string | null;
  };
  templates: {
    data: NotificationTemplate[];
    loading: boolean;
    error: string | null;
  };
  statistics: {
    data: NotificationStatistics | null;
    loading: boolean;
    error: string | null;
  };
  createNotification: {
    loading: boolean;
    error: string | null;
  };
  createTemplate: {
    loading: boolean;
    error: string | null;
  };
  updatePreferences: {
    loading: boolean;
    error: string | null;
  };
}

// Initial state
const initialState: NotificationState = {
  notifications: {
    data: [],
    pagination: null,
    loading: false,
    error: null,
  },
  preferences: {
    data: null,
    loading: false,
    error: null,
  },
  templates: {
    data: [],
    loading: false,
    error: null,
  },
  statistics: {
    data: null,
    loading: false,
    error: null,
  },
  createNotification: {
    loading: false,
    error: null,
  },
  createTemplate: {
    loading: false,
    error: null,
  },
  updatePreferences: {
    loading: false,
    error: null,
  },
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearNotificationError: (state, action: PayloadAction<keyof NotificationState>) => {
      state[action.payload].error = null;
    },
    clearAllNotificationErrors: (state) => {
      Object.keys(state).forEach((key) => {
        const notificationKey = key as keyof NotificationState;
        state[notificationKey].error = null;
      });
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.data.unshift(action.payload);
      if (state.notifications.pagination) {
        state.notifications.pagination.total += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.data.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications.data[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notifications.loading = true;
        state.notifications.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications.loading = false;
        state.notifications.data = action.payload.notifications;
        state.notifications.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notifications.loading = false;
        state.notifications.error = action.error.message || 'Failed to fetch notifications';
      });

    // Create Notification
    builder
      .addCase(createNotification.pending, (state) => {
        state.createNotification.loading = true;
        state.createNotification.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.createNotification.loading = false;
        state.notifications.data.unshift(action.payload);
        if (state.notifications.pagination) {
          state.notifications.pagination.total += 1;
        }
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.createNotification.loading = false;
        state.createNotification.error = action.error.message || 'Failed to create notification';
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.data.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications.data[index] = action.payload;
        }
      });

    // Mark All as Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.data.forEach(notification => {
          if (notification.status !== 'READ') {
            notification.status = 'READ';
            notification.readAt = new Date().toISOString();
          }
        });
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications.data = state.notifications.data.filter(n => n.id !== action.payload);
        if (state.notifications.pagination) {
          state.notifications.pagination.total -= 1;
        }
      });

    // Fetch Preferences
    builder
      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.preferences.loading = true;
        state.preferences.error = null;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences.loading = false;
        state.preferences.data = action.payload;
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.preferences.loading = false;
        state.preferences.error = action.error.message || 'Failed to fetch preferences';
      });

    // Update Preferences
    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.updatePreferences.loading = true;
        state.updatePreferences.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.updatePreferences.loading = false;
        state.preferences.data = action.payload;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.updatePreferences.loading = false;
        state.updatePreferences.error = action.error.message || 'Failed to update preferences';
      });

    // Fetch Templates
    builder
      .addCase(fetchNotificationTemplates.pending, (state) => {
        state.templates.loading = true;
        state.templates.error = null;
      })
      .addCase(fetchNotificationTemplates.fulfilled, (state, action) => {
        state.templates.loading = false;
        state.templates.data = action.payload;
      })
      .addCase(fetchNotificationTemplates.rejected, (state, action) => {
        state.templates.loading = false;
        state.templates.error = action.error.message || 'Failed to fetch templates';
      });

    // Create Template
    builder
      .addCase(createNotificationTemplate.pending, (state) => {
        state.createTemplate.loading = true;
        state.createTemplate.error = null;
      })
      .addCase(createNotificationTemplate.fulfilled, (state, action) => {
        state.createTemplate.loading = false;
        state.templates.data.push(action.payload);
      })
      .addCase(createNotificationTemplate.rejected, (state, action) => {
        state.createTemplate.loading = false;
        state.createTemplate.error = action.error.message || 'Failed to create template';
      });

    // Fetch Statistics
    builder
      .addCase(fetchNotificationStatistics.pending, (state) => {
        state.statistics.loading = true;
        state.statistics.error = null;
      })
      .addCase(fetchNotificationStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false;
        state.statistics.data = action.payload;
      })
      .addCase(fetchNotificationStatistics.rejected, (state, action) => {
        state.statistics.loading = false;
        state.statistics.error = action.error.message || 'Failed to fetch statistics';
      });
  },
});

// Selectors
export const selectNotifications = (state: { notification: NotificationState }) => state.notification.notifications;
export const selectNotificationPreferences = (state: { notification: NotificationState }) => state.notification.preferences;
export const selectNotificationTemplates = (state: { notification: NotificationState }) => state.notification.templates;
export const selectNotificationStatistics = (state: { notification: NotificationState }) => state.notification.statistics;
export const selectCreateNotification = (state: { notification: NotificationState }) => state.notification.createNotification;
export const selectCreateTemplate = (state: { notification: NotificationState }) => state.notification.createTemplate;
export const selectUpdatePreferences = (state: { notification: NotificationState }) => state.notification.updatePreferences;

// Actions
export const { 
  clearNotificationError, 
  clearAllNotificationErrors, 
  addNotification, 
  updateNotification 
} = notificationSlice.actions;

export default notificationSlice.reducer; 