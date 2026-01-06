
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const updatePasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const updates = [
            { email: 'admin@yarnbusiness.com', newPass: 'admiin123' },
            { email: 'sales@yarnbusiness.com', newPass: 'sales123' },
            { email: 'inventory@yarnbusiness.com', newPass: 'inventory123' }
        ];

        for (const update of updates) {
            const user = await User.findOne({ email: update.email });
            if (!user) {
                console.log(`❌ User not found: ${update.email}`);
                continue;
            }

            // Manually hash to be safe and explicit, or rely on pre-save hook.
            // Let's rely on pre-save hook by setting the field directly.
            // Ensure we mark it as modified if necessary, but assigning a new string is enough for Mongoose.

            user.password = update.newPass;
            await user.save();
            console.log(`✅ Password updated for: ${update.email}`);
        }

        console.log('\nAll done.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
    }
};

updatePasswords();
