import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
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

const purchaseSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        supplierName: {
            type: String,
            required: true,
        },
        supplierGstin: {
            type: String,
            default: '',
        },
        supplierPhone: {
            type: String,
            default: '',
        },
        supplierAddress: {
            type: String,
            default: '',
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        items: [purchaseItemSchema],
        subtotal: {
            type: Number,
            required: true,
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
            default: 'bank_transfer',
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

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
