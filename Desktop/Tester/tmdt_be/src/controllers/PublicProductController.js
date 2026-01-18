import ProductService from "../services/ProductService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class PublicProductController {
    static async list(req, res) {
        try {
            const { page, limit, search, category, deviceType, minPrice, maxPrice, sortBy, sortOrder } = req.query;
            const data = await ProductService.getPublicProducts({ page, limit, search, category, deviceType, minPrice, maxPrice, sortBy, sortOrder });
            return successResponse(res, "Danh sách sản phẩm", data);
        } catch (err) {
            return errorResponse(res, err.message || "Không lấy được danh sách sản phẩm", 400, err);
        }
    }

    static async detail(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getPublicProductById(id);
            if (!product) return errorResponse(res, "Không tìm thấy sản phẩm", 404);
            return successResponse(res, "Chi tiết sản phẩm", product);
        } catch (err) {
            return errorResponse(res, err.message || "Không lấy được chi tiết sản phẩm", 400, err);
        }
    }

    static async deviceTypes(req, res) {
        try {
            const types = await ProductService.getDeviceTypes();
            return successResponse(res, "Danh sách loại thiết bị y tế", { types });
        } catch (err) {
            return errorResponse(res, err.message || "Không lấy được loại thiết bị", 400, err);
        }
    }

    static async deviceTypeOptions(req, res) {
        try {
            const options = [
                { key: "blood-pressure-monitor", label: "Máy đo huyết áp" },
                { key: "blood-glucose-meter", label: "Máy đo đường huyết" },
                { key: "thermometer", label: "Nhiệt kế" },
                { key: "pulse-oximeter", label: "Máy đo SpO2" },
                { key: "nebulizer", label: "Máy xông khí dung" },
                { key: "wheelchair", label: "Xe lăn" },
                { key: "other", label: "Khác" },
            ];
            return successResponse(res, "Danh sách loại thiết bị y tế (định nghĩa)", { options });
        } catch (err) {
            return errorResponse(res, err.message || "Không lấy được loại thiết bị", 400, err);
        }
    }
}

export default PublicProductController;
