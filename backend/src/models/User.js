import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'staff', 'sales_staff', 'inventory_staff', 'customer'],
            default: 'customer',
        },
        phone: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        onboarding: {
            type: Object,
            default: null,
        },
        // Customer-specific fields
        addresses: [{
            type: {
                type: String,
                enum: ['home', 'work', 'other'],
                default: 'home',
            },
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
                default: 'India',
            },
            isDefault: {
                type: Boolean,
                default: false,
            },
        }],
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }],
        preferences: {
            favoriteCategories: [{
                type: String,
            }],
            favoriteBrands: [{
                type: String,
            }],
            priceRange: {
                min: {
                    type: Number,
                    default: 0,
                },
                max: {
                    type: Number,
                    default: 10000,
                },
            },
            notifications: {
                email: {
                    type: Boolean,
                    default: true,
                },
                sms: {
                    type: Boolean,
                    default: false,
                },
                orderUpdates: {
                    type: Boolean,
                    default: true,
                },
                promotions: {
                    type: Boolean,
                    default: true,
                },
            },
        },
        orderHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        }],
        totalSpent: {
            type: Number,
            default: 0,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
