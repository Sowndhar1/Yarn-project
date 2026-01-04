import { Router } from "express";
import {
    getProduct,
    listProducts,
    getFeaturedProducts,
    getNewArrivals,
    getBestSellers,
    createProduct,
    updateProduct
} from "../controllers/productsController.js";
import { authenticate, allowRoles } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.get("/", listProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/:id", getProduct);

// Protected routes for managing products
router.post("/", authenticate, allowRoles('admin', 'inventory_staff'), upload.single('image'), createProduct);
router.put("/:id", authenticate, allowRoles('admin', 'inventory_staff'), upload.single('image'), updateProduct);

export default router;
