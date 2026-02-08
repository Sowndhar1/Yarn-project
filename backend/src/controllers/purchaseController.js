import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { v4 as uuid } from 'uuid';

export const listPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('receivedBy', 'name email');

    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { items, supplierName, supplierGstin, supplierPhone, supplierAddress, notes, paymentStatus, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "No items in purchase" });
    }

    let subtotal = 0;
    let totalGst = 0;
    let grandTotal = 0;
    const purchaseItems = [];

    for (const item of items) {
      let product = null;
      try {
        const prodId = item.productId || item.product;
        product = await Product.findById(prodId);
      } catch (e) { }

      if (!product) continue;

      const quantity = Number(item.quantity) || 0;
      const ratePerKg = Number(item.ratePerKg) || 0;
      const discount = Number(item.discount) || 0;
      const gstRate = Number(item.gstRate) || 0;

      // Calculations
      const lineSubtotal = quantity * ratePerKg;
      const discountAmount = lineSubtotal * (discount / 100);
      const taxableAmount = lineSubtotal - discountAmount;
      const gstAmount = taxableAmount * (gstRate / 100);
      const lineTotal = taxableAmount + gstAmount;

      subtotal += taxableAmount; // Or lineSubtotal? Schema usually implies taxable subtotal. frontend sums subtotal as quantity*rate.
      // Let's follow frontend logic: acc.subtotal += subtotal (which is qty*rate).
      // But Purchase schema "subtotal" usually means pre-tax total.
      // I'll store the sum of taxableAmounts as subtotal? Or sum of raw subtotals?
      // Mongoose schema has "subtotal", "totalGst", "grandTotal".
      // Let's use Sum of Taxable Amounts as subtotal for consistency with GST.
      // Actually, frontend calculates subtotal as qty * rate.
      // I will follow standard accounting: Subtotal = Sum(Qty * Rate).
      // Then Discount is separate? Schema doesn't have totalDiscount field.
      // Schema items have discount.
      // Let's stick to: Subtotal = Sum of (Qty * Rate).
      // But wait, if I use that, then GrandTotal != Subtotal + GST if there is discount.
      // Schema has NO global discount field.
      // So Subtotal should probably be Sum of Taxable Amounts?
      // Let's use:
      // Subtotal = Sum of Taxable Amounts (after discount)
      // Total GST = Sum of GST
      // Grand Total = Subtotal + GST.

      subtotal += taxableAmount;
      totalGst += gstAmount;
      grandTotal += lineTotal;

      purchaseItems.push({
        product: product._id,
        quantity,
        ratePerKg,
        discount,
        gstRate,
        taxableAmount,
        gstAmount,
        totalAmount: lineTotal
      });

      // Update product stock atomically to bypass schema validation
      if (product.stockKg !== undefined) {
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stockKg: quantity } }
        );
      }
    }

    // Generate Invoice Number (Simple Timestamp based or Random)
    const invoiceNumber = `PUR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newPurchase = new Purchase({
      invoiceNumber,
      supplierName,
      supplierGstin,
      supplierPhone,
      supplierAddress,
      purchaseDate: new Date(),
      items: purchaseItems,
      subtotal,
      totalGst,
      grandTotal,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: paymentMethod || 'bank_transfer',
      createdBy: req.user?.id,
      notes
    });

    await newPurchase.save();

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      data: newPurchase
    });

  } catch (error) {
    console.error("Create purchase error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const purchase = await Purchase.findByIdAndUpdate(id, { paymentStatus: status }, { new: true });
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase not found" });

    res.json({ success: true, data: purchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export const getPurchaseSummary = async (req, res) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Aggregation for monthly purchases
    const currentMonthPurchases = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);

    const totalExpenditure = (currentMonthPurchases[0]?.total || 0);
    const purchaseCount = (currentMonthPurchases[0]?.count || 0);

    const pendingPurchases = await Purchase.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    // Monthly Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrend = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$purchaseDate" },
            month: { $month: "$purchaseDate" }
          },
          totalPurchases: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format trend data
    const formattedTrend = monthlyTrend.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        purchases: item.totalPurchases,
        count: item.count
      };
    });

    res.json({
      success: true,
      data: {
        currentMonthTotal: totalExpenditure,
        currentMonthCount: purchaseCount,
        pendingPayments: pendingPurchases[0]?.total || 0,
        recentActivity: [],
        monthlyTrend: formattedTrend
      }
    });

  } catch (error) {
    console.error('Error fetching purchase summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
