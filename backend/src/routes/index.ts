import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateChatRequest, validateAgentProgrammingRequest, validateConversationId } from '../middleware/validation';
import {
  handleChat,
  handleProgrammingAgent,
  getHistory,
  getConversation,
} from '../controllers/chat.controller';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Chat endpoint
router.post(
  '/chat',
  authMiddleware,
  validateChatRequest,
  handleChat
);

// Direct programming agent endpoint
router.post(
  '/agent/programming',
  authMiddleware,
  validateAgentProgrammingRequest,
  handleProgrammingAgent
);

// Get conversation history
router.get(
  '/history',
  authMiddleware,
  getHistory
);

// Get specific conversation
router.get(
  '/conversation/:id',
  authMiddleware,
  validateConversationId,
  getConversation
);

export default router;