import { createLogger, format, transports, Logger } from 'winston';

// Custom format for structured logging
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger: Logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'tripweaver-api' },
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    }),
    // File transport for production logs
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ]
});

// Performance tracking utilities
export class PerformanceTracker {
  private startTime: number;
  private operation: string;
  private metadata: Record<string, any>;

  constructor(operation: string, metadata: Record<string, any> = {}) {
    this.startTime = Date.now();
    this.operation = operation;
    this.metadata = metadata;
    logger.debug(`Starting operation: ${operation}`, metadata);
  }

  end(success: boolean = true, additionalMetadata: Record<string, any> = {}): number {
    const duration = Date.now() - this.startTime;
    const level = success ? 'info' : 'error';
    
    logger.log(level, `Operation completed: ${this.operation}`, {
      ...this.metadata,
      ...additionalMetadata,
      duration_ms: duration,
      success
    });

    return duration;
  }

  logProgress(message: string, metadata: Record<string, any> = {}): void {
    const elapsed = Date.now() - this.startTime;
    logger.debug(`Progress: ${this.operation} - ${message}`, {
      ...this.metadata,
      ...metadata,
      elapsed_ms: elapsed
    });
  }
}

// API request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const { method, url, headers } = req;

  logger.info('API Request', {
    method,
    url,
    userAgent: headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    logger.info('API Response', {
      method,
      url,
      statusCode,
      duration_ms: duration
    });
  });

  next();
};

// Error logging utility
export const logError = (error: Error, context: Record<string, any> = {}) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

// Cache logging utilities
export const logCacheHit = (key: string, operation: string) => {
  logger.debug('Cache Hit', { key, operation });
};

export const logCacheMiss = (key: string, operation: string) => {
  logger.debug('Cache Miss', { key, operation });
};

export const logCacheSet = (key: string, operation: string, ttl?: number) => {
  logger.debug('Cache Set', { key, operation, ttl });
};

// API call logging utilities
export const logApiCall = (service: string, endpoint: string, duration: number, success: boolean, metadata: Record<string, any> = {}) => {
  const level = success ? 'info' : 'error';
  logger.log(level, 'External API Call', {
    service,
    endpoint,
    duration_ms: duration,
    success,
    ...metadata
  });
};

// ML model logging utilities
export const logModelTraining = (modelType: string, duration: number, dataSize: number, metadata: Record<string, any> = {}) => {
  logger.info('Model Training', {
    modelType,
    duration_ms: duration,
    dataSize,
    ...metadata
  });
};

export const logModelPrediction = (modelType: string, duration: number, inputSize: number, metadata: Record<string, any> = {}) => {
  logger.debug('Model Prediction', {
    modelType,
    duration_ms: duration,
    inputSize,
    ...metadata
  });
};

// User feedback logging utilities
export const logUserFeedback = (userId: string, action: string, itemId: string, metadata: Record<string, any> = {}) => {
  logger.info('User Feedback', {
    userId,
    action,
    itemId,
    ...metadata
  });
};

export const logProfileUpdate = (userId: string, changes: Record<string, any>, metadata: Record<string, any> = {}) => {
  logger.info('Profile Update', {
    userId,
    changes,
    ...metadata
  });
};

// Database operation logging utilities
export const logDbOperation = (operation: string, table: string, duration: number, success: boolean, metadata: Record<string, any> = {}) => {
  const level = success ? 'debug' : 'error';
  logger.log(level, 'Database Operation', {
    operation,
    table,
    duration_ms: duration,
    success,
    ...metadata
  });
};

// Export the main logger and utilities
export { logger };
export default logger;
