import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const createTestProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testProduct = new Product({
            name: "Test Payment Product",
            count: "1s",
            color: "Test White",
            brand: "Shivam Yarn Agencies",
            material: "Polyester",
            pricePerKg: 1,
            stockKg: 1000,
            category: "Test",
            yarnType: "polyester",
            weight: "medium",
            length: 1000,
            needleSize: "4mm",
            gauge: "20 sts",
            texture: "smooth",
            description: "A product for testing ₹1 payments and invoices",
            thumbnail: "https://placehold.co/400x400/f1f5f9/64748b?text=Test+Product",
            gstRate: 0,
            isAvailable: true
        });

        const saved = await testProduct.save();
        console.log('Test product created:', saved._id);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestProduct();
