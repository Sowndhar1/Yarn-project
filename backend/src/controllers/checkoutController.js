import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/paymentService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

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

        // Calculate shipping cost: Set to 0 for testing
        const shippingCost = 0;

        // Calculate GST: Set to 0 for testing
        const gstAmount = 0;

        const finalAmount = cart.totalAmount + shippingCost + gstAmount;

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
            items: bodyItems,
            shippingAddress,
            billingAddress,
            paymentMethod,
            paymentId,
            notes,
            couponCode
        } = req.body;

        console.log('Place Order: Received request body keys:', Object.keys(req.body));
        if (req.body.items) {
            console.log('Place Order: Items length:', req.body.items.length);
        } else {
            console.log('Place Order: Items field is MISSING in body');
        }
        console.log('Place Order: Full body:', JSON.stringify(req.body, null, 2));

        if (!shippingAddress || !paymentMethod) {
            console.error('Place Order Error: Missing required fields', {
                hasShippingAddress: !!shippingAddress,
                paymentMethod
            });
            return res.status(400).json({
                message: 'Shipping address and payment method are required'
            });
        }

        let orderItems = [];
        let subtotal = 0;
        let totalWeight = 0;

        console.log('--- PLACE ORDER LOUD DEBUG START ---');
        console.log('User ID from token:', req.user.id);
        console.log('Request body items:', JSON.stringify(bodyItems, null, 2));

        // Try to get cart from DB first
        const cart = await Cart.findOne({ customer: req.user.id })
            .populate('items.product', 'name color brand thumbnail pricePerKg stockKg isAvailable');

        console.log('DB Cart found:', !!cart);
        if (cart) {
            console.log('DB Cart items count:', cart.items.length);
        }

        if (cart && cart.items.length > 0) {
            console.log('CASE: Using DB Cart');
            // ... (rest of DB cart logic)
            // [KEEP ORIGINAL LOGIC IN REPLACEMENT]
            for (const item of cart.items) {
                if (!item.product.isAvailable || item.product.stockKg < item.quantity) {
                    return res.status(400).json({
                        message: `${item.product.name} is no longer available or out of stock`
                    });
                }
                orderItems.push({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.pricePerKg,
                    productSnapshot: {
                        name: item.product.name,
                        color: item.product.color,
                        brand: item.product.brand,
                        thumbnail: item.product.thumbnail
                    }
                });
                subtotal += item.product.pricePerKg * item.quantity;
                totalWeight += item.quantity;
            }
        } else if (bodyItems && bodyItems.length > 0) {
            console.log('CASE: Using Body Items. Count:', bodyItems.length);
            // Use Items from request body (validate against DB)
            for (const item of bodyItems) {
                const product = await Product.findById(item.productId || item.product);
                if (!product) {
                    console.log('Product not found in DB:', item.productId);
                    return res.status(404).json({ message: `Product not found: ${item.productId}` });
                }
                if (!product.isAvailable || product.stockKg < item.quantity) {
                    console.error('Place Order Error: Stock/Availability issues', {
                        product: product.name,
                        isAvailable: product.isAvailable,
                        stock: product.stockKg,
                        requested: item.quantity
                    });
                    return res.status(400).json({
                        message: `${product.name} is no longer available or out of stock`
                    });
                }
                orderItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.pricePerKg,
                    productSnapshot: {
                        name: product.name,
                        color: product.color,
                        brand: product.brand,
                        thumbnail: product.thumbnail
                    }
                });
                subtotal += product.pricePerKg * item.quantity;
                totalWeight += item.quantity;
            }
        } else {
            console.log('CASE: NO ITEMS FOUND ANYWHERE');
            console.error('Place Order Error: No items found in DB cart or request body', {
                userId: req.user.id,
                bodyItemsCount: bodyItems?.length,
                hasDbCart: !!cart
            });
            console.log('--- PLACE ORDER LOUD DEBUG END ---');
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Generate order number
        const orderNumber = generateOrderNumber();

        // Calculate final costs
        let shippingCost = 0; // Testing: Always 0
        let gstAmount = 0;

        // Recalculate GST based on individual product rates
        for (const item of bodyItems || cart.items) {
            const product = await Product.findById(item.productId || item.product?._id || item.product);
            if (product) {
                const itemSubtotal = product.pricePerKg * item.quantity;
                const rate = product.gstRate !== undefined ? product.gstRate : 18;
                gstAmount += (itemSubtotal * rate) / 100;
            }
        }

        const finalAmount = subtotal + shippingCost + gstAmount;

        console.log('--- FINAL PRICING DEBUG ---');
        console.log('Subtotal:', subtotal);
        console.log('GST (forced 0% for test):', gstAmount);
        console.log('Shipping (forced 0 for test):', shippingCost);
        console.log('Final Amount (sent to Razorpay):', finalAmount);
        console.log('---------------------------');

        // Create order
        const order = new Order({
            orderNumber,
            customer: req.user.id,
            items: orderItems,
            subtotal,
            discountAmount: 0, // Coupons handled separately if needed
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
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stockKg: -item.quantity }
            });
        }

        // Clear DB cart if it existed
        if (cart) {
            cart.items = [];
            await cart.save();
        }

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

        // Handle Payment logic
        if (paymentMethod === 'online') {
            const razorpayResult = await createRazorpayOrder(finalAmount, orderNumber);

            if (razorpayResult.success) {
                // Save Razorpay Order ID to our order
                order.paymentId = razorpayResult.order.id;
                await order.save();

                return res.status(201).json({
                    message: 'Order created, proceed to payment',
                    order: populatedOrder,
                    razorpayOrderId: razorpayResult.order.id,
                    amount: razorpayResult.order.amount,
                    currency: razorpayResult.order.currency
                });
            } else {
                // If Razorpay order creation fails, we might want to flag the order or handle accordingly
                console.error('Razorpay order creation failed:', razorpayResult.error);
                return res.status(500).json({ message: 'Failed to initialize payment' });
            }
        }

        // If COD, send confirmation email immediately
        if (paymentMethod === 'cod') {
            await sendOrderConfirmationEmail(populatedOrder, populatedOrder.customer.email);
        }

        res.status(201).json({
            message: 'Order placed successfully',
            order: populatedOrder
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const isVerified = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isVerified) {
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
        }

        const isMongoId = orderId.match(/^[0-9a-fA-F]{24}$/);
        const query = isMongoId
            ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
            : { orderNumber: orderId };

        const order = await Order.findOne(query).populate('customer', 'name email phone');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status
        order.paymentStatus = 'paid';
        order.paymentId = razorpay_payment_id;
        order.status = 'confirmed';
        await order.save();

        // Update user stats
        await User.findByIdAndUpdate(order.customer._id, {
            $inc: { totalSpent: order.totalAmount }
        });

        // Send confirmation email
        await sendOrderConfirmationEmail(order, order.customer.email);

        res.json({
            message: 'Payment verified and order confirmed',
            order
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod, paymentDetails } = req.body;

        const isMongoId = orderId.match(/^[0-9a-fA-F]{24}$/);
        const query = isMongoId
            ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
            : { orderNumber: orderId };

        const order = await Order.findOne(query);
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
        console.log(`[DEBUG] getOrderStatus for: ${orderNumber}, User: ${req.user.id}`);

        // Try searching by orderNumber OR by MongoDB _id (in case frontend sends that)
        const isMongoId = orderNumber.match(/^[0-9a-fA-F]{24}$/);
        const query = isMongoId
            ? { $or: [{ orderNumber: orderNumber }, { _id: orderNumber }] }
            : { orderNumber: orderNumber };

        const order = await Order.findOne(query)
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
        res.status(500).json({ message: 'Internal server error while fetching customer orders.' });
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

function calculateShippingCost(subtotal) {
    // Testing: Set to 0 for all orders
    return 0;
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
