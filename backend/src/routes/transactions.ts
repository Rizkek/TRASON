import { Router } from 'express';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// GET /api/v1/transactions
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Transaction list endpoint' });
});

// POST /api/v1/transactions
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create transaction endpoint' });
});

// GET /api/v1/transactions/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get transaction endpoint' });
});

// PUT /api/v1/transactions/:id
router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update transaction endpoint' });
});

// DELETE /api/v1/transactions/:id
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Delete transaction endpoint' });
});

// GET /api/v1/transactions/analytics/spending
router.get('/analytics/spending', (req, res) => {
  res.json({ success: true, message: 'Spending analytics endpoint' });
});

export default router;
