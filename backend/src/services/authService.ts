import bcrypt from 'bcryptjs';
import { prisma } from '@/config/database.js';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.js';
import { validateEmail, validatePassword } from '@/utils/validate.js';
import { AppError, ValidationError, ConflictError } from '@/utils/errors.js';
import { User } from '@/types/index.js';

export class AuthService {
  static async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Validation
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default preferences
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
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email: string, password: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatarUrl: user.avatarUrl || undefined,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshAccessToken(userId: string, email: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = generateAccessToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });

    return {
      accessToken,
      refreshToken,
    };
  }

  static async getUserProfile(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt,
    };
  }

  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      bio?: string;
    }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt,
    };
  }

  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and number'
      );
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });
  }
}
