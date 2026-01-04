import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { v4 as uuid } from "uuid";

// Helper to enrich order if needed
// The current frontend uses properties like `productSnapshot` but looking at the Dashboard.jsx
// seen in step 2262, it uses `order.orderNumber`, `order.customerName`, `order.totalAmount`, `order.status`.
// It does NOT seem to use `productSnapshot` directly in the recent orders list.
// However, other pages might use `listOrders`. The `Storefront.jsx` uses `ProductCard` etc.
// Let's ensure strict compatibility.

export const listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email contact')
      .populate('items.product', 'name brand color pricePerKg')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      // Safe access to items
      const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

      return {
        ...order.toObject(),
        id: order._id,
        orderNumber: order.orderNumber || order._id,
        customerName: order.customer?.name || 'Guest',
        // Keep structure compatible with other potential consumers
        quantityKg: order.items.reduce((sum, item) => sum + item.quantity, 0),
        productSnapshot: firstItem?.productSnapshot || (firstItem?.product ? {
          name: firstItem.product.name,
          brand: firstItem.product.brand,
          color: firstItem.product.color,
          pricePerKg: firstItem.price,
          count: firstItem.product.count
        } : null),
        buyer: order.customer ? { name: order.customer.name, contact: order.customer.contact } : { name: 'Unknown' }
      };
    });

    res.json({ data: formattedOrders });
  } catch (error) {
    console.error("Error listing orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, buyer, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Support legacy "single product" payload if coming from older frontend code
    // The older code sent: productId, quantityKg, buyer
    if (req.body.productId) {
      const product = await Product.findById(req.body.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const newOrder = new Order({
        orderNumber: `ORD-${Date.now()}`,
        customer: req.user?.id,
        items: [{
          product: product._id,
          quantity: Number(req.body.quantityKg),
          price: product.pricePerKg,
          productSnapshot: {
            name: product.name,
            brand: product.brand,
            color: product.color
          }
        }],
        totalAmount: Number(req.body.quantityKg) * product.pricePerKg,
        subtotal: Number(req.body.quantityKg) * product.pricePerKg,
        status: 'pending',
        paymentMethod: 'cod',
        notes: req.body.notes
      });
      await newOrder.save();
      return res.status(201).json(newOrder);
    }

    // Standard new payload
    if (!items || !items.length) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const itemTotal = item.quantity * product.pricePerKg;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.pricePerKg,
        productSnapshot: {
          name: product.name,
          color: product.color,
          brand: product.brand,
          thumbnail: product.images?.[0] || ''
        }
      });
    }

    const newOrder = new Order({
      orderNumber: `ORD-${Date.now()}`,
      customer: req.user?.id,
      items: orderItems,
      totalAmount,
      subtotal: totalAmount,
      shippingAddress: shippingAddress || {},
      billingAddress: billingAddress || {},
      status: 'pending',
      paymentMethod: paymentMethod || 'cod'
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('items.product');

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      ...order.toObject(),
      id: order._id,
      buyer: order.customer || {},
      productSnapshot: order.items[0]?.productSnapshot
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Get current user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product', 'name brand thumbnail')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
