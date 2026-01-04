import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const statuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const deliveryPreferences = ['standard', 'express', 'pickup'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'customer' });
        const products = await Product.find();

        if (users.length === 0 || products.length === 0) {
            console.log('No users or products found. Please seed them first.');
            process.exit(1);
        }

        console.log(`Found ${users.length} customers and ${products.length} products.`);

        // Clear existing orders? Maybe not, just add more.
        // await Order.deleteMany({}); 

        const ordersToCreate = [];

        for (let i = 0; i < 25; i++) {
            const customer = getRandomElement(users);
            const numItems = getRandomInt(1, 5);
            const items = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const product = getRandomElement(products);
                const quantity = getRandomInt(10, 500); // kg
                const price = product.pricePerKg || 250;
                const itemTotal = quantity * price;

                items.push({
                    product: product._id,
                    name: product.name,
                    quantity: quantity,
                    price: price,
                    color: product.color || 'White'
                });
                totalAmount += itemTotal;
            }

            // Random date within last 30 days
            const date = new Date();
            date.setDate(date.getDate() - getRandomInt(0, 30));

            const orderNum = `ORD-${Date.now()}-${getRandomInt(1000, 9999)}`;
            const address = {
                street: '123 Textile Road',
                city: 'Tiruppur',
                state: 'Tamil Nadu',
                zipCode: '641604',
                country: 'India'
            };

            ordersToCreate.push({
                orderNumber: orderNum,
                customer: customer._id,
                items: items,
                totalAmount: totalAmount,
                subtotal: totalAmount,
                status: getRandomElement(statuses),
                shippingAddress: address,
                billingAddress: address,
                createdAt: date,
                paymentMethod: 'netbanking',
                paymentStatus: 'paid'
            });
        }

        await Order.insertMany(ordersToCreate);
        console.log(`Successfully created ${ordersToCreate.length} orders!`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedOrders();
