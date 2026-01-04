import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

export const getAdminStats = async (req, res, next) => {
    try {
        const totalRevenueOrders = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenueSales = await Sale.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } }
        ]);

        const totalRevenue = (totalRevenueOrders[0]?.total || 0) + (totalRevenueSales[0]?.total || 0);

        const orderCount = await Order.countDocuments();
        const saleCount = await Sale.countDocuments();
        const customerCount = await User.countDocuments({ role: 'customer' });
        const productCount = await Product.countDocuments();

        // Recent orders (Online)
        const recentOrders = await Order.find()
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent Sales (Offline)
        const recentSales = await Sale.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentUsers = await User.find({ role: 'customer' })
            .sort({ createdAt: -1 })
            .limit(5);

        // Sales by category (Aggregate both or just orders? User asked for reports separation but this is 'Sales by Category' chart)
        // For now, let's keep it as Orders-based to avoid complex merging, or if needed, can expand later. 
        // Let's leave it as is for "Online Performance".
        const salesByCategory = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    totalAmount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                },
            },
            { $sort: { totalAmount: -1 } },
        ]);

        res.json({
            success: true,
            stats: {
                revenue: totalRevenue,
                orders: orderCount,
                offline_sales: saleCount,
                customers: customerCount,
                products: productCount
            },
            recentOrders,
            recentSales,
            recentUsers,
            salesByCategory
        });
    } catch (error) {
        next(error);
    }
};
