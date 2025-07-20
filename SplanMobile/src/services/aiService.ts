import api, { ApiResponse, handleApiError } from './api';
import { AxiosError } from 'axios';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context?: string | undefined;
  summary?: string | undefined;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export const aiService = {
  // AI ile sohbet
  async chat(message: string, conversationId?: string): Promise<ChatResponse> {
    try {
      const response = await api.post<ApiResponse<ChatResponse>>('/ai/chat', {
        message,
        conversationId
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'AI chat failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('AI servisi şu anda kullanılamıyor');
    }
  },

  // Hedef önerileri
  async suggestGoals(context: string): Promise<string[]> {
    try {
      const response = await api.post<ApiResponse<SuggestionsResponse>>('/ai/suggest-goals', {
        context
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.suggestions;
      } else {
        throw new Error(response.data.message || 'Goal suggestions failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Goal Suggestions Error:', handleApiError(error as AxiosError));
      }
      return [];
    }
  },

  // Görev önerileri
  async suggestTasks(goalId: string): Promise<string[]> {
    try {
      const response = await api.post<ApiResponse<SuggestionsResponse>>('/ai/suggest-tasks', {
        goalId
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.suggestions;
      } else {
        throw new Error(response.data.message || 'Task suggestions failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Task Suggestions Error:', handleApiError(error as AxiosError));
      }
      return [];
    }
  },

  // Hedef kapsamını yeniden oluştur
  async regenerateGoalScope(goalId: string): Promise<string> {
    try {
      const response = await api.post<ApiResponse<{ scope: string }>>(`/ai/regenerate-goal-scope/${goalId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.scope;
      } else {
        throw new Error(response.data.message || 'Goal scope regeneration failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(handleApiError(error as AxiosError));
      }
      throw new Error('Hedef kapsamı yeniden oluşturulamadı');
    }
  },

  // Sohbet geçmişini al
  async getConversationHistory(conversationId: string): Promise<AIMessage[]> {
    try {
      const response = await api.get<ApiResponse<{ messages: AIMessage[] }>>(`/ai/conversations/${conversationId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.messages;
      } else {
        throw new Error(response.data.message || 'Failed to get conversation history');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Get Conversation History Error:', handleApiError(error as AxiosError));
      }
      return [];
    }
  },

  // Kullanıcının sohbetlerini listele
  async getUserConversations(): Promise<AIConversation[]> {
    try {
      const response = await api.get<ApiResponse<{ conversations: AIConversation[] }>>('/ai/conversations');
      
      if (response.data.success && response.data.data) {
        return response.data.data.conversations;
      } else {
        throw new Error(response.data.message || 'Failed to get user conversations');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Get User Conversations Error:', handleApiError(error as AxiosError));
      }
      return [];
    }
  }
}; 