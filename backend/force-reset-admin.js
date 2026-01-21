
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log('👤 Found admin user. Updating password...');

        // Manual hash to be absolutely sure
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);

        // Bypass pre-save hook by using updateOne
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hash } }
        );

        console.log('✨ Password forcefully updated to: admin123');
        console.log(`🔒 New Hash: ${hash}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
    }
};

resetAdmin();
