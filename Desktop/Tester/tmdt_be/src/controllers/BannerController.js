import { Banner } from "../models/index.js";
import { publicPathFor } from "../middlewares/upload.js";
import { successResponse, errorResponse } from "../utils/response.js";

export default class BannerController {
  static async listPublic(req, res) {
    try {
      const position = req.query.position || "home";
      const rows = await Banner.findAll({
        where: { position, isActive: true },
        order: [["order", "ASC"], ["createdAt", "DESC"]],
        attributes: ["id", "title", "image", "link", "position", "order"],
      });
      return successResponse(res, "Danh sách banner", { banners: rows });
    } catch (err) {
      return errorResponse(res, err.message || "Không lấy được banner", 400, err);
    }
  }

  static async listAdmin(req, res) {
    try {
      const rows = await Banner.findAll({ order: [["order", "ASC"], ["createdAt", "DESC"]] });
      return successResponse(res, "Danh sách banner (admin)", { banners: rows });
    } catch (err) {
      return errorResponse(res, err.message || "Không lấy được banner", 400, err);
    }
  }

  static async create(req, res) {
    try {
      const { title, link, position = "home", order = 0 } = req.body;
      const image = req.file ? publicPathFor(req.file, 'banners') : (req.body.image || null);
      if (!image) return errorResponse(res, "Thiếu image", 400);
      const b = await Banner.create({ title, link, position, order: parseInt(order) || 0, image, isActive: true });
      return successResponse(res, "Tạo banner thành công", b);
    } catch (err) {
      return errorResponse(res, err.message || "Không tạo được banner", 400, err);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const b = await Banner.findByPk(id);
      if (!b) return errorResponse(res, "Không tìm thấy banner", 404);
      const { title, link, position, order, isActive } = req.body;
      const image = req.file ? publicPathFor(req.file, 'banners') : undefined;
      await b.update({
        title: title ?? b.title,
        link: link ?? b.link,
        position: position ?? b.position,
        order: order !== undefined ? parseInt(order) || 0 : b.order,
        isActive: isActive !== undefined ? String(isActive).toLowerCase() === "true" : b.isActive,
        image: image ?? b.image,
      });
      return successResponse(res, "Cập nhật banner thành công", b);
    } catch (err) {
      return errorResponse(res, err.message || "Không cập nhật được banner", 400, err);
    }
  }

  static async remove(req, res) {
    try {
      const { id } = req.params;
      const b = await Banner.findByPk(id);
      if (!b) return errorResponse(res, "Không tìm thấy banner", 404);
      await b.destroy();
      return successResponse(res, "Xóa banner thành công", { id });
    } catch (err) {
      return errorResponse(res, err.message || "Không xóa được banner", 400, err);
    }
  }
}
