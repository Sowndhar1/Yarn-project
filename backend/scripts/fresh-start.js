import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import Cart from '../src/models/Cart.js';
import CustomerProfile from '../src/models/CustomerProfile.js';
import StaffProfile from '../src/models/StaffProfile.js';
import AdminProfile from '../src/models/AdminProfile.js';

dotenv.config();

async function freshStart() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        console.log('Cleaning up collections...');
        await Promise.all([
            User.deleteMany({}),
            Order.deleteMany({}),
            Cart.deleteMany({}),
            CustomerProfile.deleteMany({}),
            StaffProfile.deleteMany({}),
            AdminProfile.deleteMany({})
        ]);
        console.log('All users, orders, carts, and profiles deleted.');

        console.log('Creating new user: Sowndhar SV...');
        const newUser = await User.create({
            name: 'Sowndhar SV',
            email: 'sowndharsv2006@gmail.com',
            username: 'sowndharsv',
            password: '912006_SV',
            role: 'admin', // Making master account an admin
            isActive: true
        });

        // Create the profile
        await AdminProfile.create({ userId: newUser._id });

        console.log('-----------------------------------');
        console.log('SUCCESS! FRESH START COMPLETE.');
        console.log(`New Account Created:`);
        console.log(`Email: ${newUser.email}`);
        console.log(`Password: 912006_SV`);
        console.log(`Role: ${newUser.role}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Fresh start error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

freshStart();
