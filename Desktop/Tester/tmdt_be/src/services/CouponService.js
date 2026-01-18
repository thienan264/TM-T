import { Op } from "sequelize";
import { Coupon } from "../models/index.js";

class CouponService {
    /**
     * Lấy tất cả mã giảm giá (admin)
     */
    static async getAllCoupons({ page = 1, limit = 10, isActive }) {
        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, parseInt(limit));

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === "true" || isActive === true;
        }

        const { count, rows } = await Coupon.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: l,
            offset: (p - 1) * l,
        });

        const totalPages = Math.ceil(count / l) || 1;
        return {
            coupons: rows,
            pagination: {
                currentPage: p,
                totalPages,
                totalItems: count,
                itemsPerPage: l,
            },
        };
    }

    /**
     * Lấy chi tiết mã giảm giá
     */
    static async getCouponById(id) {
        return Coupon.findByPk(parseInt(id));
    }

    /**
     * Tạo mã giảm giá mới
     */
    static async createCoupon(data) {
        // Validate
        if (!data.code) {
            throw new Error("validation: Mã giảm giá không được để trống");
        }
        if (!data.discountValue || Number(data.discountValue) <= 0) {
            throw new Error("validation: Giá trị giảm phải > 0");
        }
        if (data.discountType === "percent" && Number(data.discountValue) > 100) {
            throw new Error("validation: Phần trăm giảm không được vượt quá 100%");
        }

        // Kiểm tra mã đã tồn tại
        const existing = await Coupon.findOne({ where: { code: data.code.toUpperCase() } });
        if (existing) {
            throw new Error("validation: Mã giảm giá đã tồn tại");
        }

        const coupon = await Coupon.create({
            code: data.code.toUpperCase().trim(),
            description: data.description || null,
            discountType: data.discountType || "percent",
            discountValue: Number(data.discountValue),
            minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : 0,
            maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
            usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            isActive: data.isActive !== false,
        });

        return coupon;
    }

    /**
     * Cập nhật mã giảm giá
     */
    static async updateCoupon(id, data) {
        const coupon = await Coupon.findByPk(parseInt(id));
        if (!coupon) return null;

        const updates = {};
        if (data.code !== undefined) {
            // Kiểm tra mã mới không trùng
            const existing = await Coupon.findOne({
                where: { code: data.code.toUpperCase(), id: { [Op.ne]: coupon.id } }
            });
            if (existing) {
                throw new Error("validation: Mã giảm giá đã tồn tại");
            }
            updates.code = data.code.toUpperCase().trim();
        }
        if (data.description !== undefined) updates.description = data.description;
        if (data.discountType !== undefined) updates.discountType = data.discountType;
        if (data.discountValue !== undefined) updates.discountValue = Number(data.discountValue);
        if (data.minOrderValue !== undefined) updates.minOrderValue = Number(data.minOrderValue);
        if (data.maxDiscount !== undefined) updates.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null;
        if (data.usageLimit !== undefined) updates.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;
        if (data.startDate !== undefined) updates.startDate = data.startDate || null;
        if (data.endDate !== undefined) updates.endDate = data.endDate || null;
        if (data.isActive !== undefined) updates.isActive = data.isActive;

        await coupon.update(updates);
        return coupon;
    }

    /**
     * Xóa mã giảm giá
     */
    static async deleteCoupon(id) {
        const coupon = await Coupon.findByPk(parseInt(id));
        if (!coupon) return false;
        await coupon.destroy();
        return true;
    }

    /**
     * Kiểm tra và áp dụng mã giảm giá
     */
    static async validateCoupon(code, orderTotal) {
        if (!code) {
            throw new Error("validation: Vui lòng nhập mã giảm giá");
        }

        const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
        if (!coupon) {
            throw new Error("validation: Mã giảm giá không tồn tại");
        }

        // Kiểm tra trạng thái
        if (!coupon.isActive) {
            throw new Error("validation: Mã giảm giá đã bị vô hiệu hóa");
        }

        // Kiểm tra thời hạn
        const now = new Date();
        if (coupon.startDate && new Date(coupon.startDate) > now) {
            throw new Error("validation: Mã giảm giá chưa có hiệu lực");
        }
        if (coupon.endDate && new Date(coupon.endDate) < now) {
            throw new Error("validation: Mã giảm giá đã hết hạn");
        }

        // Kiểm tra số lần sử dụng
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error("validation: Mã giảm giá đã hết lượt sử dụng");
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
            throw new Error(`validation: Đơn hàng tối thiểu ${Number(coupon.minOrderValue).toLocaleString('vi-VN')}đ để áp dụng mã này`);
        }

        // Tính số tiền giảm
        let discountAmount = 0;
        if (coupon.discountType === "percent") {
            discountAmount = (orderTotal * coupon.discountValue) / 100;
            // Áp dụng giới hạn giảm tối đa
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = Number(coupon.maxDiscount);
            }
        } else {
            // Giảm cố định
            discountAmount = Number(coupon.discountValue);
        }

        // Không giảm quá tổng đơn hàng
        if (discountAmount > orderTotal) {
            discountAmount = orderTotal;
        }

        return {
            coupon,
            discountAmount: Math.round(discountAmount * 100) / 100,
            finalTotal: Math.round((orderTotal - discountAmount) * 100) / 100,
        };
    }

    /**
     * Tăng số lần sử dụng
     */
    static async incrementUsage(couponId) {
        const coupon = await Coupon.findByPk(couponId);
        if (coupon) {
            await coupon.update({ usedCount: coupon.usedCount + 1 });
        }
    }
}

export default CouponService;

