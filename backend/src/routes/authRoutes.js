import { Router } from "express";
import {
  login,
  register,
  getProfile,
  changePassword,
  updateProfile,
  checkIdentifier,
  requestOTP,
  verifyOTP
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/check-identifier", checkIdentifier);
router.post("/register", register);
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.get("/me", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/password", authenticate, changePassword);

export default router;
