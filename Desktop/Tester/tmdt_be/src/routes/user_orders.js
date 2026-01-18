import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { successResponse, errorResponse } from "../utils/response.js";
import OrderService from "../services/OrderService.js";

const router = Router();
router.use(authenticateToken);

router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    if (parseInt(order.userId) !== parseInt(req.user.id)) return errorResponse(res, 'Không có quyền', 403);
    const updated = await OrderService.updateOrderStatus(id, 'CANCEL');
    return successResponse(res, 'Đã hủy đơn hàng', updated);
  } catch (err) {
    return errorResponse(res, err.message || 'Không hủy được đơn', 400, err);
  }
});

export default router;
