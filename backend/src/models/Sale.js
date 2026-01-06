import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    ratePerKg: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    gstRate: {
        type: Number,
        default: 5,
    },
    taxableAmount: {
        type: Number,
        required: true,
    },
    gstAmount: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
});

const saleSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerGstin: {
            type: String,
            default: '',
        },
        customerPhone: {
            type: String,
            default: '',
        },
        customerAddress: {
            type: String,
            default: '',
        },
        saleDate: {
            type: Date,
            default: Date.now,
        },
        items: [saleItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        totalGst: {
            type: Number,
            default: 0,
        },
        grandTotal: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank_transfer', 'cheque', 'upi'],
            default: 'cash',
        },
        notes: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster dashboard stats
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ createdAt: -1 });


const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
