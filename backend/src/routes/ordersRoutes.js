import { Router } from "express";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  getMyOrders,
} from "../controllers/ordersController.js";
import { authenticate, allowRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, allowRoles("admin", "staff"), listOrders);
router.get("/my-orders", authenticate, getMyOrders);
router.post("/", authenticate, createOrder);
router.get("/:id", authenticate, allowRoles("admin", "staff"), getOrder);
router.patch(
  "/:id/status",
  authenticate,
  allowRoles("admin", "staff"),
  updateOrderStatus
);

export default router;
