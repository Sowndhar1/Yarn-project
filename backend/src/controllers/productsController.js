import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            count,
            color,
            brand,
            material,
            pricePerKg,
            stockKg,
            category,
            yarnType,
            weight,
            length,
            needleSize,
            gauge,
            description,
            leadTimeDays,
            thumbnailUrl, // For manual URL entry
            tags
        } = req.body;

        // Determine final image URL
        // If file was uploaded via Cloudinary storage, use its path
        // Otherwise use the manual URL provided by the user
        let finalThumbnail = thumbnailUrl;
        if (req.file && req.file.path) {
            finalThumbnail = req.file.path;
        }

        const newProduct = new Product({
            name,
            count,
            color,
            brand,
            material,
            pricePerKg: parseFloat(pricePerKg),
            stockKg: parseInt(stockKg) || 0,
            category,
            yarnType,
            weight,
            length: parseInt(length) || 1000,
            needleSize,
            gauge,
            description,
            leadTimeDays: parseInt(leadTimeDays) || 1,
            thumbnail: finalThumbnail,
            images: [finalThumbnail],
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            isAvailable: true
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ message: error.message || 'Error creating product' });
    }
};

export const listProducts = async (req, res) => {
    try {
        const {
            brand,
            count,
            color,
            q,
            category,
            yarnType,
            weight,
            texture,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            sortBy,
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = {};

        // Basic filters
        if (brand) query.brand = { $regex: new RegExp(brand, 'i') };
        if (count) query.count = { $regex: new RegExp(count, 'i') };
        if (color) query.color = { $regex: new RegExp(color, 'i') };
        if (category) query.category = { $regex: new RegExp(category, 'i') };

        // Yarn-specific filters
        if (yarnType) query.yarnType = yarnType;
        if (weight) query.weight = weight;
        if (texture) query.texture = texture;

        // Price range
        if (minPrice || maxPrice) {
            query.pricePerKg = {};
            if (minPrice) query.pricePerKg.$gte = parseFloat(minPrice);
            if (maxPrice) query.pricePerKg.$lte = parseFloat(maxPrice);
        }

        // Rating filter
        if (minRating) query.rating = { $gte: parseFloat(minRating) };

        // Stock filter
        if (inStock === 'true') {
            query.stockKg = { $gt: 0 };
            query.isAvailable = true;
        }

        // Search query
        if (q) {
            query.$or = [
                { name: { $regex: new RegExp(q, 'i') } },
                { description: { $regex: new RegExp(q, 'i') } },
                { brand: { $regex: new RegExp(q, 'i') } },
                { color: { $regex: new RegExp(q, 'i') } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }

        // Sorting
        let sort = {};
        switch (sortBy) {
            case 'price-low':
                sort = { pricePerKg: 1 };
                break;
            case 'price-high':
                sort = { pricePerKg: -1 };
                break;
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'name-asc':
                sort = { name: 1 };
                break;
            case 'name-desc':
                sort = { name: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        // Get filter options for frontend
        const brands = await Product.distinct('brand');
        const categories = await Product.distinct('category');
        const yarnTypes = await Product.distinct('yarnType');
        const weights = await Product.distinct('weight');
        const textures = await Product.distinct('texture');
        const colors = await Product.distinct('color');

        res.json({
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            filters: {
                brands: brands.sort(),
                categories: categories.sort(),
                yarnTypes: yarnTypes.sort(),
                weights: weights.sort(),
                textures: textures.sort(),
                colors: colors.sort()
            }
        });
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Handle image update
        if (req.file && req.file.path) {
            updateData.thumbnail = req.file.path;
            if (!updateData.images) updateData.images = [];
            updateData.images = [req.file.path, ...(Array.isArray(updateData.images) ? updateData.images : [])];
        } else if (updateData.thumbnailUrl) {
            updateData.thumbnail = updateData.thumbnailUrl;
            if (!updateData.images) updateData.images = [];
            updateData.images = [updateData.thumbnailUrl, ...(Array.isArray(updateData.images) ? updateData.images : [])];
        }

        // Clean up numeric fields
        if (updateData.pricePerKg) updateData.pricePerKg = parseFloat(updateData.pricePerKg);
        if (updateData.stockKg) updateData.stockKg = parseInt(updateData.stockKg);
        if (updateData.length) updateData.length = parseInt(updateData.length);
        if (updateData.leadTimeDays) updateData.leadTimeDays = parseInt(updateData.leadTimeDays);

        // Handle tags
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim());
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ message: error.message || 'Error updating product' });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const featuredProducts = await Product.find({
            isAvailable: true,
            stockKg: { $gt: 0 },
            rating: { $gte: 4 }
        })
            .sort({ rating: -1, createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ data: featuredProducts });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getNewArrivals = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const newArrivals = await Product.find({
            isAvailable: true,
            stockKg: { $gt: 0 }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ data: newArrivals });
    } catch (error) {
        console.error('Get new arrivals error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBestSellers = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        // For now, return products with highest ratings
        // In a real system, this would be based on actual sales data
        const bestSellers = await Product.find({
            isAvailable: true,
            stockKg: { $gt: 0 },
            rating: { $gte: 3.5 }
        })
            .sort({ rating: -1, reviewCount: -1 })
            .limit(parseInt(limit));

        res.json({ data: bestSellers });
    } catch (error) {
        console.error('Get best sellers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
