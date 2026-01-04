import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.1, // Minimum 100g for yarn
        default: 1, // in kg
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

const cartSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
        totalAmount: {
            type: Number,
            default: 0,
        },
        totalWeight: {
            type: Number,
            default: 0, // Total weight in kg
        },
        couponCode: {
            type: String,
            default: '',
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        gstAmount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            default: Date.now,
            expires: 2592000, // 30 days in seconds
        },
    },
    {
        timestamps: true,
    }
);

// Calculate total amount whenever items change
cartSchema.pre('save', async function(next) {
    try {
        const Product = mongoose.model('Product');
        let totalAmount = 0;
        let totalWeight = 0;

        for (const item of this.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const itemTotal = product.pricePerKg * item.quantity;
                totalAmount += itemTotal;
                totalWeight += item.quantity;
            }
        }

        this.totalAmount = totalAmount;
        this.totalWeight = totalWeight;
        this.finalAmount = totalAmount - this.discountAmount + this.shippingCost + this.gstAmount;
        
        next();
    } catch (error) {
        next(error);
    }
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
