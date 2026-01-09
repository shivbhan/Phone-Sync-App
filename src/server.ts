import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhooks';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware to capture raw body for webhook verification
 * Shopify requires the raw body to verify HMAC signatures
 */
app.use('/webhooks', express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query
  });
  next();
});

/**
 * Root endpoint
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Shopify Phone Sync App',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/webhooks/health',
      webhook: '/webhooks/orders/create'
    }
  });
});

/**
 * Mount webhook routes
 */
app.use('/webhooks', webhookRoutes);

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

/**
 * Error handler
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  logger.success(`🚀 Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Store: ${process.env.SHOPIFY_STORE_URL}`);
  
  if (!process.env.SHOPIFY_ACCESS_TOKEN) {
    logger.warning('⚠️  SHOPIFY_ACCESS_TOKEN not set in environment variables');
  }
  
  if (!process.env.SHOPIFY_API_SECRET) {
    logger.warning('⚠️  SHOPIFY_API_SECRET not set in environment variables');
  }
});

export default app;
