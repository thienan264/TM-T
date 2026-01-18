import ReviewService from "../services/ReviewService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class ReviewController {
    /**
     * GET /api/products/:productId/reviews
     * Lấy danh sách đánh giá của sản phẩm (public)
     */
    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const result = await ReviewService.getProductReviews(productId, req.query || {});
            return successResponse(res, "Lấy danh sách đánh giá thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy danh sách đánh giá", 500);
        }
    }

    /**
     * GET /api/products/:productId/rating-stats
     * Lấy thống kê đánh giá của sản phẩm (public)
     */
    async getProductRatingStats(req, res) {
        try {
            const { productId } = req.params;
            const result = await ReviewService.getProductRatingStats(productId);
            return successResponse(res, "Lấy thống kê đánh giá thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy thống kê đánh giá", 500);
        }
    }

    /**
     * POST /api/products/:productId/reviews
     * Tạo đánh giá mới (yêu cầu đăng nhập)
     */
    async createReview(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return errorResponse(res, "Vui long dang nhap", 401);
            }

            const review = await ReviewService.createReview(userId, productId, req.body || {});
            return successResponse(res, "Tao danh gia thanh cong", review, 201);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Loi khi tao danh gia", isValidation ? 400 : 500);
        }
    }

    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            const updated = await ReviewService.updateReview(reviewId, userId, req.body || {});
            if (!updated) return errorResponse(res, "Khong tim thay danh gia", 404);
            return successResponse(res, "Cap nhat danh gia thanh cong", updated);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Loi khi cap nhat", isValidation ? 400 : 500);
        }
    }

    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            const isAdmin = req.user?.role?.name === "admin";
            const ok = await ReviewService.deleteReview(reviewId, userId, isAdmin);
            if (!ok) return errorResponse(res, "Khong tim thay danh gia", 404);
            return successResponse(res, "Xoa danh gia thanh cong", { deletedReviewId: parseInt(reviewId) });
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Loi khi xoa", isValidation ? 400 : 500);
        }
    }

    async getAllReviews(req, res) {
        try {
            const result = await ReviewService.getAllReviews(req.query || {});
            return successResponse(res, "Lay danh sach danh gia thanh cong", result);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay danh sach", 500);
        }
    }

    async toggleApproval(req, res) {
        try {
            const { reviewId } = req.params;
            const review = await ReviewService.toggleApproval(reviewId);
            if (!review) return errorResponse(res, "Khong tim thay danh gia", 404);
            return successResponse(res, "Cap nhat trang thai duyet thanh cong", review);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi cap nhat", 500);
        }
    }
}

export default new ReviewController();