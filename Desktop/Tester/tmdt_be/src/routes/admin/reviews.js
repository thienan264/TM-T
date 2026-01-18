import { Router } from "express";
import ReviewController from "../../controllers/ReviewController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/authorization.js";

const router = Router();

// Admin routes - Quản lý đánh giá
router.get("/", authenticateToken, authorizeRoles("admin"), ReviewController.getAllReviews);
router.patch("/:reviewId/toggle-approval", authenticateToken, authorizeRoles("admin"), ReviewController.toggleApproval);
router.delete("/:reviewId", authenticateToken, authorizeRoles("admin"), ReviewController.deleteReview);

export default router;

