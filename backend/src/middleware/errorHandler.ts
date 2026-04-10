import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';
import { ApiResponse } from '@/types/index.js';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred', error);

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
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(response);
};
