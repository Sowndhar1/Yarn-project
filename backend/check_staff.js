import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkStaffUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({ role: { $ne: 'customer' } });
        console.log(`Found ${users.length} staff/admin users.\n`);

        users.forEach(u => {
            console.log(`-------------------`);
            console.log(`Username: ${u.username}`);
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log(`Password (starts with): ${u.password ? u.password.substring(0, 10) + '...' : 'NO PASSWORD'}`);
        });
        console.log(`-------------------\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

checkStaffUsers();
