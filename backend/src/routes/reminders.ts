import { Router } from 'express';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

// All reminder routes require authentication
router.use(authenticate);

// GET /api/v1/reminders
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reminder list endpoint' });
});

// POST /api/v1/reminders
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create reminder endpoint' });
});

// GET /api/v1/reminders/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get reminder endpoint' });
});

// PUT /api/v1/reminders/:id
router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update reminder endpoint' });
});

// DELETE /api/v1/reminders/:id
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Delete reminder endpoint' });
});

// POST /api/v1/reminders/:id/mark-done
router.post('/:id/mark-done', (req, res) => {
  res.json({ success: true, message: 'Mark reminder done endpoint' });
});

// GET /api/v1/reminders/due
router.get('/due', (req, res) => {
  res.json({ success: true, message: 'Get due reminders endpoint' });
});

export default router;
