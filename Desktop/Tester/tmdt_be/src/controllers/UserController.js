import UserService from "../services/UserService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class UserController {
    // GET /api/admin/users
    async getAllUsers(req, res) {
        try {
            const result = await UserService.getAllUsers(req.query || {});
            return successResponse(res, "Lấy danh sách người dùng thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy danh sách người dùng", 500);
        }
    }

    // POST /api/admin/users
    async createUser(req, res) {
        try {
            const created = await UserService.createUser(req.body || {});
            return successResponse(res, "Tạo người dùng thành công", created, 201);
        } catch (err) {
            const msg = String(err.message || "");
            const status = msg.startsWith("validation") ? 400 : msg.startsWith("exists") ? 409 : 500;
            return errorResponse(res, err.message || "Lỗi khi tạo người dùng", status);
        }
    }

    // GET /api/admin/users/:id
    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params?.id);
            if (!user) return errorResponse(res, "Không tìm thấy người dùng", 404);
            return successResponse(res, "Lấy chi tiết người dùng thành công", user);
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi lấy chi tiết người dùng", 500);
        }
    }

    // PUT/PATCH /api/admin/users/:id
    async updateUser(req, res) {
        try {
            const updated = await UserService.updateUser(req.params?.id, req.body || {});
            if (!updated) return errorResponse(res, "Không tìm thấy người dùng", 404);
            return successResponse(res, "Cập nhật người dùng thành công", updated);
        } catch (err) {
            const msg = String(err.message || "");
            const status = msg.startsWith("validation") ? 400 : 500;
            return errorResponse(res, err.message || "Lỗi khi cập nhật người dùng", status);
        }
    }

    // DELETE /api/admin/users/:id
    async deleteUser(req, res) {
        try {
            if (req.user && parseInt(req.params?.id) === req.user.id) {
                return errorResponse(res, "Không thể xóa chính mình", 400);
            }
            const ok = await UserService.deleteUser(req.params?.id);
            if (!ok) return errorResponse(res, "Không tìm thấy người dùng", 404);
            return successResponse(res, "Xóa người dùng thành công", { deletedUserId: parseInt(req.params?.id) });
        } catch (err) {
            return errorResponse(res, err.message || "Lỗi khi xóa người dùng", 500);
        }
    }
}

export default new UserController();
