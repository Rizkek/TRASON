import { Router } from 'express';
import { authenticate } from '@/middleware/auth.js';
import { authController } from '@/controllers/authController.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.post('/refresh', authenticate, authController.refresh);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
