import ProductService from "../services/ProductService.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { publicPathFor } from "../middlewares/upload.js";

class ProductController {
    async getAllProducts(req, res) {
        try {
            const result = await ProductService.getAllProducts(req.query || {});
            return successResponse(res, "Lấy danh sách sản phẩm thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy danh sách sản phẩm", 500);
        }
    }

    async createProduct(req, res) {
        try {
            const payload = { ...(req.body || {}) };
            if (req.file) {
                payload.image = publicPathFor(req.file, 'products');
            }
            const created = await ProductService.createProduct(payload);
            return successResponse(res, "Tạo sản phẩm thành công", created, 201);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Lỗi khi tạo sản phẩm", isValidation ? 400 : 500);
        }
    }

    async getProductById(req, res) {
        try {
            const product = await ProductService.getProductById(req.params?.id);
            if (!product) return errorResponse(res, "Không tìm thấy sản phẩm", 404);
            return successResponse(res, "Lấy chi tiết sản phẩm thành công", product);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy chi tiết sản phẩm", 500);
        }
    }

    async updateProduct(req, res) {
        try {
            const updates = { ...(req.body || {}) };
            if (req.file) {
                updates.image = publicPathFor(req.file, 'products');
            }
            const updated = await ProductService.updateProduct(req.params?.id, updates);
            if (!updated) return errorResponse(res, "Không tìm thấy sản phẩm", 404);
            return successResponse(res, "Cập nhật sản phẩm thành công", updated);
        } catch (err) {
            const isValidation = String(err.message || "").startsWith("validation");
            return errorResponse(res, err.message || "Lỗi khi cập nhật sản phẩm", isValidation ? 400 : 500);
        }
    }

    async deleteProduct(req, res) {
        try {
            const ok = await ProductService.deleteProduct(req.params?.id);
            if (!ok) return errorResponse(res, "Không tìm thấy sản phẩm", 404);
            return successResponse(res, "Xóa sản phẩm thành công", { deletedProductId: parseInt(req.params?.id) });
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi xóa sản phẩm", 500);
        }
    }
}

export default new ProductController();
