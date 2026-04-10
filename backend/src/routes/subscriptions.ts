import { Router } from 'express';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// POST /api/v1/subscriptions
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Subscribe to push notifications endpoint' });
});

// DELETE /api/v1/subscriptions/:id
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Unsubscribe from push notifications endpoint' });
});

// PUT /api/v1/subscriptions/preferences
router.put('/preferences', (req, res) => {
  res.json({ success: true, message: 'Update notification preferences endpoint' });
});

export default router;
