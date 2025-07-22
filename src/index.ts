import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import goalRoutes from './routes/goals';
import sprintRoutes from './routes/sprints';
import taskRoutes from './routes/tasks';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import advancedAnalyticsRoutes from './routes/advancedAnalytics';
import userConfigurationRoutes from './routes/userConfigurationRoutes';
import leaveManagementRoutes from './routes/leaveManagement';
import notificationRoutes from './routes/notifications';
import dataExportImportRoutes from './routes/dataExportImport';
import offlineSyncRoutes from './routes/offlineSync';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env['PORT'] || 3000;
const API_VERSION = process.env['API_VERSION'] || 'v1';

// Security and compression middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3001',
  credentials: true,
}));

// Compression middleware for better performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: express.Request, res: express.Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiterMiddleware);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Splan API Documentation',
}));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'healthy' });
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/goals`, goalRoutes);
app.use(`/api/${API_VERSION}/sprints`, sprintRoutes);
app.use(`/api/${API_VERSION}/tasks`, taskRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/advanced-analytics`, advancedAnalyticsRoutes);
app.use(`/api/${API_VERSION}/user-configuration`, userConfigurationRoutes);
app.use(`/api/${API_VERSION}/leave-requests`, leaveManagementRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/data`, dataExportImportRoutes);
app.use(`/api/${API_VERSION}/offline-sync`, offlineSyncRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-room', (userId: string) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env['NODE_ENV']}`);
      logger.info(`API Version: ${API_VERSION}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Only start server if not in test environment
if (require.main === module) {
  startServer();
}

// Export app for testing
export { app }; 