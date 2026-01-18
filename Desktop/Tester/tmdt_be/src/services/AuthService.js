import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export default class AuthService {
    static async register({ name, fullName, email, password, roleName = "USER" }) {
        const exists = await User.findOne({ where: { email } });
        if (exists) {
            const err = new Error("Email đã được sử dụng");
            err.status = 400;
            throw err;
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            const err = new Error("Role không hợp lệ");
            err.status = 400;
            throw err;
        }

        const displayName = (fullName ?? name ?? "").trim();
        if (!displayName) {
            const err = new Error("Họ và tên là bắt buộc");
            err.status = 400;
            throw err;
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName: displayName, email, password: hashed, roleId: role.id });
        const token = this._signToken(user);
        const safeUser = { id: user.id, fullName: user.fullName, email: user.email, role: role.name };
        return { user: safeUser, token };
    }

    static async login({ email, password }) {
        const user = await User.findOne({ where: { email }, include: [{ model: Role, as: "role" }] });
        if (!user) {
            const err = new Error("Thông tin đăng nhập không đúng");
            err.status = 401;
            throw err;
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            const err = new Error("Thông tin đăng nhập không đúng");
            err.status = 401;
            throw err;
        }
        const token = this._signToken(user);
        const safeUser = { id: user.id, fullName: user.fullName, email: user.email, role: user.role?.name };
        return { user: safeUser, token };
    }

    static _signToken(user) {
        return jwt.sign({ id: user.id, email: user.email, roleId: user.roleId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    static async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) {
            const err = new Error("Không tìm thấy người dùng");
            err.status = 404;
            throw err;
        }
        const ok = await bcrypt.compare(oldPassword, user.password);
        if (!ok) {
            const err = new Error("Mật khẩu hiện tại không đúng");
            err.status = 400;
            throw err;
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();
        return { message: "Đổi mật khẩu thành công" };
    }
}
