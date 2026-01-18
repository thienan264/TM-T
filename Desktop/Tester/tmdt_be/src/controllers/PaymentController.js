import PaymentService from "../services/PaymentService.js";
import OrderService from "../services/OrderService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class PaymentController {
  static async createVnPay(req, res) {
    try {
      const { orderId } = req.body || {};
      if (!orderId) return errorResponse(res, "Thiếu orderId", 400);

            const order = await OrderService.getOrderById(orderId);
            if (!order) return errorResponse(res, "Không tìm thấy đơn hàng", 404);

            // Optional: ensure the user owns the order or is admin
            if (req.user && req.user.role?.name !== "ADMIN") {
                if (Number(order.userId) !== Number(req.user.id)) {
                    return errorResponse(res, "Bạn không có quyền thanh toán đơn này", 403);
                }
            }

      // Lưu ý: vnp_OrderType phải thuộc danh mục VNPAY (ví dụ: "other").
      // vnp_IpAddr yêu cầu IPv4 hợp lệ; để sandbox ổn định, truyền 127.0.0.1.
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const returnUrl = process.env.VNP_RETURN_URL || `${baseUrl}/api/payments/vnpay/return`;

      // Kiểm tra cấu hình bắt buộc
      const missing = [];
      if (!process.env.VNP_TMN_CODE) missing.push("VNP_TMN_CODE");
      if (!process.env.VNP_HASH_SECRET) missing.push("VNP_HASH_SECRET");
      if (missing.length) {
        return errorResponse(res, `Thiếu cấu hình VNPAY: ${missing.join(", ")}`, 500);
      }

      const paymentUrl = PaymentService.buildPaymentUrl({
        amount: order.totalPrice,
        orderId: order.id,
        ipAddr: "127.0.0.1",
        orderInfo: `Order ${order.id}`,
        locale: "vn",
        returnUrl,
      });

            return successResponse(res, "Tạo URL thanh toán thành công", { paymentUrl });
    } catch (err) {
      return errorResponse(res, err.message || "Không tạo được URL thanh toán", 500, err);
    }
  }

    static async vnpReturn(req, res) {
        try {
            const params = req.query || {};
            const valid = PaymentService.verifySignature(params);
            if (!valid) return errorResponse(res, "Chữ ký không hợp lệ", 400);

            // Best-effort: nếu IPN không về, có thể chốt đơn tại return khi ResponseCode=00
            const data = {
                vnp_ResponseCode: params.vnp_ResponseCode,
                vnp_TxnRef: params.vnp_TxnRef,
                vnp_Amount: params.vnp_Amount,
                vnp_TransactionNo: params.vnp_TransactionNo,
                updatedByReturn: false,
            };

            if (params.vnp_ResponseCode === "00") {
                try {
                    const orderId = parseInt(params.vnp_TxnRef);
                    const amount = Number(params.vnp_Amount || 0) / 100;
                    if (!Number.isNaN(orderId)) {
                        const order = await OrderService.getOrderById(orderId);
                        if (order && Number(order.totalPrice) === Number(amount)) {
                            if (String(order.status).toUpperCase() !== "COMPLETE") {
                                await OrderService.updateOrderStatus(order.id, "COMPLETE");
                                data.updatedByReturn = true;
                            }
                        }
                    }
                } catch (e) {
                    // không block trả về cho user
                    console.warn("[VNPAY] return fallback update failed", e?.message || e);
                }
            }

            return successResponse(res, "Xác nhận từ VNPAY", data);
        } catch (err) {
            return errorResponse(res, "Lỗi xử lý return", 500, err);
        }
    }

    static async vnpIpn(req, res) {
        try {
            const params = req.body && Object.keys(req.body).length ? req.body : req.query;
            const valid = PaymentService.verifySignature(params);
            if (!valid) return res.json({ RspCode: "97", Message: "Signature invalid" });

            const rspCode = params.vnp_ResponseCode;
            const orderId = parseInt(params.vnp_TxnRef);
            const amount = Number(params.vnp_Amount || 0) / 100;

            const order = await OrderService.getOrderById(orderId);
            if (!order) return res.json({ RspCode: "01", Message: "Order not found" });

            if (Number(order.totalPrice) !== Number(amount)) {
                return res.json({ RspCode: "04", Message: "Amount invalid" });
            }

            if (rspCode === "00") {
                // Idempotent: nếu đã COMPLETE thì đáp ứng success luôn
                if (String(order.status).toUpperCase() !== "COMPLETE") {
                    await OrderService.updateOrderStatus(order.id, "COMPLETE");
                }
                return res.json({ RspCode: "00", Message: "Success" });
            } else {
                // Có thể cập nhật state khác tuỳ business
                return res.json({ RspCode: "00", Message: "Received" });
            }
        } catch (err) {
            return res.json({ RspCode: "99", Message: "Error" });
        }
    }
}

export default PaymentController;
