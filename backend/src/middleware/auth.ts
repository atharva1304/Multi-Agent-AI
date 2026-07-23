import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

/**
 * Simple API key authentication middleware.
 * In production, replace with Clerk middleware.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    // For development, allow requests with x-user-id header
    if (config.isDev) {
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        req.userId = userId;
        req.auth = { userId, sessionId: 'dev-session' };
        return next();
      }
    }

    // Check for Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // In production, verify with Clerk
      // For now, extract user ID from token or header
      const userId = req.headers['x-user-id'] as string;
      if (userId) {
        req.userId = userId;
        req.auth = { userId, sessionId: token.substring(0, 20) };
        return next();
      }
    }

    // Allow requests with x-api-key header
    const apiKey = req.headers['x-api-key'] as string;
    if (apiKey) {
      req.userId = 'api-user';
      req.auth = { userId: 'api-user', sessionId: 'api-session' };
      return next();
    }

    // For development, allow unauthenticated requests
    if (config.isDev) {
      req.userId = 'dev-user';
      req.auth = { userId: 'dev-user', sessionId: 'dev-session' };
      return next();
    }

    throw new UnauthorizedError('Authentication required');
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid authentication'));
    }
  }
}