import { Router } from 'express';
import {
    initiateCheckout,
    placeOrder,
    processPayment,
    getOrderStatus,
    getCustomerOrders
} from '../controllers/checkoutController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All checkout routes require authentication
router.use(authenticate);

router.post('/initiate', initiateCheckout);
router.post('/place-order', placeOrder);
router.post('/payment', processPayment);
router.get('/orders', getCustomerOrders);
router.get('/order/:orderNumber', getOrderStatus);

export default router;
