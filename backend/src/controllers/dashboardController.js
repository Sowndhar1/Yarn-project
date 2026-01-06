import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

export const getAdminStats = async (req, res, next) => {
    try {
        const [
            totalRevenueOrders,
            totalRevenueSales,
            orderCount,
            saleCount,
            customerCount,
            productCount,
            recentOrders,
            recentSales,
            recentUsers,
            salesByCategory
        ] = await Promise.all([
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Sale.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Order.countDocuments(),
            Sale.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments(),
            Order.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5),
            Sale.find().sort({ createdAt: -1 }).limit(5),
            User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5),
            Order.aggregate([
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
            ])
        ]);

        const totalRevenue = (totalRevenueOrders[0]?.total || 0) + (totalRevenueSales[0]?.total || 0);

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
