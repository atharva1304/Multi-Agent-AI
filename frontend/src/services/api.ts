import type { ChatResponse, Conversation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': 'dev-user',
    };
  }

  async chat(message: string, conversationId?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversationId,
        userId: 'dev-user',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  async getHistory(): Promise<{ conversations: Conversation[] }> {
    const response = await fetch(`${this.baseUrl}/history`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  async getConversation(id: string): Promise<{ conversation: Conversation }> {
    const response = await fetch(`${this.baseUrl}/conversation/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  }

  async queryProgramming(query: string, context?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/agent/programming`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        query,
        context,
        userId: 'dev-user',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to query programming agent');
    }

    return response.json();
  }
}

export const apiService = new ApiService();