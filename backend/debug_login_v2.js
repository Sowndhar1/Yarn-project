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
        console.log('1. Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        console.log('2. Finding user...');
        const user = await User.findOne({ email: "test@example.com" });
        if (!user) throw new Error("User not found");
        console.log('✅ Found user');

        console.log('3. Testing matchPassword...');
        try {
            const isMatch = await user.matchPassword("password123");
            console.log(`✅ matchPassword success: ${isMatch}`);
        } catch (e) {
            console.error('❌ matchPassword FAILED:', e);
            throw e;
        }

        console.log('4. Testing signToken...');
        try {
            // Simulate exactly what authController does
            const dataToSign = { ...user.toObject(), id: user._id.toString() };
            const token = signToken(dataToSign);
            console.log('✅ signToken success');
        } catch (e) {
            console.error('❌ signToken FAILED:', e);
            throw e;
        }

        console.log('SUCCESS');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL FAILURE:', err);
        process.exit(1);
    }
};

testLogin();
