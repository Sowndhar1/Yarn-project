import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        type: {
            type: String,
            enum: ['purchase_in', 'sale_out', 'adjustment', 'return', 'initial'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        previousStock: {
            type: Number,
            required: true,
        },
        newStock: {
            type: Number,
            required: true,
        },
        referenceId: {
            type: String, // e.g., Order ID or Purchase ID
            default: '',
        },
        notes: {
            type: String,
            default: '',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Movement = mongoose.model('Movement', movementSchema);

export default Movement;
