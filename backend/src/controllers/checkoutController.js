import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const initiateCheckout = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id })
            .populate('items.product', 'name color brand thumbnail pricePerKg stockKg isAvailable');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check product availability and stock
        for (const item of cart.items) {
            if (!item.product.isAvailable) {
                return res.status(400).json({ 
                    message: `${item.product.name} is not available` 
                });
            }
            if (item.product.stockKg < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${item.product.name}` 
                });
            }
        }

        // Calculate shipping cost (simple flat rate based on weight)
        const shippingCost = calculateShippingCost(cart.totalWeight);
        
        // Calculate GST (18% for yarn products in India)
        const gstAmount = cart.totalAmount * 0.18;
        
        const finalAmount = cart.totalAmount - cart.discountAmount + shippingCost + gstAmount;

        res.json({
            cart,
            shippingCost,
            gstAmount,
            finalAmount,
            estimatedDelivery: calculateEstimatedDelivery()
        });
    } catch (error) {
        console.error('Initiate checkout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const placeOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            billingAddress,
            paymentMethod,
            paymentId,
            notes,
            couponCode
        } = req.body;

        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ 
                message: 'Shipping address and payment method are required' 
            });
        }

        const cart = await Cart.findOne({ customer: req.user.id })
            .populate('items.product', 'name color brand thumbnail pricePerKg stockKg isAvailable');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Final stock check
        for (const item of cart.items) {
            if (!item.product.isAvailable || item.product.stockKg < item.quantity) {
                return res.status(400).json({ 
                    message: `${item.product.name} is no longer available` 
                });
            }
        }

        // Generate order number
        const orderNumber = generateOrderNumber();

        // Calculate costs
        const shippingCost = calculateShippingCost(cart.totalWeight);
        const gstAmount = cart.totalAmount * 0.18;
        const finalAmount = cart.totalAmount - cart.discountAmount + shippingCost + gstAmount;

        // Create order items with product snapshots
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.pricePerKg,
            productSnapshot: {
                name: item.product.name,
                color: item.product.color,
                brand: item.product.brand,
                thumbnail: item.product.thumbnail
            }
        }));

        // Create order
        const order = new Order({
            orderNumber,
            customer: req.user.id,
            items: orderItems,
            subtotal: cart.totalAmount,
            discountAmount: cart.discountAmount,
            couponCode: couponCode || '',
            shippingCost,
            gstAmount,
            totalAmount: finalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            paymentId: paymentId || '',
            notes: notes || '',
            status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            estimatedDelivery: calculateEstimatedDelivery()
        });

        await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stockKg: -item.quantity }
            });
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        // Update user's order history
        await User.findByIdAndUpdate(req.user.id, {
            $push: { orderHistory: order._id },
            $inc: { totalSpent: finalAmount },
            $inc: { loyaltyPoints: Math.floor(finalAmount / 100) } // 1 point per ₹100
        });

        // Populate order details for response
        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name color brand');

        res.status(201).json({
            message: 'Order placed successfully',
            order: populatedOrder
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod, paymentDetails } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order already paid' });
        }

        // Simulate payment processing (in real app, integrate with payment gateway)
        let paymentResult;
        switch (paymentMethod) {
            case 'upi':
                paymentResult = await processUPIPayment(paymentDetails);
                break;
            case 'card':
                paymentResult = await processCardPayment(paymentDetails);
                break;
            case 'netbanking':
                paymentResult = await processNetBankingPayment(paymentDetails);
                break;
            default:
                return res.status(400).json({ message: 'Invalid payment method' });
        }

        if (paymentResult.success) {
            order.paymentStatus = 'paid';
            order.paymentId = paymentResult.transactionId;
            order.status = 'confirmed';
            await order.save();

            res.json({
                message: 'Payment successful',
                order
            });
        } else {
            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({
                message: 'Payment failed',
                error: paymentResult.error
            });
        }
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOrderStatus = async (req, res) => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({ orderNumber })
            .populate('customer', 'name email')
            .populate('items.product', 'name color brand thumbnail');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order or is admin/staff
        if (order.customer._id.toString() !== req.user.id && 
            !['admin', 'staff', 'sales_staff'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCustomerOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { customer: req.user.id };
        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('items.product', 'name color brand thumbnail')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper functions
function generateOrderNumber() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YRN${dateStr}${random}`;
}

function calculateShippingCost(weight) {
    // Simple shipping calculation: ₹50 for first kg, ₹20 per additional kg
    if (weight <= 1) return 50;
    return 50 + (weight - 1) * 20;
}

function calculateEstimatedDelivery() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
}

// Mock payment processing functions (replace with actual payment gateway integration)
async function processUPIPayment(details) {
    // Simulate UPI payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
        success: true,
        transactionId: 'UPI' + Date.now()
    };
}

async function processCardPayment(details) {
    // Simulate card payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
        success: true,
        transactionId: 'CARD' + Date.now()
    };
}

async function processNetBankingPayment(details) {
    // Simulate net banking payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    return {
        success: true,
        transactionId: 'NB' + Date.now()
    };
}
