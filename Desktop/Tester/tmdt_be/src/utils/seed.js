import bcrypt from "bcryptjs";
import { Role, User } from "../models/index.js";

export async function seedInitialData() {
    // Ensure roles
    const roleNames = ["ADMIN", "USER"];
    for (const name of roleNames) {
        await Role.findOrCreate({ where: { name }, defaults: { name } });
    }

    // Optional admin bootstrap via env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Administrator";
    if (adminEmail && adminPassword) {
        const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
        const existing = await User.findOne({ where: { email: adminEmail } });
        if (!existing) {
            const hash = await bcrypt.hash(adminPassword, 10);
            await User.create({ name: adminName, email: adminEmail, password: hash, roleId: adminRole.id });
            console.log(`[seed] Đã tạo tài khoản admin mặc định: ${adminEmail}`);
        }
    }
}
