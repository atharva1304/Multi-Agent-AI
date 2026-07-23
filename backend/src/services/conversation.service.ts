import prisma from '../database';
import logger from '../utils/logger';
import { NotFoundError } from '../utils/errors';
import type { Conversation, Message, Reference } from '../types';

class ConversationService {
  async createConversation(userId: string, title: string = 'New Conversation'): Promise<Conversation> {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
        metadata: {},
      } as any,
      include: {
        messages: {
          include: {
            citations: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.transformConversation(conversation);
  }

  async getConversation(id: string, userId: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          include: {
            citations: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation', id);
    }

    return this.transformConversation(conversation);
  }

  async getUserConversations(userId: string, limit: number = 50, offset: number = 0): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          include: {
            citations: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return conversations.map((c) => this.transformConversation(c));
  }

  async addMessage(params: {
    conversationId: string;
    role: string;
    content: string;
    agentType?: string;
    citations?: Reference[];
    confidenceScore?: number;
    metadata?: Record<string, unknown>;
  }): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        role: params.role,
        content: params.content,
        agentType: params.agentType || null,
        confidenceScore: params.confidenceScore || null,
        metadata: (params.metadata || {}) as any,
        citations: params.citations
          ? {
              create: params.citations.map((c) => ({
                title: c.title,
                url: c.url,
                source: c.source,
                relevance: c.relevance,
              })),
            }
          : undefined,
      },
      include: {
        citations: true,
      },
    });

    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role as Message['role'],
      content: message.content,
      agentType: message.agentType as Message['agentType'],
      citations: ((message as any).citations || []).map((c: any) => ({
        title: c.title,
        url: c.url,
        source: c.source as Reference['source'],
        relevance: c.relevance,
      })),
      confidenceScore: message.confidenceScore,
      metadata: (message.metadata || {}) as Record<string, unknown>,
      createdAt: message.createdAt,
    };
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation', id);
    }

    await prisma.conversation.delete({
      where: { id },
    });

    logger.info('Conversation deleted', { conversationId: id });
  }

  async logAgentActivity(params: {
    userId: string;
    agentType: string;
    query: string;
    response: string;
    confidence: number | null;
    processingTime: number;
    status: string;
    error?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.agentLog.create({
      data: {
        userId: params.userId,
        agentType: params.agentType,
        query: params.query,
        response: params.response,
        confidence: params.confidence,
        processingTime: params.processingTime,
        status: params.status,
        error: params.error || null,
        metadata: (params.metadata || {}) as any,
      },
    });
  }

  private transformConversation(conversation: any): Conversation {
    return {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      messages: (conversation.messages || []).map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role,
        content: msg.content,
        agentType: msg.agentType,
        citations: (msg.citations || []).map((c: any) => ({
          title: c.title,
          url: c.url,
          source: c.source,
          relevance: c.relevance,
        })),
        confidenceScore: msg.confidenceScore,
        metadata: msg.metadata || {},
        createdAt: msg.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      metadata: conversation.metadata || {},
    };
  }
}

export const conversationService = new ConversationService();