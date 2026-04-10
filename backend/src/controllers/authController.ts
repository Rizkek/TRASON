import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '@/types/index.js';
import { AuthService } from '@/services/authService.js';
import { logger } from '@/utils/logger.js';
import { AppError, ValidationError } from '@/utils/errors.js';

export const authController = {
  register: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await AuthService.register(email, password, firstName, lastName);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
      };

      logger.info(`User registered: ${email}`);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await AuthService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      };

      logger.info(`User logged in: ${email}`);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const result = await AuthService.refreshAccessToken(req.user.id, req.user.email);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await AuthService.getUserProfile(req.user.id);

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { firstName, lastName, avatarUrl, bio } = req.body;

      const user = await AuthService.updateProfile(req.user.id, {
        firstName,
        lastName,
        avatarUrl,
        bio,
      });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      };

      logger.info(`User profile updated: ${req.user.email}`);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new ValidationError('Old password and new password are required');
      }

      await AuthService.changePassword(req.user.id, oldPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      };

      logger.info(`User password changed: ${req.user.email}`);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      };

      logger.info(`User logged out: ${req.user?.email}`);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
