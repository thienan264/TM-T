import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import OrderService from "../services/OrderService.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const { page, limit, status, sortBy, sortOrder } = req.query;
    const data = await OrderService.getOrders({ page, limit, status, userId: req.user.id, sortBy, sortOrder });
    return successResponse(res, "Danh sách đơn hàng của tôi", data);
  } catch (err) {
    return errorResponse(res, err.message || "Không lấy được danh sách đơn hàng", 400, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) return errorResponse(res, "Không tìm thấy đơn hàng", 404);
    if (parseInt(order.userId) !== parseInt(req.user.id)) return errorResponse(res, "Không có quyền truy cập", 403);
    return successResponse(res, "Chi tiết đơn hàng", order);
  } catch (err) {
    return errorResponse(res, err.message || "Không lấy được đơn hàng", 400, err);
  }
});

export default router;
