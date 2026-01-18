import OrderService from "../services/OrderService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class OrderController {
    // GET /api/admin/orders
    async getOrders(req, res) {
        try {
            const result = await OrderService.getOrders(req.query || {});
            return successResponse(res, "Lấy danh sách đơn hàng thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy danh sách đơn hàng", 500);
        }
    }

    // GET /api/admin/orders/:id
    async getOrderById(req, res) {
        try {
            const order = await OrderService.getOrderById(req.params?.id);
            if (!order) return errorResponse(res, "Không tìm thấy đơn hàng", 404);
            return successResponse(res, "Lấy chi tiết đơn hàng thành công", order);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy chi tiết đơn hàng", 500);
        }
    }

    // PATCH /api/admin/orders/:id/status
    async updateOrderStatus(req, res) {
        try {
            const { status } = req.body || {};
            const updated = await OrderService.updateOrderStatus(req.params?.id, status);
            if (!updated) return errorResponse(res, "Không tìm thấy đơn hàng", 404);
            return successResponse(res, "Cập nhật trạng thái đơn hàng thành công", updated);
        } catch (err) {
            const msg = String(err.message || "");
            const statusCode = msg.startsWith("validation") ? 400 : 500;
            return errorResponse(res, err.message || "Lỗi khi cập nhật trạng thái", statusCode);
        }
    }

    // DELETE /api/admin/orders/:id
    async deleteOrder(req, res) {
        try {
            const ok = await OrderService.deleteOrder(req.params?.id);
            if (!ok) return errorResponse(res, "Không tìm thấy đơn hàng", 404);
            return successResponse(res, "Xóa đơn hàng thành công", { deletedOrderId: parseInt(req.params?.id) });
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi xóa đơn hàng", 500);
        }
    }
}

export default new OrderController();
