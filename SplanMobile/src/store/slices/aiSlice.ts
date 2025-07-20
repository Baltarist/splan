import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiService, AIMessage, AIConversation, ChatResponse } from '../../services/aiService';

// Async Thunks
export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async ({ message, conversationId }: { message: string; conversationId?: string }) => {
    const response = await aiService.chat(message, conversationId);
    return response;
  }
);

export const getGoalSuggestions = createAsyncThunk(
  'ai/getGoalSuggestions',
  async (context: string) => {
    const suggestions = await aiService.suggestGoals(context);
    return suggestions;
  }
);

export const getTaskSuggestions = createAsyncThunk(
  'ai/getTaskSuggestions',
  async (goalId: string) => {
    const suggestions = await aiService.suggestTasks(goalId);
    return suggestions;
  }
);

export const regenerateGoalScope = createAsyncThunk(
  'ai/regenerateGoalScope',
  async (goalId: string) => {
    const scope = await aiService.regenerateGoalScope(goalId);
    return scope;
  }
);

export const getConversationHistory = createAsyncThunk(
  'ai/getConversationHistory',
  async (conversationId: string) => {
    const messages = await aiService.getConversationHistory(conversationId);
    return { conversationId, messages };
  }
);

export const getUserConversations = createAsyncThunk(
  'ai/getUserConversations',
  async () => {
    const conversations = await aiService.getUserConversations();
    return conversations;
  }
);

// State Interface
interface AIState {
  // Chat
  currentConversationId: string | null;
  messages: AIMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  
  // Suggestions
  goalSuggestions: string[];
  taskSuggestions: string[];
  isSuggestionsLoading: boolean;
  suggestionsError: string | null;
  
  // Conversations
  conversations: AIConversation[];
  isConversationsLoading: boolean;
  conversationsError: string | null;
  
  // Goal Scope
  goalScope: string | null;
  isScopeLoading: boolean;
  scopeError: string | null;
}

// Initial State
const initialState: AIState = {
  currentConversationId: null,
  messages: [],
  isChatLoading: false,
  chatError: null,
  
  goalSuggestions: [],
  taskSuggestions: [],
  isSuggestionsLoading: false,
  suggestionsError: null,
  
  conversations: [],
  isConversationsLoading: false,
  conversationsError: null,
  
  goalScope: null,
  isScopeLoading: false,
  scopeError: null,
};

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Clear chat
    clearChat: (state) => {
      state.messages = [];
      state.currentConversationId = null;
      state.chatError = null;
    },
    
    // Add user message to chat
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'user',
        content: action.payload
      });
    },
    
    // Add AI message to chat
    addAIMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'assistant',
        content: action.payload
      });
    },
    
    // Set current conversation
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    
    // Clear suggestions
    clearSuggestions: (state) => {
      state.goalSuggestions = [];
      state.taskSuggestions = [];
      state.suggestionsError = null;
    },
    
    // Clear goal scope
    clearGoalScope: (state) => {
      state.goalScope = null;
      state.scopeError = null;
    },
    
    // Reset AI state
    resetAI: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Send Chat Message
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isChatLoading = true;
        state.chatError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
        state.isChatLoading = false;
        state.currentConversationId = action.payload.conversationId;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isChatLoading = false;
        state.chatError = action.error.message || 'Chat error occurred';
      });
    
    // Get Goal Suggestions
    builder
      .addCase(getGoalSuggestions.pending, (state) => {
        state.isSuggestionsLoading = true;
        state.suggestionsError = null;
      })
      .addCase(getGoalSuggestions.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isSuggestionsLoading = false;
        state.goalSuggestions = action.payload;
      })
      .addCase(getGoalSuggestions.rejected, (state, action) => {
        state.isSuggestionsLoading = false;
        state.suggestionsError = action.error.message || 'Suggestions error occurred';
      });
    
    // Get Task Suggestions
    builder
      .addCase(getTaskSuggestions.pending, (state) => {
        state.isSuggestionsLoading = true;
        state.suggestionsError = null;
      })
      .addCase(getTaskSuggestions.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isSuggestionsLoading = false;
        state.taskSuggestions = action.payload;
      })
      .addCase(getTaskSuggestions.rejected, (state, action) => {
        state.isSuggestionsLoading = false;
        state.suggestionsError = action.error.message || 'Suggestions error occurred';
      });
    
    // Regenerate Goal Scope
    builder
      .addCase(regenerateGoalScope.pending, (state) => {
        state.isScopeLoading = true;
        state.scopeError = null;
      })
      .addCase(regenerateGoalScope.fulfilled, (state, action: PayloadAction<string>) => {
        state.isScopeLoading = false;
        state.goalScope = action.payload;
      })
      .addCase(regenerateGoalScope.rejected, (state, action) => {
        state.isScopeLoading = false;
        state.scopeError = action.error.message || 'Scope regeneration error occurred';
      });
    
    // Get Conversation History
    builder
      .addCase(getConversationHistory.pending, (state) => {
        state.isChatLoading = true;
        state.chatError = null;
      })
      .addCase(getConversationHistory.fulfilled, (state, action: PayloadAction<{ conversationId: string; messages: AIMessage[] }>) => {
        state.isChatLoading = false;
        state.currentConversationId = action.payload.conversationId;
        state.messages = action.payload.messages;
      })
      .addCase(getConversationHistory.rejected, (state, action) => {
        state.isChatLoading = false;
        state.chatError = action.error.message || 'Conversation history error occurred';
      });
    
    // Get User Conversations
    builder
      .addCase(getUserConversations.pending, (state) => {
        state.isConversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(getUserConversations.fulfilled, (state, action: PayloadAction<AIConversation[]>) => {
        state.isConversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(getUserConversations.rejected, (state, action) => {
        state.isConversationsLoading = false;
        state.conversationsError = action.error.message || 'Conversations error occurred';
      });
  },
});

// Actions
export const {
  clearChat,
  addUserMessage,
  addAIMessage,
  setCurrentConversation,
  clearSuggestions,
  clearGoalScope,
  resetAI,
} = aiSlice.actions;

// Selectors
export const selectAI = (state: { ai: AIState }) => state.ai;
export const selectChatMessages = (state: { ai: AIState }) => state.ai.messages;
export const selectIsChatLoading = (state: { ai: AIState }) => state.ai.isChatLoading;
export const selectChatError = (state: { ai: AIState }) => state.ai.chatError;
export const selectGoalSuggestions = (state: { ai: AIState }) => state.ai.goalSuggestions;
export const selectTaskSuggestions = (state: { ai: AIState }) => state.ai.taskSuggestions;
export const selectIsSuggestionsLoading = (state: { ai: AIState }) => state.ai.isSuggestionsLoading;
export const selectConversations = (state: { ai: AIState }) => state.ai.conversations;
export const selectIsConversationsLoading = (state: { ai: AIState }) => state.ai.isConversationsLoading;
export const selectGoalScope = (state: { ai: AIState }) => state.ai.goalScope;
export const selectIsScopeLoading = (state: { ai: AIState }) => state.ai.isScopeLoading;

export default aiSlice.reducer; 