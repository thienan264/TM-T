import { Op } from "sequelize";
import { Review, User, Product } from "../models/index.js";

class ReviewService {
    /**
     * Lấy danh sách đánh giá của một sản phẩm
     */
    static async getProductReviews(productId, { page = 1, limit = 10 }) {
        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, parseInt(limit));

        const { count, rows } = await Review.findAndCountAll({
            where: { productId, isApproved: true },
            include: [
                { model: User, as: "user", attributes: ["id", "fullName", "email"] },
            ],
            order: [["createdAt", "DESC"]],
            limit: l,
            offset: (p - 1) * l,
        });

        const totalPages = Math.ceil(count / l) || 1;
        return {
            reviews: rows,
            pagination: {
                currentPage: p,
                totalPages,
                totalItems: count,
                itemsPerPage: l,
            },
        };
    }

    /**
     * Lấy thống kê đánh giá của một sản phẩm
     */
    static async getProductRatingStats(productId) {
        const reviews = await Review.findAll({
            where: { productId, isApproved: true, rating: { [Op.ne]: null } },
            attributes: ["rating"],
        });

        if (!reviews.length) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const totalReviews = reviews.length;
        const sumRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = Math.round((sumRating / totalReviews) * 10) / 10;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            ratingDistribution[r.rating]++;
        });

        return {
            averageRating,
            totalReviews,
            ratingDistribution,
        };
    }

    /**
     * Tạo đánh giá mới
     */
    static async createReview(userId, productId, data) {
        // Validate
        if (!data.rating || data.rating < 1 || data.rating > 5) {
            throw new Error("validation: rating phải từ 1 đến 5 sao");
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error("validation: Sản phẩm không tồn tại");
        }

        // Cho phép người dùng bình luận nhiều lần: bỏ kiểm tra đã đánh giá

        // Nếu user đã có đánh giá (có rating), các bình luận sau chỉ là comment (rating=null)
        const userRated = await Review.findOne({ where: { userId, productId, rating: { [Op.ne]: null } } });

        const review = await Review.create({
            userId,
            productId,
            rating: userRated ? null : (data.rating ? parseInt(data.rating) : null),
            comment: (data.comment ?? data.content ?? '').trim() || null,
            isApproved: true, // Mặc định duyệt luôn, có thể thay đổi thành false nếu cần admin duyệt
        });

        // Trả về review với thông tin user
        return Review.findByPk(review.id, {
            include: [
                { model: User, as: "user", attributes: ["id", "fullName", "email"] },
            ],
        });
    }

    /**
     * Cập nhật đánh giá (chỉ user của review mới được sửa)
     */
    static async updateReview(reviewId, userId, data) {
        const review = await Review.findByPk(reviewId);
        if (!review) return null;

        // Kiểm tra quyền
        if (review.userId !== userId) {
            throw new Error("validation: Bạn không có quyền sửa đánh giá này");
        }

        if (data.rating && (data.rating < 1 || data.rating > 5)) {
            throw new Error("validation: rating phải từ 1 đến 5 sao");
        }

        const updates = {};
        if (data.rating !== undefined) updates.rating = parseInt(data.rating);
        if (data.comment !== undefined) updates.comment = data.comment?.trim() || null;

        await review.update(updates);

        return Review.findByPk(review.id, {
            include: [
                { model: User, as: "user", attributes: ["id", "fullName", "email"] },
            ],
        });
    }

    /**
     * Xóa đánh giá (user hoặc admin)
     */
    static async deleteReview(reviewId, userId, isAdmin = false) {
        const review = await Review.findByPk(reviewId);
        if (!review) return false;

        // Kiểm tra quyền: chỉ admin hoặc chủ review mới xóa được
        if (!isAdmin && review.userId !== userId) {
            throw new Error("validation: Bạn không có quyền xóa đánh giá này");
        }

        await review.destroy();
        return true;
    }

    /**
     * Admin: Lấy tất cả đánh giá (bao gồm chưa duyệt)
     */
    static async getAllReviews({ page = 1, limit = 10, productId, userId, isApproved }) {
        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, parseInt(limit));

        const where = {};
        if (productId) where.productId = parseInt(productId);
        if (userId) where.userId = parseInt(userId);
        if (isApproved !== undefined) where.isApproved = isApproved === "true" || isApproved === true;

        const { count, rows } = await Review.findAndCountAll({
            where,
            include: [
                { model: User, as: "user", attributes: ["id", "fullName", "email"] },
                { model: Product, as: "product", attributes: ["id", "name", "image"] },
            ],
            order: [["createdAt", "DESC"]],
            limit: l,
            offset: (p - 1) * l,
        });

        const totalPages = Math.ceil(count / l) || 1;
        return {
            reviews: rows,
            pagination: {
                currentPage: p,
                totalPages,
                totalItems: count,
                itemsPerPage: l,
            },
        };
    }

    /**
     * Admin: Duyệt/bỏ duyệt đánh giá
     */
    static async toggleApproval(reviewId) {
        const review = await Review.findByPk(reviewId);
        if (!review) return null;

        await review.update({ isApproved: !review.isApproved });
        return review;
    }
}

export default ReviewService;

