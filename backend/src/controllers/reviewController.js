import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            highest: { rating: -1 },
            lowest: { rating: 1 },
            helpful: { helpful: -1 }
        };

        const reviews = await Review.find({ 
            product: productId, 
            isApproved: true 
        })
        .populate('customer', 'name')
        .sort(sortOptions[sort] || sortOptions.newest)
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await Review.countDocuments({ 
            product: productId, 
            isApproved: true 
        });

        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment } = req.body;

        if (!productId || !rating || !title || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if user has purchased the product
        const hasPurchased = await Order.findOne({
            customer: req.user.id,
            'items.product': productId,
            status: 'delivered'
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'You can only review products you have purchased' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            product: productId,
            customer: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = new Review({
            product: productId,
            customer: req.user.id,
            rating,
            title,
            comment,
            verified: true
        });

        await review.save();

        // Update product rating
        await updateProductRating(productId);

        const populatedReview = await Review.findById(review._id)
            .populate('customer', 'name');

        res.status(201).json({
            message: 'Review created successfully',
            review: populatedReview
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this review' });
        }

        if (rating) review.rating = rating;
        if (title) review.title = title;
        if (comment) review.comment = comment;

        await review.save();
        await updateProductRating(review.product);

        const populatedReview = await Review.findById(review._id)
            .populate('customer', 'name');

        res.json({
            message: 'Review updated successfully',
            review: populatedReview
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(reviewId);
        await updateProductRating(review.product);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const markReviewHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.helpful += 1;
        await review.save();

        res.json({ message: 'Review marked as helpful', helpful: review.helpful });
    } catch (error) {
        console.error('Mark review helpful error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function updateProductRating(productId) {
    try {
        const reviews = await Review.find({ product: productId, isApproved: true });
        
        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                rating: 0,
                reviewCount: 0
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews.length
        });
    } catch (error) {
        console.error('Update product rating error:', error);
    }
}

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ customer: req.user.id })
            .populate('product', 'name thumbnail brand')
            .sort({ createdAt: -1 });

        res.json({ reviews });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
