import { Router } from 'express';
import { getAdminStats } from '../controllers/dashboardController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin/stats', authenticate, allowRoles('admin'), getAdminStats);

export default router;
