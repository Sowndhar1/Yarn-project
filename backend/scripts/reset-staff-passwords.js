import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const resetStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const staffToReset = [
            { username: 'admin', password: 'admin123' },
            { username: 'sales1', password: 'sales123' },
            { username: 'inventory1', password: 'inventory123' }
        ];

        for (const staff of staffToReset) {
            const user = await User.findOne({ username: staff.username });
            if (user) {
                console.log(`🔧 Resetting password for: ${staff.username}`);
                user.password = staff.password; // This will trigger the pre-save hook to hash it
                await user.save();
                console.log(`✅ Success for ${staff.username}`);
            } else {
                console.log(`⚠️ User not found: ${staff.username}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetStaff();
