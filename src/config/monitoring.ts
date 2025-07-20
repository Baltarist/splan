import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeConnections = new Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections',
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI API requests in seconds',
  labelNames: ['operation'],
  buckets: [1, 2, 5, 10, 30],
});

export const userSessions = new Gauge({
  name: 'active_user_sessions',
  help: 'Number of active user sessions',
});

// Metrics endpoint
export const getMetrics = async () => {
  return await register.metrics();
};

// Health check with detailed metrics
export const getHealthCheck = () => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  return health;
};

// Performance monitoring middleware
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const { method, path } = req;
    const statusCode = res.statusCode;
    
    httpRequestDuration
      .labels(method, path, statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(method, path, statusCode.toString())
      .inc();
  });
  
  next();
};

// Database monitoring
export const monitorDatabaseQuery = async (operation: string, table: string, queryFn: () => Promise<any>) => {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    
    databaseQueryDuration
      .labels(operation, table)
      .observe(duration);
    
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    
    databaseQueryDuration
      .labels(operation, table)
      .observe(duration);
    
    throw error;
  }
};

// AI monitoring
export const monitorAIRequest = async (operation: string, aiFn: () => Promise<any>) => {
  const start = Date.now();
  
  try {
    const result = await aiFn();
    const duration = (Date.now() - start) / 1000;
    
    aiRequestDuration
      .labels(operation)
      .observe(duration);
    
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    
    aiRequestDuration
      .labels(operation)
      .observe(duration);
    
    throw error;
  }
}; 