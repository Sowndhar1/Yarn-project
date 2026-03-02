import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateUserInfo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'sowndharsv2006@gmail.com';
        const newPhone = '9025747946';

        const user = await User.findOne({ email });
        if (user) {
            console.log(`🔧 Updating info for: ${email}`);
            user.phone = newPhone;
            await user.save();
            console.log(`✅ Phone updated to ${newPhone}`);
        } else {
            console.log(`⚠️ User not found: ${email}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

updateUserInfo();
