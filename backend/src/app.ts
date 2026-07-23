import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import type { Server } from 'http';
import { config } from './config';
import { connectDatabase } from './database';
import { errorHandler } from './middleware/error-handler';
import router from './routes';
import logger from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.isDev ? '*' : process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT',
    statusCode: 429,
  },
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.isDev) {
  app.use(morgan('dev'));
}

// API routes
app.use('/api', router);

// Health check at root
app.get('/', (_req, res) => {
  res.json({
    name: 'Intelligent Multi-Agent System for Research Automation',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling (must be last)
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    const server: Server = app.listen(config.port, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.nodeEnv,
        apiUrl: `http://localhost:${config.port}/api`,
        healthUrl: `http://localhost:${config.port}/api/health`,
      });

      const portStr = String(config.port);
      console.log(`
╔══════════════════════════════════════════════════════╗
║  Intelligent Multi-Agent Research Automation        ║
║  Platform v1.0.0                                    ║
╠══════════════════════════════════════════════════════╣
║  Server:       http://localhost:${portStr}             ║
║  API:          http://localhost:${portStr}/api       ║
║  Health:       http://localhost:${portStr}/api/health║
║  Environment:  ${config.nodeEnv}                            ║
╚══════════════════════════════════════════════════════╝
      `);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use. Another backend instance is likely still running. Stop the existing process or change PORT in .env.`, {
          port: config.port,
          code: error.code,
        });
        process.exit(0);
      }

      logger.error('Server failed to start', {
        error: error.message,
        code: error.code,
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : 'Unknown reason',
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  const { disconnectDatabase } = await import('./database');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  const { disconnectDatabase } = await import('./database');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;