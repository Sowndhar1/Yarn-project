import User from '../models/User.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('wishlist', 'name color brand thumbnail pricePerKg stockKg images isAvailable rating');

        res.json({ wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const user = await User.findById(req.user.id);
        
        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        await user.populate('wishlist', 'name color brand thumbnail pricePerKg stockKg images isAvailable rating');

        res.json({
            message: 'Product added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);
        
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        await user.populate('wishlist', 'name color brand thumbnail pricePerKg stockKg images isAvailable rating');

        res.json({
            message: 'Product removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        user.wishlist = [];
        await user.save();

        res.json({
            message: 'Wishlist cleared',
            wishlist: []
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
