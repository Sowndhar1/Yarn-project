import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        count: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        material: {
            type: String,
            required: true,
        },
        pricePerKg: {
            type: Number,
            required: true,
        },
        stockKg: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            required: true,
        },
        leadTimeDays: {
            type: Number,
            default: 1,
        },
        description: {
            type: String,
            default: '',
        },
        thumbnail: {
            type: String,
            default: '',
        },
        // Yarn-specific attributes
        yarnType: {
            type: String,
            enum: ['cotton', 'wool', 'acrylic', 'polyester', 'silk', 'linen', 'bamboo', 'alpaca', 'cashmere', 'blend'],
            required: true,
        },
        weight: {
            type: String,
            enum: ['lace', 'fingering', 'sport', 'dk', 'worsted', 'aran', 'chunky', 'bulky', 'super bulky'],
            required: true,
        },
        length: {
            type: Number, // meters per kg
            required: true,
        },
        needleSize: {
            type: String, // recommended needle size
            required: true,
        },
        gauge: {
            type: String, // stitches per 10cm
            required: true,
        },
        texture: {
            type: String,
            enum: ['smooth', 'textured', 'boucle', 'chenille', 'slub', 'heathered', 'marled', 'variegated'],
            default: 'smooth',
        },
        careInstructions: {
            type: String,
            default: '',
        },
        images: [{
            type: String,
        }],
        tags: [{
            type: String,
        }],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        minOrderQuantity: {
            type: Number,
            default: 1, // minimum kg
        },
        maxOrderQuantity: {
            type: Number,
            default: 100, // maximum kg
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for performance optimization
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ yarnType: 1 });
productSchema.index({ color: 1 });
productSchema.index({ pricePerKg: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isAvailable: 1, stockKg: 1 }); // Composition for availability check

const Product = mongoose.model('Product', productSchema);

export default Product;
