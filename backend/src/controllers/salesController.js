import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { v4 as uuid } from 'uuid';

export const listSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { items, customerName, customerGstin, customerPhone, customerAddress, paymentMethod, paymentStatus } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "No items in sale" });
    }

    let subtotal = 0;
    let totalGst = 0;
    const saleItems = [];

    // Validate products and calculate totals
    for (const item of items) {
      let product = null;
      try {
        // Handle both product object or ID
        const prodId = item.productId || item.product;
        product = await Product.findById(prodId);
      } catch (e) { /* ignore cast error */ }

      if (!product) continue;

      const quantity = Number(item.quantity);
      const rate = Number(item.rate) || product.pricePerKg; // Allow override or default
      const taxable = quantity * rate;
      const discount = Number(item.discount) || 0;
      const gstRate = 5; // Fixed 5% GST for yarn typically, or from product
      const gstAmount = (taxable - discount) * (gstRate / 100);

      subtotal += taxable;
      totalGst += gstAmount;

      saleItems.push({
        product: product._id,
        quantity,
        ratePerKg: rate,
        discount,
        gstRate,
        taxableAmount: taxable,
        gstAmount: gstAmount,
        totalAmount: (taxable - discount) + gstAmount
      });

      // Update product stock
      // Note: Ideally wrap in transaction
      // Update product stock atomically to bypass schema validation of other fields
      // and ensure concurrency safety
      if (product.stockKg !== undefined) {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stockKg: -quantity } }
        );
      }
    }

    const grandTotal = subtotal + totalGst;

    const newSale = new Sale({
      invoiceNumber: `INV-${Date.now()}`,
      customerName: customerName || 'Walk-in Customer',
      customerGstin,
      customerPhone,
      customerAddress,
      saleDate: new Date(),
      items: saleItems,
      subtotal: subtotal,
      totalGst: totalGst,
      grandTotal: grandTotal,
      paymentStatus: paymentStatus || 'paid',
      paymentMethod: paymentMethod || 'cash',
      createdBy: req.user?.id
    });

    await newSale.save();

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      data: newSale
    });

  } catch (error) {
    console.error("Create sale error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const sale = await Sale.findByIdAndUpdate(id, { paymentStatus: status }, { new: true });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });

    res.json({ success: true, data: sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Aggregation for monthly sales
    const currentMonthSales = await Sale.aggregate([
      { $match: { saleDate: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } }
    ]);

    const totalRevenue = (currentMonthSales[0]?.total || 0);
    const salesCount = (currentMonthSales[0]?.count || 0);

    // Pending Payments
    const pendingSales = await Sale.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const pendingAmount = pendingSales[0]?.total || 0;

    // Monthly Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const monthlyTrend = await Sale.aggregate([
      { $match: { saleDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$saleDate" },
            month: { $month: "$saleDate" }
          },
          totalSales: { $sum: "$grandTotal" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format trend data for frontend (Array of { name: 'Jan', sales: 1000 })
    const formattedTrend = monthlyTrend.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        sales: item.totalSales,
        count: item.count
      };
    });

    res.json({
      success: true,
      data: {
        currentMonthTotal: totalRevenue,
        currentMonthCount: salesCount,
        averageOrderValue: salesCount > 0 ? (totalRevenue / salesCount).toFixed(2) : 0,
        pendingPayments: pendingAmount,
        topCustomers: [],
        monthlyTrend: formattedTrend
      }
    });

  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
