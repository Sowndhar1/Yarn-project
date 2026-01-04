import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id })
            .populate('items.product', 'name color brand thumbnail pricePerKg stockKg images isAvailable');

        if (!cart) {
            return res.json({ cart: { items: [], totalAmount: 0, finalAmount: 0 } });
        }

        res.json({ cart });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        // Check if product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!product.isAvailable || product.stockKg < quantity) {
            return res.status(400).json({ message: 'Product is not available or insufficient stock' });
        }

        if (quantity < product.minOrderQuantity || quantity > product.maxOrderQuantity) {
            return res.status(400).json({ 
                message: `Quantity must be between ${product.minOrderQuantity}kg and ${product.maxOrderQuantity}kg` 
            });
        }

        let cart = await Cart.findOne({ customer: req.user.id });

        if (!cart) {
            cart = new Cart({ customer: req.user.id, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (newQuantity > product.maxOrderQuantity) {
                return res.status(400).json({ 
                    message: `Maximum order quantity is ${product.maxOrderQuantity}kg` 
                });
            }

            if (product.stockKg < newQuantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity: quantity
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name color brand thumbnail pricePerKg stockKg images isAvailable');

        res.json({ 
            message: 'Product added to cart',
            cart 
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (quantity < product.minOrderQuantity || quantity > product.maxOrderQuantity) {
            return res.status(400).json({ 
                message: `Quantity must be between ${product.minOrderQuantity}kg and ${product.maxOrderQuantity}kg` 
            });
        }

        if (product.stockKg < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name color brand thumbnail pricePerKg stockKg images isAvailable');

        res.json({ 
            message: 'Cart updated',
            cart 
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name color brand thumbnail pricePerKg stockKg images isAvailable');

        res.json({ 
            message: 'Product removed from cart',
            cart 
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.json({ 
            message: 'Cart cleared',
            cart 
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;

        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Simple coupon logic (can be enhanced with a coupon management system)
        const coupons = {
            'SAVE10': 10,
            'SAVE20': 20,
            'WELCOME15': 15,
        };

        const discountPercentage = coupons[couponCode?.toUpperCase()];
        if (!discountPercentage) {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }

        cart.couponCode = couponCode.toUpperCase();
        cart.discountAmount = (cart.totalAmount * discountPercentage) / 100;
        cart.finalAmount = cart.totalAmount - cart.discountAmount + cart.shippingCost + cart.gstAmount;

        await cart.save();
        await cart.populate('items.product', 'name color brand thumbnail pricePerKg stockKg images isAvailable');

        res.json({ 
            message: `Coupon applied: ${discountPercentage}% discount`,
            cart 
        });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
