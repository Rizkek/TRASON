import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { logger } from '@/utils/logger.js';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';
import authRoutes from '@/routes/auth.js';
import transactionRoutes from '@/routes/transactions.js';
import activityRoutes from '@/routes/activities.js';
import reminderRoutes from '@/routes/reminders.js';
import subscriptionRoutes from '@/routes/subscriptions.js';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============ SECURITY MIDDLEWARE ============
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ============ RATE LIMITING ============
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// ============ LOGGING ============
app.use(morgan('combined'));

// ============ BODY PARSING ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============ HEALTH CHECK ============
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ API ROUTES ============
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// ============ 404 HANDLER ============
app.use(notFoundHandler);

// ============ ERROR HANDLING ============
app.use(errorHandler);

// ============ START SERVER ============
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}`);
});

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
