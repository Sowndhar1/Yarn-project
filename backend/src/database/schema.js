// Database Schema for Yarn Business Automation System
// Using in-memory storage initially, can be migrated to MongoDB/PostgreSQL later

export let database = {
  // Users & Authentication
  users: [
    // Admin user
    {
      id: "user-001",
      name: "Admin User",
      username: "admin",
      email: "admin@yarnbusiness.com",
      password: "admin123", // In production, use hashed passwords
      role: "admin",
      phone: "9876543210",
      createdAt: new Date().toISOString(),
      isActive: true
    },
    // Sales staff
    {
      id: "user-002",
      name: "Sales Staff",
      username: "sales1",
      email: "sales@yarnbusiness.com",
      password: "sales123",
      role: "sales_staff",
      phone: "9988776655",
      createdAt: new Date().toISOString(),
      isActive: true
    },
    // Inventory staff
    {
      id: "user-003",
      name: "Inventory Staff",
      username: "inventory1",
      email: "inventory@yarnbusiness.com",
      password: "inventory123",
      role: "inventory_staff",
      phone: "8877665544",
      createdAt: new Date().toISOString(),
      isActive: true
    },
    // Customer
    {
      id: "user-004",
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "customer123",
      role: "customer",
      phone: "7766554433",
      address: "123 Yarn St, Textile City",
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],

  // Products Master Data
  products: [
    {
      id: "p-cozy-40",
      name: "CozySpun 40s",
      count: "40s",
      color: "Natural",
      brand: "CozySpun",
      material: "Combed Cotton",
      pricePerKg: 320,
      hsnCode: "52051290", // HSN Code for cotton yarn
      gstRate: 18, // GST percentage
      minStockLevel: 100, // Alert when stock below this
      leadTimeDays: 2,
      description: "Premium combed cotton yarn ideal for fine woven shirtings. Balanced strength and softness.",
      thumbnail: "https://images.unsplash.com/photo-1458053688450-eef25285f6ea?auto=format&fit=crop&w=600&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "p-vivid-30",
      name: "VividTwist 30s",
      count: "30s",
      color: "Pacific Blue",
      brand: "VividTwist",
      material: "Cotton Rich",
      pricePerKg: 275,
      hsnCode: "52051290",
      gstRate: 18,
      minStockLevel: 200,
      leadTimeDays: 1,
      description: "Color-fast dyed yarn for tees and casual knits. Ships same day for confirmed orders.",
      thumbnail: "https://images.unsplash.com/photo-1460144696528-5a514b620b37?auto=format&fit=crop&w=600&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "p-millflex-24",
      name: "MillFlex 24s",
      count: "24s",
      color: "Heather Grey",
      brand: "MillFlex",
      material: "Poly-Cotton",
      pricePerKg: 245,
      hsnCode: "52064210", // Different HSN for blended yarn
      gstRate: 18,
      minStockLevel: 300,
      leadTimeDays: 3,
      description: "High-volume melange yarn engineered for fleece and athleisure programs.",
      thumbnail: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // Stock Management
  stock: [
    {
      id: "stock-001",
      productId: "p-cozy-40",
      quantity: 850, // in KG
      location: "Warehouse A",
      batchNumber: "BATCH-001",
      manufacturedDate: "2024-01-15",
      expiryDate: null, // Yarn typically doesn't expire
      lastUpdated: new Date().toISOString()
    },
    {
      id: "stock-002",
      productId: "p-vivid-30",
      quantity: 520,
      location: "Warehouse B",
      batchNumber: "BATCH-002",
      manufacturedDate: "2024-02-01",
      expiryDate: null,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "stock-003",
      productId: "p-millflex-24",
      quantity: 1200,
      location: "Warehouse A",
      batchNumber: "BATCH-003",
      manufacturedDate: "2024-01-20",
      expiryDate: null,
      lastUpdated: new Date().toISOString()
    }
  ],

  // Purchase Entries (from suppliers)
  purchases: [
    {
      id: "purchase-001",
      invoiceNumber: "PUR-2024-001",
      supplierName: "Textile Mills Ltd",
      supplierGstin: "27AAAPL1234C1ZV",
      supplierPhone: "9876543211",
      supplierAddress: "123 Industrial Area, Mumbai, Maharashtra 400001",
      purchaseDate: "2024-01-15",
      items: [
        {
          productId: "p-cozy-40",
          quantity: 500,
          ratePerKg: 300,
          discount: 0,
          gstRate: 18,
          taxableAmount: 150000,
          gstAmount: 27000,
          totalAmount: 177000
        }
      ],
      subtotal: 150000,
      totalGst: 27000,
      grandTotal: 177000,
      paymentStatus: "paid", // paid, pending, partial
      paymentMethod: "bank_transfer",
      createdBy: "user-001",
      createdAt: new Date().toISOString()
    }
  ],

  // Sales Entries (to customers)
  sales: [
    {
      id: "sale-001",
      invoiceNumber: "SALE-2024-001",
      customerName: "Garment Factory",
      customerGstin: "27BBBPL5678D2ZV",
      customerPhone: "9876543212",
      customerAddress: "456 Textile Park, Surat, Gujarat 395002",
      saleDate: "2024-02-01",
      items: [
        {
          productId: "p-vivid-30",
          quantity: 200,
          ratePerKg: 275,
          discount: 5,
          gstRate: 18,
          taxableAmount: 52250,
          gstAmount: 9405,
          totalAmount: 61655
        }
      ],
      subtotal: 52250,
      discountAmount: 2612.50,
      totalGst: 9405,
      grandTotal: 61655,
      paymentStatus: "pending",
      paymentMethod: "cash",
      createdBy: "user-001",
      createdAt: new Date().toISOString()
    }
  ],

  // Customer Orders (from e-commerce)
  orders: [
    {
      id: "order-001",
      orderNumber: "ORD-2024-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "9876543213",
      customerAddress: "789 Main Street, Bangalore, Karnataka 560001",
      orderDate: new Date().toISOString(),
      items: [
        {
          productId: "p-cozy-40",
          quantity: 50,
          ratePerKg: 320,
          totalAmount: 16000
        }
      ],
      subtotal: 16000,
      totalAmount: 16000,
      status: "pending", // pending, confirmed, packed, shipped, delivered, cancelled
      paymentStatus: "paid",
      paymentMethod: "online",
      notes: "Urgent order - customer needs by next week",
      createdBy: "user-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // Stock Movements (for tracking all stock changes)
  stockMovements: [
    {
      id: "movement-001",
      productId: "p-cozy-40",
      movementType: "purchase_in", // purchase_in, sale_out, order_out, adjustment, return
      quantity: 500,
      referenceId: "purchase-001",
      referenceType: "purchase",
      previousStock: 350,
      newStock: 850,
      notes: "Stock added from purchase entry",
      createdBy: "user-001",
      createdAt: new Date().toISOString()
    },
    {
      id: "movement-002",
      productId: "p-vivid-30",
      movementType: "sale_out",
      quantity: 200,
      referenceId: "sale-001",
      referenceType: "sale",
      previousStock: 720,
      newStock: 520,
      notes: "Stock reduced from sales entry",
      createdBy: "user-001",
      createdAt: new Date().toISOString()
    }
  ],

  // Notifications & Alerts
  notifications: [
    {
      id: "notif-001",
      type: "low_stock", // low_stock, new_order, payment_due, system_alert
      title: "Low Stock Alert",
      message: "VividTwist 30s (Pacific Blue) stock is below minimum level",
      productId: "p-vivid-30",
      currentStock: 520,
      minStockLevel: 200,
      priority: "medium", // low, medium, high, critical
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ],

  // Company Settings
  companySettings: {
    name: "Yarn Business Automation",
    address: "123 Business Park, Industrial Area, City - 400001",
    phone: "+91-9876543210",
    email: "info@yarnbusiness.com",
    gstin: "27AAAPL1234C1ZV", // Will be updated with actual GST number
    cin: "U74999MH2024PTC123456",
    bankDetails: {
      accountName: "Yarn Business Automation",
      accountNumber: "1234567890",
      bankName: "State Bank of India",
      branch: "Industrial Area Branch",
      ifsc: "SBIN0001234"
    },
    termsAndConditions: "1. Goods once sold will not be taken back.\n2. Payment should be made within 30 days.\n3. Interest @ 18% p.a. will be charged on overdue payments.",
    defaultGstRate: 18,
    lowStockAlertEnabled: true,
    emailNotificationsEnabled: false,
    smsNotificationsEnabled: false
  }
};

// Utility functions for database operations
export const dbUtils = {
  // Get current stock for a product
  getCurrentStock: (productId) => {
    const stockRecord = database.stock.find(s => s.productId === productId);
    return stockRecord ? stockRecord.quantity : 0;
  },

  // Update stock quantity
  updateStock: (productId, newQuantity, movementType, referenceId, notes, userId) => {
    const stockRecord = database.stock.find(s => s.productId === productId);
    const previousStock = stockRecord ? stockRecord.quantity : 0;
    
    if (stockRecord) {
      stockRecord.quantity = newQuantity;
      stockRecord.lastUpdated = new Date().toISOString();
    } else {
      // Create new stock record if doesn't exist
      database.stock.push({
        id: `stock-${Date.now()}`,
        productId,
        quantity: newQuantity,
        location: "Warehouse A",
        batchNumber: `BATCH-${Date.now()}`,
        manufacturedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString()
      });
    }

    // Record stock movement
    database.stockMovements.push({
      id: `movement-${Date.now()}`,
      productId,
      movementType,
      quantity: Math.abs(newQuantity - previousStock),
      referenceId,
      referenceType: movementType.includes('purchase') ? 'purchase' : movementType.includes('sale') ? 'sale' : 'order',
      previousStock,
      newStock,
      notes,
      createdBy: userId,
      createdAt: new Date().toISOString()
    });

    // Check for low stock alerts
    const product = database.products.find(p => p.id === productId);
    if (product && newQuantity <= product.minStockLevel) {
      database.notifications.push({
        id: `notif-${Date.now()}`,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} stock is below minimum level`,
        productId,
        currentStock: newQuantity,
        minStockLevel: product.minStockLevel,
        priority: newQuantity <= product.minStockLevel / 2 ? 'critical' : 'medium',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  // Generate invoice numbers
  generateInvoiceNumber: (type) => {
    const year = new Date().getFullYear();
    const prefix = type === 'purchase' ? 'PUR' : type === 'sale' ? 'SALE' : 'ORD';
    const existingCount = database[type === 'purchase' ? 'purchases' : type === 'sale' ? 'sales' : 'orders'].length;
    return `${prefix}-${year}-${String(existingCount + 1).padStart(3, '0')}`;
  }
};
