import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from one level up (backend folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';

const resetUsers = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment');
        }

        console.log('🔗 Connecting to:', mongoUri.split('@').pop());
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const usersToReset = [
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@yarnbusiness.com' },
            { username: 'sales1', password: 'sales123', role: 'sales_staff', name: 'Sales Staff', email: 'sales@yarnbusiness.com' },
            { username: 'inventory1', password: 'inventory123', role: 'inventory_staff', name: 'Inventory Staff', email: 'inventory@yarnbusiness.com' }
        ];

        for (const u of usersToReset) {
            console.log(`🔄 Processing user: ${u.username}`);

            // Delete existing user to ensure clean slate
            await User.deleteOne({ username: u.username });
            await User.deleteOne({ email: u.email });

            console.log(`   Creating user ${u.username}...`);
            await User.create(u);
            console.log(`   ✅ User ${u.username} is ready.`);
        }

        console.log('🎉 All users reset successfully.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error during user reset:', error.message);
        if (error.stack) console.error(error.stack);
    }
};

resetUsers();
