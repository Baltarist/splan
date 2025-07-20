// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  
  // Goals
  GOALS: {
    LIST: '/goals',
    CREATE: '/goals',
    UPDATE: (id: string) => `/goals/${id}`,
    DELETE: (id: string) => `/goals/${id}`,
    GET: (id: string) => `/goals/${id}`,
  },
  
  // Sprints
  SPRINTS: {
    LIST: '/sprints',
    CREATE: '/sprints',
    UPDATE: (id: string) => `/sprints/${id}`,
    DELETE: (id: string) => `/sprints/${id}`,
    GET: (id: string) => `/sprints/${id}`,
  },
  
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    GET: (id: string) => `/tasks/${id}`,
  },
  
  // AI
  AI: {
    CHAT: '/ai/chat',
    SUGGEST_GOALS: '/ai/suggest-goals',
    SUGGEST_TASKS: '/ai/suggest-tasks',
    REGENERATE_GOAL_SCOPE: (goalId: string) => `/ai/regenerate-goal-scope/${goalId}`,
    CONVERSATIONS: '/ai/conversations',
    CONVERSATION_HISTORY: (conversationId: string) => `/ai/conversations/${conversationId}`,
  },
}; 