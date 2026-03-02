import mongoose from 'mongoose';
import Cart from './src/models/Cart.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'sowndharsv2006@gmail.com'; // Assuming this is the customer email
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User ID:', user._id);

        const cart = await Cart.findOne({ customer: user._id }).populate('items.product');
        if (!cart) {
            console.log('No cart found for user');
        } else {
            console.log('Cart found. Items:', cart.items.length);
            cart.items.forEach(item => {
                console.log(`- Item: ${item.product?.name}, Qty: ${item.quantity}, Stock: ${item.product?.stockKg}, Available: ${item.product?.isAvailable}`);
            });
        }

        const allCarts = await Cart.find().populate('customer', 'email');
        console.log('--- All Carts in DB ---');
        allCarts.forEach(c => {
            console.log(`User: ${c.customer?.email}, Items: ${c.items.length}`);
        });
        console.log('-----------------------');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
