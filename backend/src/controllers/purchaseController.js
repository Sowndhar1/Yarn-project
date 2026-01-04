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
    const { items, supplierName, supplierContact, invoiceNumber, notes, paymentStatus } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "No items in purchase" });
    }

    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      let product = null;
      try {
        const prodId = item.productId || item.product;
        product = await Product.findById(prodId);
      } catch (e) { }

      if (!product) continue;

      const quantity = Number(item.quantity);
      const cost = Number(item.cost);
      const amount = quantity * cost;
      totalAmount += amount;

      purchaseItems.push({
        product: product._id,
        quantity,
        costPerUnit: cost, // Schema calls it costPerUnit
        totalCost: amount
      });

      // Update product stock
      if (product.stockLevel !== undefined) {
        product.stockLevel = (product.stockLevel || 0) + quantity;
        await product.save();
      }
    }

    const newPurchase = new Purchase({
      supplierName,
      supplierContact,
      invoiceNumber,
      purchaseDate: new Date(),
      items: purchaseItems,
      totalAmount,
      paymentStatus: paymentStatus || 'paid',
      receivedBy: req.user?.userId,
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

    res.json({
      success: true,
      data: {
        currentMonthTotal: totalExpenditure,
        currentMonthCount: purchaseCount,
        pendingPayments: pendingPurchases[0]?.total || 0,
        recentActivity: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
