import { Router } from "express";
import CouponController from "../controllers/CouponController.js";

const router = Router();

// Public route - Kiểm tra mã giảm giá
router.post("/validate", CouponController.validateCoupon);

export default router;

