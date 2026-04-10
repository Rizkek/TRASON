import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.js';
import { AuthRequest, User } from '@/types/index.js';
import { UnauthorizedError } from '@/utils/errors.js';
import { prisma } from '@/config/database.js';
import { logger } from '@/utils/logger.js';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedError('No authorization header');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt,
    };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.warn('Authentication error', error);
      next(new UnauthorizedError('Invalid token'));
    }
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || typeof authHeader !== 'string') {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatarUrl: user.avatarUrl || undefined,
        createdAt: user.createdAt,
      };
      req.token = token;
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};
