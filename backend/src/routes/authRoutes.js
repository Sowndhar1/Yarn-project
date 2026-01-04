import { Router } from "express";
import {
  login,
  register,
  getProfile,
  changePassword,
  updateProfile
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/password", authenticate, changePassword);

export default router;
