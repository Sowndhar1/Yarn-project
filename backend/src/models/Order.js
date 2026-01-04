import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                productSnapshot: {
                    name: String,
                    color: String,
                    brand: String,
                    thumbnail: String,
                }, // Store product details at time of order
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'online', 'upi', 'card', 'netbanking'],
            default: 'cod',
        },
        paymentId: {
            type: String,
            default: '',
        },
        shippingAddress: {
            type: Object,
            required: true,
        },
        billingAddress: {
            type: Object,
            required: true,
        },
        notes: {
            type: String,
            default: '',
        },
        // Shipping and tracking
        trackingNumber: {
            type: String,
            default: '',
        },
        courier: {
            type: String,
            default: '',
        },
        estimatedDelivery: {
            type: Date,
        },
        actualDelivery: {
            type: Date,
        },
        // Pricing breakdown
        subtotal: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: '',
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        gstAmount: {
            type: Number,
            default: 0,
        },
        // Customer communication
        orderConfirmationSent: {
            type: Boolean,
            default: false,
        },
        shippingConfirmationSent: {
            type: Boolean,
            default: false,
        },
        deliveryConfirmationSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
