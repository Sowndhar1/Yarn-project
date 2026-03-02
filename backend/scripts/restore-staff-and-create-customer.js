import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import AdminProfile from '../src/models/AdminProfile.js';
import StaffProfile from '../src/models/StaffProfile.js';
import CustomerProfile from '../src/models/CustomerProfile.js';

dotenv.config();

async function restoreAndCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Staff Accounts
        const staffUsers = [
            {
                name: "Admin User",
                username: "admin",
                email: "admin@yarnbusiness.com",
                password: "admin123",
                role: "admin",
                isActive: true
            },
            {
                name: "Sales Staff",
                username: "sales1",
                email: "sales@yarnbusiness.com",
                password: "sales123",
                role: "sales_staff",
                isActive: true
            },
            {
                name: "Inventory Staff",
                username: "inventory1",
                email: "inventory@yarnbusiness.com",
                password: "inventory123",
                role: "inventory_staff",
                isActive: true
            }
        ];

        console.log('Seeding staff accounts...');
        for (const staff of staffUsers) {
            const existing = await User.findOne({ username: staff.username });
            if (!existing) {
                const u = await User.create(staff);
                if (staff.role === 'admin') await AdminProfile.create({ userId: u._id });
                else await StaffProfile.create({ userId: u._id });
                console.log(`✅ Created ${staff.role}: ${staff.username}`);
            } else {
                console.log(`ℹ️ Staff ${staff.username} already exists`);
            }
        }

        // 2. New Customer Account
        const customerData = {
            name: 'Sowndhar SV',
            email: 'sowndharsv2006@gmail.com',
            username: 'sowndharsv',
            password: '912006_SV',
            role: 'customer',
            isActive: true
        };

        console.log('Creating new customer account...');
        const existingCustomer = await User.findOne({ email: customerData.email });
        if (existingCustomer) {
            // Update role if it was accidentally made admin
            existingCustomer.role = 'customer';
            existingCustomer.name = customerData.name;
            existingCustomer.password = customerData.password;
            await existingCustomer.save();

            // Ensure profile exists
            const profile = await CustomerProfile.findOne({ userId: existingCustomer._id });
            if (!profile) await CustomerProfile.create({ userId: existingCustomer._id });

            console.log(`✅ Updated existing account for ${customerData.email} to Customer`);
        } else {
            const newUser = await User.create(customerData);
            await CustomerProfile.create({ userId: newUser._id });
            console.log(`✅ Created new customer: ${customerData.email}`);
        }

        console.log('-----------------------------------');
        console.log('SUCCESS! STAFF RESTORED & CUSTOMER CREATED.');
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

restoreAndCreate();
