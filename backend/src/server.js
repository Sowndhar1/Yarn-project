import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./database/db.js";

import productsRouter from "./routes/productsRoutes.js";
import ordersRouter from "./routes/ordersRoutes.js";
import stockRouter from "./routes/stockRoutes.js";
import purchaseRouter from "./routes/purchaseRoutes.js";
import salesRouter from "./routes/salesRoutes.js";
import authRouter from "./routes/authRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import checkoutRouter from "./routes/checkoutRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "Yarn Business Automation API",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      orders: "/api/orders",
      stock: "/api/stock",
      purchases: "/api/purchases",
      sales: "/api/sales",
      auth: "/api/auth",
      cart: "/api/cart",
      reviews: "/api/reviews",
      wishlist: "/api/wishlist",
      checkout: "/api/checkout",
      dashboard: "/api/dashboard",
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/stock", stockRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/sales", salesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((err, _req, res, _next) => {
  console.error("Unexpected error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Initialize MongoDB connection and start server
// Initialize MongoDB connection and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Yarn Business Automation API listening on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});
