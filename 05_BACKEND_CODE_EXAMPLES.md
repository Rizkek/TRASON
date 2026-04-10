# Backend Code Examples - Node.js + Express + Prisma

## 1. Setup & Project Structure

### 1.1 package.json
```json
{
  "name": "trason-backend",
  "version": "1.0.0",
  "description": "TRASON PWA Backend API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node-dev --respawn src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/**/*.ts --fix",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "bull": "^4.11.4",
    "redis": "^4.6.10",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "joi": "^17.11.0",
    "morgan": "^1.10.0",
    "firebase-admin": "^12.0.0",
    "nodemailer": "^6.9.7",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/jest": "^29.5.8",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

### 1.2 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 2. Core Application Files

### 2.1 src/app.ts - Express App Setup
```typescript
import express, { Application, Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ ROUTES ============
app.use('/api/v1', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ ERROR HANDLING ============
app.use(errorHandler);

// ============ START SERVER ============
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
```

### 2.2 src/types/index.ts - Shared Types
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface AuthRequest extends Express.Request {
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: Date;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueDate: Date;
  isRecurring: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
```

## 3. Authentication Module

### 3.1 src/utils/jwt.ts - JWT Utilities
```typescript
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
```

### 3.2 src/middleware/auth.ts - Auth Middleware
```typescript
import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { AuthRequest, User } from '@/types';
import { AppError } from '@/utils/errors';
import { prisma } from '@/config/database';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    // Add role checking logic here
    next();
  };
};
```

### 3.3 src/controllers/authController.ts - Auth Logic
```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { AppError } from '@/utils/errors';
import { validateEmail, validatePassword } from '@/utils/validate';
import { AuthRequest, ApiResponse } from '@/types';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!validateEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }
    if (!validatePassword(password)) {
      throw new AppError(
        'Password must be at least 8 characters with uppercase, lowercase, and number',
        400
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        preferences: {
          create: {
            currency: 'USD',
            language: 'en',
            timezone: 'UTC',
          },
        },
      },
      include: { preferences: true },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        accessToken,
        refreshToken,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
```

## 4. Transaction Module

### 4.1 src/services/transactionService.ts - Transaction Logic
```typescript
import { prisma } from '@/config/database';
import { Transaction, TransactionType } from '@/types';
import { AppError } from '@/utils/errors';
import { Decimal } from '@prisma/client/runtime/library';

export class TransactionService {
  static async createTransaction(
    userId: string,
    categoryId: string,
    data: {
      title: string;
      amount: number;
      type: TransactionType;
      date: Date;
      description?: string;
    }
  ): Promise<Transaction> {
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return prisma.transaction.create({
      data: {
        userId,
        categoryId,
        title: data.title,
        amount: new Decimal(data.amount),
        type: data.type,
        date: data.date,
        description: data.description,
      },
    }) as Promise<Transaction>;
  }

  static async getTransactions(
    userId: string,
    filters: {
      page: number;
      limit: number;
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      type?: TransactionType;
    }
  ) {
    const skip = (filters.page - 1) * filters.limit;

    const where: any = { userId, deletedAt: null };

    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: filters.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      page: filters.page,
      limit: filters.limit,
      pages: Math.ceil(total / filters.limit),
    };
  }

  static async getSpendingAnalytics(userId: string, month: Date) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const spendingByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    const categoriesData = await Promise.all(
      spendingByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          category: category?.name || 'Unknown',
          amount: item._sum.amount?.toNumber() || 0,
          count: item._count,
        };
      })
    );

    const totalSpend = categoriesData.reduce((sum, item) => sum + item.amount, 0);

    return {
      byCategory: categoriesData.map((item) => ({
        ...item,
        percentage: (item.amount / totalSpend) * 100,
      })),
      total: totalSpend,
      month,
    };
  }
}
```

### 4.2 src/routes/transactions.ts - Transaction Routes
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { transactionController } from '@/controllers/transactionController';
import Joi from 'joi';

const router = Router();

// Schema validation
const createTransactionSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  date: Joi.date().required(),
  description: Joi.string().optional(),
});

// Routes
router.post(
  '/',
  authenticate,
  validateRequest(createTransactionSchema),
  transactionController.create
);

router.get('/', authenticate, transactionController.list);
router.get('/:id', authenticate, transactionController.getById);
router.put('/:id', authenticate, transactionController.update);
router.delete('/:id', authenticate, transactionController.delete);

router.get('/analytics/spending', authenticate, transactionController.getAnalytics);

export default router;
```

## 5. Reminders & Background Jobs

### 5.1 src/config/queue.ts - Bull Queue Setup
```typescript
import Queue from 'bull';
import redis from './redis';
import { logger } from '@/utils/logger';

export const reminderQueue = new Queue('reminders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

export const insightQueue = new Queue('insights', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Process reminder jobs
reminderQueue.process(async (job) => {
  logger.info(`Processing reminder job: ${job.id}`);
  // Process reminder notification
  return { processed: true };
});

reminderQueue.on('failed', (job, err) => {
  logger.error(`Reminder job failed: ${job.id}`, err);
});

reminderQueue.on('completed', (job) => {
  logger.info(`Reminder job completed: ${job.id}`);
});
```

### 5.2 src/jobs/reminderJob.ts - Reminder Processing
```typescript
import { prisma } from '@/config/database';
import { reminderQueue, notificationQueue } from '@/config/queue';
import { logger } from '@/utils/logger';

export async function processScheduledReminders() {
  try {
    const now = new Date();

    // Find reminders that need to be processed
    const dueReminders = await prisma.reminder.findMany({
      where: {
        dueDateTime: {
          lte: now,
        },
        status: 'pending',
      },
      include: {
        user: true,
      },
    });

    logger.info(`Found ${dueReminders.length} due reminders`);

    // Queue notification jobs for each reminder
    for (const reminder of dueReminders) {
      await notificationQueue.add(
        {
          reminderId: reminder.id,
          userId: reminder.userId,
          title: reminder.title,
          description: reminder.description,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    }

    // Handle recurring reminders - create next occurrence
    const recurringReminders = dueReminders.filter((r) => r.isRecurring);
    for (const reminder of recurringReminders) {
      // Calculate next occurrence based on recurrence pattern
      const nextOccurrence = calculateNextOccurrence(reminder);
      
      if (nextOccurrence && nextOccurrence > now) {
        await prisma.reminderOccurrence.create({
          data: {
            reminderId: reminder.id,
            userId: reminder.userId,
            scheduledDatetime: nextOccurrence,
            status: 'pending',
          },
        });
      }
    }
  } catch (error) {
    logger.error('Error processing scheduled reminders', error);
  }
}

function calculateNextOccurrence(reminder: any): Date | null {
  // Simple daily recurrence example
  if (reminder.recurrencePattern === 'daily') {
    const next = new Date(reminder.dueDateTime);
    next.setDate(next.getDate() + 1);
    return next;
  }
  // Add more complex logic for weekly, monthly, custom patterns (RRULE)
  return null;
}

// Schedule this to run every minute
export function setupReminderScheduler() {
  setInterval(() => {
    processScheduledReminders();
  }, 60000); // Every minute
}
```

## 6. Error Handling

### 6.1 src/utils/errors.ts
```typescript
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}
```

### 6.2 src/middleware/errorHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', error);

  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    res.status(error.statusCode).json(response);
  } else {
    // Generic error
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
};
```

## 7. Complete Example: Reminder Controller

```typescript
// src/controllers/reminderController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '@/types';
import { prisma } from '@/config/database';
import { AppError } from '@/utils/errors';
import { reminderQueue } from '@/config/queue';

export const reminderController = {
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, dueDate, recurrencePattern, notifyBefore } = req.body;
      const userId = req.user!.id;

      const reminder = await prisma.reminder.create({
        data: {
          userId,
          title,
          description,
          dueDate: new Date(dueDate),
          isRecurring: !!recurrencePattern,
          recurrencePattern,
          notifyDaysBefore: notifyBefore,
          status: 'pending',
        },
      });

      // Schedule notification job if needed
      if (new Date(dueDate) > new Date()) {
        const delay = new Date(dueDate).getTime() - Date.now();
        await reminderQueue.add(
          { reminderId: reminder.id, userId },
          { delay }
        );
      }

      const response: ApiResponse = {
        success: true,
        data: reminder,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { status = 'pending' } = req.query;

      const reminders = await prisma.reminder.findMany({
        where: {
          userId,
          status: status as string,
        },
        orderBy: { dueDate: 'asc' },
      });

      const response: ApiResponse = {
        success: true,
        data: reminders,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  markDone: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const reminder = await prisma.reminder.update({
        where: { id },
        data: { status: 'completed', updatedAt: new Date() },
      });

      res.status(200).json({
        success: true,
        data: reminder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
};
```

This backend code provides a solid foundation for the TRASON PWA. Key features:
- JWT authentication with refresh tokens
- Transaction and reminder management
- Background job processing with Bull Queue
- Error handling
- Type-safe operations with Prisma

