import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { z } from 'zod';

// Schema for chat request
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
  conversationId: z.string().uuid().optional(),
  userId: z.string().min(1, 'User ID is required'),
});

// Schema for programming agent request
const agentProgrammingSchema = z.object({
  query: z.string().min(1, 'Query is required').max(10000, 'Query too long'),
  context: z.string().max(50000).optional(),
  userId: z.string().min(1, 'User ID is required'),
});

// Schema for conversation ID params
const conversationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid conversation ID format'),
});

export function validateChatRequest(req: Request, _res: Response, next: NextFunction): void {
  const result = chatRequestSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    next(new ValidationError(`Invalid request: ${errors}`));
    return;
  }

  // Set default userId from auth if not provided
  if (!result.data.userId && req.userId) {
    result.data.userId = req.userId;
  }

  req.body = result.data;
  next();
}

export function validateAgentProgrammingRequest(req: Request, _res: Response, next: NextFunction): void {
  const result = agentProgrammingSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    next(new ValidationError(`Invalid request: ${errors}`));
    return;
  }

  if (!result.data.userId && req.userId) {
    result.data.userId = req.userId;
  }

  req.body = result.data;
  next();
}

export function validateConversationId(req: Request, _res: Response, next: NextFunction): void {
  const result = conversationIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    next(new ValidationError('Invalid conversation ID format'));
    return;
  }

  next();
}