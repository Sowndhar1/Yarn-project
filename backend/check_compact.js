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
        const users = await User.find({ role: { $ne: 'customer' } });
        console.log(`Count: ${users.length}`);
        users.forEach(u => {
            console.log(`User: ${u.username} | Role: ${u.role} | Hashed: ${u.password?.startsWith('$2b$')}`);
        });
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

checkStaffUsers();
