import AnalyticsService from "../services/AnalyticsService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class AnalyticsController {
    // GET /api/admin/analytics/overview
    async getOverview(req, res) {
        try {
            const data = await AnalyticsService.getOverview();
            return successResponse(res, "Lay thong ke tong quan thanh cong", data);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay thong ke", 500);
        }
    }

    // GET /api/admin/analytics/revenue-by-month
    async getRevenueByMonth(req, res) {
        try {
            const data = await AnalyticsService.getRevenueByMonth();
            return successResponse(res, "Lay thong ke doanh thu theo thang thanh cong", data);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay thong ke", 500);
        }
    }

    // GET /api/admin/analytics/top-products
    async getTopProducts(req, res) {
        try {
            const limit = req.query?.limit || 10;
            const data = await AnalyticsService.getTopProducts(limit);
            return successResponse(res, "Lay top san pham ban chay thanh cong", data);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay thong ke", 500);
        }
    }

    // GET /api/admin/analytics/orders-by-status
    async getOrdersByStatus(req, res) {
        try {
            const data = await AnalyticsService.getOrdersByStatus();
            return successResponse(res, "Lay thong ke don hang theo trang thai thanh cong", data);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay thong ke", 500);
        }
    }

    // GET /api/admin/analytics/new-customers
    async getNewCustomersByMonth(req, res) {
        try {
            const data = await AnalyticsService.getNewCustomersByMonth();
            return successResponse(res, "Lay thong ke khach hang moi thanh cong", data);
        } catch (err) {
            return errorResponse(res, err.message || "Loi khi lay thong ke", 500);
        }
    }
}

export default new AnalyticsController();

