import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);

        for (const user of users) {
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            console.log(`- Username: ${user.username}, Role: ${user.role}, Password Hashed: ${isHashed}`);

            if (!isHashed) {
                console.log(`  ⚠️ User ${user.username} has a plain-text password. Hashing it now...`);
                // Triggering save() will trigger the pre-save hook
                user.password = user.password;
                await user.save();
                console.log(`  ✅ User ${user.username} password hashed.`);
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

checkUsers();
