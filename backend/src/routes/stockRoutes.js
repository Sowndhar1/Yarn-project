import express from 'express';
import {
  getAllStock,
  getProductStock,
  updateStock,
  getStockMovements,
  getLowStockAlerts,
  getStockSummary
} from '../controllers/stockController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, allowRoles('admin', 'staff'));

// GET /api/stock - Get all stock records
router.get('/', getAllStock);

// GET /api/stock/summary - Get stock summary for dashboard
router.get('/summary', getStockSummary);

// GET /api/stock/alerts - Get low stock alerts
router.get('/alerts', getLowStockAlerts);

// GET /api/stock/movements - Get stock movements history
router.get('/movements', getStockMovements);

// GET /api/stock/:productId - Get stock for specific product
router.get('/:productId', getProductStock);

// PUT /api/stock/:productId - Update stock quantity
router.put('/:productId', allowRoles('admin'), updateStock);

export default router;
