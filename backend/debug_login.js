import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import { signToken } from './src/middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const identifier = "admin@yarnbusiness.com";
        const password = "admin123";

        console.log(`🔍 Finding user: ${identifier}`);
        const user = await User.findOne({
            $and: [
                {
                    $or: [
                        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } },
                        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } }
                    ]
                },
                { isActive: true }
            ]
        });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }
        console.log('✅ User found:', user.email);
        console.log('🔒 User Hash:', user.password);

        console.log('🔑 Testing matchPassword...');
        // This is likely where it fails if 500
        const isMatch = await user.matchPassword(password);
        console.log(`✅ matchPassword result: ${isMatch}`);

        console.log('✍️ Testing signToken...');
        // Or here
        const token = signToken({ ...user.toObject(), id: user._id.toString() });
        console.log('✅ Token signed:', token ? 'Yes' : 'No');

        console.log('🎉 Login simulation successful');
        process.exit(0);
    } catch (err) {
        console.error('❌ CRASH:', err);
        process.exit(1);
    }
};

testLogin();
