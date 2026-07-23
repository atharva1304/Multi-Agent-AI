import { create } from 'zustand';
import type { Message, Conversation, FormattedResponse, ProgrammingAgentResponse, Reference } from '../types';
import { apiService } from '../services/api';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
  streamingContent: string;

  // Actions
  loadHistory: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  newConversation: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  isProcessing: false,
  error: null,
  streamingContent: '',

  loadHistory: async () => {
    try {
      const { conversations } = await apiService.getHistory();
      set({ conversations });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  loadConversation: async (id: string) => {
    try {
      set({ isProcessing: true });
      const { conversation } = await apiService.getConversation(id);
      set({
        currentConversationId: conversation.id,
        messages: conversation.messages,
        isProcessing: false,
      });
    } catch (error) {
      set({ error: 'Failed to load conversation', isProcessing: false });
    }
  },

  sendMessage: async (content: string) => {
    const currentId = get().currentConversationId;
    set({ isProcessing: true, error: null, streamingContent: '' });

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentId || '',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    try {
      const response = await apiService.chat(content, currentId || undefined);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: response.conversationId,
        role: 'assistant',
        content: response.message,
        citations: response.citations,
        confidenceScore: response.confidenceScore,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        currentConversationId: response.conversationId,
        messages: [...state.messages, assistantMessage],
        isProcessing: false,
        streamingContent: '',
      }));

      // Reload history to get updated list
      get().loadHistory();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send message',
        isProcessing: false,
      });
    }
  },

  newConversation: () => {
    set({
      currentConversationId: null,
      messages: [],
      error: null,
      streamingContent: '',
    });
  },

  clearError: () => set({ error: null }),
}));