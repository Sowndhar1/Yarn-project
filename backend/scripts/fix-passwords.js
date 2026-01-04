import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking passwords...`);

        let fixedCount = 0;
        for (const user of users) {
            // Check if password looks like a bcrypt hash
            if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                console.log(`🔧 Hashing password for user: ${user.username} (${user.role})`);

                // We don't just save() because if it's already there and we set it to the same string, 
                // the pre-save hook might see it as NOT modified (though usually it checks the field).
                // In our User.js, it checks this.isModified('password').

                // To be safe and explicit:
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(user.password, salt);

                await User.updateOne({ _id: user._id }, { $set: { password: hash } });
                fixedCount++;
            }
        }

        console.log(`\n✅ Finished. Fixed ${fixedCount} users.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
    }
};

fixPasswords();
