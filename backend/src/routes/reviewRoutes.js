import { Router } from 'express';
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markReviewHelpful,
    getUserReviews
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.use(authenticate);
router.post('/', createReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);
router.post('/:reviewId/helpful', markReviewHelpful);
router.get('/my-reviews', getUserReviews);

export default router;
