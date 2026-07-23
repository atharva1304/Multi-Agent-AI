import { Request, Response, NextFunction } from 'express';
import { supervisorAgent } from '../agents/supervisor';
import { conversationService } from '../services/conversation.service';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export async function handleChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();
  const { message, conversationId, userId } = req.body;

  try {
    // Create or get conversation
    let convId = conversationId;
    if (!convId) {
      const conversation = await conversationService.createConversation(
        userId,
        message.substring(0, 100)
      );
      convId = conversation.id;
    }

    // Save user message
    await conversationService.addMessage({
      conversationId: convId,
      role: 'user',
      content: message,
    });

    // Process through supervisor agent
    const result = await supervisorAgent.processQuery(message);

    if (!result.success) {
      // Save error response
      await conversationService.addMessage({
        conversationId: convId,
        role: 'assistant',
        content: result.error || 'Unable to process your request.',
        agentType: 'supervisor',
        confidenceScore: 0,
      });

      const duration = Date.now() - startTime;
      res.json({
        message: result.error || 'Unable to process your request.',
        conversationId: convId,
        agentResponse: null,
        formattedResponse: null,
        citations: [],
        confidenceScore: 0,
        processingTime: duration,
      });
      return;
    }

    // Save assistant response
    const assistantMessage = await conversationService.addMessage({
      conversationId: convId,
      role: 'assistant',
      content: result.formattedResponse?.summary || result.agentResponse?.summary || '',
      agentType: 'programming',
      citations: result.formattedResponse?.references || result.agentResponse?.references || [],
      confidenceScore: result.formattedResponse?.confidenceScore || result.agentResponse?.confidence || 0,
      metadata: {
        agentResponse: result.agentResponse,
        validationResult: result.validationResult,
        formattedResponse: result.formattedResponse,
        analysis: result.analysis,
      },
    });

    // Log agent activity
    await conversationService.logAgentActivity({
      userId,
      agentType: 'supervisor',
      query: message,
      response: JSON.stringify(result.agentResponse),
      confidence: result.agentResponse?.confidence || null,
      processingTime: Date.now() - startTime,
      status: 'completed',
      metadata: {
        domain: result.analysis.domain,
        handoff: result.analysis.handoff,
      },
    });

    const duration = Date.now() - startTime;
    logger.info('Chat processed', {
      conversationId: convId,
      duration: `${duration}ms`,
      success: result.success,
    });

    res.json({
      message: assistantMessage.content,
      conversationId: convId,
      agentResponse: result.agentResponse,
      formattedResponse: result.formattedResponse,
      citations: result.formattedResponse?.references || result.agentResponse?.references || [],
      confidenceScore: result.formattedResponse?.confidenceScore || result.agentResponse?.confidence || 0,
      processingTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Chat handler error', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

export async function handleProgrammingAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  const startTime = Date.now();
  const { query, context, userId } = req.body;

  try {
    const result = await supervisorAgent.processQuery(query, context);

    if (!result.success) {
      res.status(400).json({
        error: result.error,
        code: 'AGENT_ERROR',
        statusCode: 400,
      });
      return;
    }

    const duration = Date.now() - startTime;
    logger.info('Programming agent request completed', {
      duration: `${duration}ms`,
      confidence: result.agentResponse?.confidence,
    });

    res.json({
      agentResponse: result.agentResponse,
      validationResult: result.validationResult,
      formattedResponse: result.formattedResponse,
      processingTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Programming agent handler error', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId || 'dev-user';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversations = await conversationService.getUserConversations(userId, limit, offset);

    res.json({
      conversations,
      total: conversations.length,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Get history error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId || 'dev-user';
    const { id } = req.params;

    const conversation = await conversationService.getConversation(id, userId);

    res.json({ conversation });
  } catch (error) {
    logger.error('Get conversation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
}