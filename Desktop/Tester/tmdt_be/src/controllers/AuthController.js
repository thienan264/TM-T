import AuthService from "../services/AuthService.js";
import { successResponse, errorResponse } from "../utils/response.js";

class AuthController {
    static async register(req, res) {
        try {
            const { name, fullName, email, password } = req.body;
            const result = await AuthService.register({ name, fullName, email, password });
            return successResponse(res, "Đăng ký thành công", result, 201);
        } catch (err) {
            return errorResponse(res, err.message || "Đăng ký thất bại", err.status || 400, err);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            return successResponse(res, "Đăng nhập thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Đăng nhập thất bại", err.status || 401, err);
        }
    }

    static async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return errorResponse(res, "Thiếu thông tin mật khẩu", 400);
            }
            const result = await AuthService.changePassword(userId, oldPassword, newPassword);
            return successResponse(res, "Đổi mật khẩu thành công", result);
        } catch (err) {
            return errorResponse(res, err.message || "Đổi mật khẩu thất bại", err.status || 400, err);
        }
    }
}

export default AuthController;
