import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Get all stock records
export const getAllStock = async (req, res) => {
  try {
    const products = await Product.find();

    // Map products to stock structure
    const stockData = products.map(product => ({
      ...product.toObject(),
      productId: product._id,
      quantity: product.stockLevel || 0,
      stockStatus: (product.stockLevel || 0) <= (product.minStockLevel || 0) ? 'low' : 'normal',
      product: product // maintain some compatibility
    }));

    res.json({
      success: true,
      data: stockData,
      total: stockData.length,
      lowStockCount: stockData.filter(s => s.stockStatus === 'low').length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const stockStatus = (product.stockLevel || 0) <= (product.minStockLevel || 0) ? 'low' : 'normal';

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        quantity: product.stockLevel || 0,
        stockStatus,
        canFulfill: (product.stockLevel || 0) > 0,
        product
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Update stock manually (adjustment)
// Note: This logic should ideally update Product model directly.
export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, notes, adjustmentType } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stockLevel || 0;
    let newQuantity = previousStock;

    if (adjustmentType === 'increase') {
      newQuantity += Number(quantity);
    } else if (adjustmentType === 'decrease') {
      newQuantity = Math.max(0, newQuantity - Number(quantity));
    } else {
      newQuantity = Number(quantity);
    }

    product.stockLevel = newQuantity;
    await product.save();

    // You might want to log this to a Movement model if you have one, 
    // but for now updating the product is sufficient for the dashboard.

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        previousStock,
        newStock: newQuantity,
        adjustment: adjustmentType || 'set'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};

export const getStockMovements = async (req, res) => {
  // For now, return empty or implement Movement model if it exists and is populated.
  // Given the task is dashboard dynamic, and dashboard uses `recentOrders` for movements or 
  // `stockSummary.recentMovements`, let's just return empty array to prevent 500s.
  res.json({
    success: true,
    data: [],
    pagination: { total: 0, limit: 50, offset: 0, hasMore: false }
  });
}

export const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stockLevel", "$minStockLevel"] }
    });

    const updates = products.map(p => ({
      id: p._id,
      product: p,
      currentStock: p.stockLevel,
      minStockLevel: p.minStockLevel,
      urgency: p.stockLevel === 0 ? 'critical' : 'warning'
    }));

    res.json({ success: true, data: updates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get stock summary for dashboard
export const getStockSummary = async (req, res) => {
  try {
    const products = await Product.find();

    // Calculate total stock value
    const totalStockValue = products.reduce((sum, p) => sum + ((p.stockLevel || 0) * (p.pricePerKg || 0)), 0);
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => (p.stockLevel || 0) <= (p.minStockLevel || 0)).length;

    // Fetch recent movements from orders as a proxy
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('items.product');

    res.json({
      success: true,
      data: {
        totalStockValue,
        totalProducts,
        lowStockCount,
        stockHealth: totalProducts > 0 ? ((totalProducts - lowStockCount) / totalProducts * 100).toFixed(1) : 0,
        recentMovements: recentOrders.map(o => ({
          id: o._id,
          type: 'out',
          quantity: o.items.reduce((s, i) => s + i.quantity, 0),
          product: o.items[0]?.product,
          createdAt: o.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
