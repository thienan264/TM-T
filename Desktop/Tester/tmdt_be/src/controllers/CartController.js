import CartService from "../services/CartService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class CartController {
    // GET /api/cart
    async getCart(req, res) {
        try {
            const userId = req.user.id;
            const cart = await CartService.getActiveCart(userId);
            return successResponse(res, "Lấy giỏ hàng thành công", cart || { cartDetails: [] });
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy giỏ hàng", 500);
        }
    }

    // POST /api/cart/items
    async addItem(req, res) {
        try {
            const userId = req.user.id;
            const { productId, quantity } = req.body || {};
            if (!productId) return errorResponse(res, "Thiếu productId", 400);
            const cart = await CartService.addItem(userId, productId, quantity || 1);
            return successResponse(res, "Thêm vào giỏ hàng thành công", cart);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi thêm vào giỏ hàng", 400);
        }
    }

    // PATCH /api/cart/items/:id
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body || {};
            if (typeof quantity === 'undefined') return errorResponse(res, 'Thiếu quantity', 400);
            await CartService.updateItem(id, quantity);
            return successResponse(res, 'Cập nhật giỏ hàng thành công', true);
        } catch (err) {
            return errorResponse(res, err.message || 'Lỗi khi cập nhật giỏ hàng', 400);
        }
    }

    // DELETE /api/cart/items/:id
    async removeItem(req, res) {
        try {
            const { id } = req.params;
            const ok = await CartService.removeItem(id);
            if (!ok) return errorResponse(res, 'Mục giỏ hàng không tồn tại', 404);
            return successResponse(res, 'Xóa mục khỏi giỏ hàng thành công', { deletedId: parseInt(id) });
        } catch (err) {
            return errorResponse(res, err.message || 'Lỗi khi xóa mục giỏ hàng', 400);
        }
    }

    // POST /api/cart/checkout
    async checkout(req, res) {
        try {
            const userId = req.user.id;
            const checkoutData = req.body || {};
            const order = await CartService.checkout(userId, checkoutData);
            return successResponse(res, 'Đặt hàng thành công', order);
        } catch (err) {
            return errorResponse(res, err.message || 'Lỗi khi đặt hàng', 400);
        }
    }
}

export default new CartController();
