import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Product from '../models/Product.js';
import { database } from './schema.js';
import { sampleProducts } from '../data/products.js';

dotenv.config();

const seedData = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Seeding initial users...');
            // Using .create() ensures pre-save hooks (for password hashing) are triggered
            await User.create(database.users.map(u => ({
                ...u,
                id: undefined, // remove old id string
                _id: u.id.startsWith('user-') ? undefined : u.id
            })));
        }

        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('🌱 Seeding initial products...');
            await Product.insertMany(sampleProducts);
        }
    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await seedData();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
