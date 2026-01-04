import express from 'express';
import {
  listSales,
  getSale,
  createSale,
  updatePaymentStatus,
  getSalesSummary
} from '../controllers/salesController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, allowRoles('admin', 'staff'));

// GET /api/sales - Get all sales
router.get('/', listSales);

// GET /api/sales/summary - Get sales summary for dashboard
router.get('/summary', getSalesSummary);

// POST /api/sales - Create new sales entry
router.post('/', allowRoles('admin', 'staff'), createSale);

// GET /api/sales/:id - Get single sale
router.get('/:id', getSale);

// PATCH /api/sales/:id/payment - Update payment status
router.patch('/:id/payment', allowRoles('admin'), updatePaymentStatus);

export default router;
