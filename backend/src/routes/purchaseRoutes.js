import express from 'express';
import {
  listPurchases,
  getPurchase,
  createPurchase,
  updatePaymentStatus,
  getPurchaseSummary
} from '../controllers/purchaseController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, allowRoles('admin', 'staff'));

// GET /api/purchases - Get all purchases
router.get('/', listPurchases);

// GET /api/purchases/summary - Get purchase summary for dashboard
router.get('/summary', getPurchaseSummary);

// POST /api/purchases - Create new purchase entry
router.post('/', allowRoles('admin', 'staff'), createPurchase);

// GET /api/purchases/:id - Get single purchase
router.get('/:id', getPurchase);

// PATCH /api/purchases/:id/payment - Update payment status
router.patch('/:id/payment', allowRoles('admin'), updatePaymentStatus);

export default router;
