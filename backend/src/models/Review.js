import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        verified: {
            type: Boolean,
            default: false, // Verified purchase
        },
        helpful: {
            type: Number,
            default: 0, // Number of helpful votes
        },
        images: [{
            type: String,
        }],
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
