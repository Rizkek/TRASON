import { Router } from 'express';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// GET /api/v1/activities
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Activity list endpoint' });
});

// POST /api/v1/activities
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create activity endpoint' });
});

// GET /api/v1/activities/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get activity endpoint' });
});

// PUT /api/v1/activities/:id
router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update activity endpoint' });
});

// DELETE /api/v1/activities/:id
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Delete activity endpoint' });
});

// GET /api/v1/activities/:date
router.get('/:date', (req, res) => {
  res.json({ success: true, message: 'Get activities by date endpoint' });
});

export default router;
