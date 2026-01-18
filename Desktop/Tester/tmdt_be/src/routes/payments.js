import express from "express";
import PaymentController from "../controllers/PaymentController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Tạo URL thanh toán VNPAY (yêu cầu đăng nhập)
router.post("/vnpay/create", authenticateToken, (req, res) => PaymentController.createVnPay(req, res));

// Return URL (user-facing): GET
router.get("/vnpay/return", (req, res) => PaymentController.vnpReturn(req, res));

// IPN (server-to-server): có thể là GET hoặc POST (tuỳ cấu hình). Ở đây hỗ trợ POST.
router.post("/vnpay/ipn", (req, res) => PaymentController.vnpIpn(req, res));

// Một số cấu hình VNPAY gọi IPN bằng GET, mở thêm để an toàn
router.get("/vnpay/ipn", (req, res) => PaymentController.vnpIpn(req, res));

export default router;
