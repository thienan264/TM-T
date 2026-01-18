import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";

// Xác thực JWT: đọc Bearer token và gắn req.user
export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"] || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) return res.status(401).json({ success: false, message: "Yêu cầu đăng nhập" });

        const secret = process.env.JWT_SECRET || "dev_secret";
        const decoded = jwt.verify(token, secret);

        // Lấy user kèm role từ DB, ẩn password
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
        if (!user) return res.status(401).json({ success: false, message: "Token không hợp lệ" });

        req.user = user;
        next();
    } catch (err) {
        const message = err.name === "TokenExpiredError" ? "Token hết hạn" : "Xác thực thất bại";
        return res.status(401).json({ success: false, message });
    }
}
