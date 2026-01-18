import { Router } from "express";
import ReviewController from "../controllers/ReviewController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// Public routes - Lấy đánh giá của sản phẩm
router.get("/products/:productId/reviews", ReviewController.getProductReviews);
router.get("/products/:productId/rating-stats", ReviewController.getProductRatingStats);

// Authenticated routes - Tạo/sửa/xóa đánh giá
router.post("/products/:productId/reviews", authenticateToken, ReviewController.createReview);
router.put("/reviews/:reviewId", authenticateToken, ReviewController.updateReview);
router.delete("/reviews/:reviewId", authenticateToken, ReviewController.deleteReview);

export default router;

