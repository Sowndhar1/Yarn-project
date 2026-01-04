import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        addresses: [{
            type: {
                type: String,
                enum: ['home', 'work', 'other'],
                default: 'home',
            },
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: { type: String, default: 'India' },
        }],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        preferences: Object,
        orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    },
    { timestamps: true }
);

export default mongoose.model('CustomerProfile', customerProfileSchema);
