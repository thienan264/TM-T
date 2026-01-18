import CouponService from "../services/CouponService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class CouponController {
    // GET /api/admin/coupons
    async getAllCoupons(req, res) {
        try {
            const result = await CouponService.getAllCoupons(req.query || {});
            return successResponse(res, "Lay danh sach ma giam gia thanh cong", result);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay danh sach", 500);
        }
    }

    // GET /api/admin/coupons/:id
    async getCouponById(req, res) {
        try {
            const coupon = await CouponService.getCouponById(req.params?.id);
            if (!coupon) return errorResponse(res, "Khong tim thay ma giam gia", 404);
            return successResponse(res, "Lay chi tiet ma giam gia thanh cong", coupon);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay chi tiet", 500);
        }
    }

    // POST /api/admin/coupons
    async createCoupon(req, res) {
        try {
            const coupon = await CouponService.createCoupon(req.body || {});
            return successResponse(res, "Tao ma giam gia thanh cong", coupon, 201);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Loi khi tao ma giam gia", isValidation ? 400 : 500);
        }
    }

    // PUT /api/admin/coupons/:id
    async updateCoupon(req, res) {
        try {
            const coupon = await CouponService.updateCoupon(req.params?.id, req.body || {});
            if (!coupon) return errorResponse(res, "Khong tim thay ma giam gia", 404);
            return successResponse(res, "Cap nhat ma giam gia thanh cong", coupon);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Loi khi cap nhat", isValidation ? 400 : 500);
        }
    }

    // DELETE /api/admin/coupons/:id
    async deleteCoupon(req, res) {
        try {
            const ok = await CouponService.deleteCoupon(req.params?.id);
            if (!ok) return errorResponse(res, "Khong tim thay ma giam gia", 404);
            return successResponse(res, "Xoa ma giam gia thanh cong", { deletedCouponId: parseInt(req.params?.id) });
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi xoa", 500);
        }
    }

    // POST /api/coupons/validate
    async validateCoupon(req, res) {
        try {
            const { code, orderTotal } = req.body || {};
            const result = await CouponService.validateCoupon(code, Number(orderTotal) || 0);
            return successResponse(res, "Ma giam gia hop le", {
                couponId: result.coupon.id,
                code: result.coupon.code,
                discountType: result.coupon.discountType,
                discountValue: result.coupon.discountValue,
                discountAmount: result.discountAmount,
                finalTotal: result.finalTotal,
            });
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message?.replace("validation: ", "") || "Ma giam gia khong hop le", isValidation ? 400 : 500);
        }
    }
}

export default new CouponController();

