import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import UserRepository from "../repositories/UserRepository.js";

function paging({ page = 1, limit = 10 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    return { limit: l, offset: (p - 1) * l };
}

async function resolveRoleId({ roleId, roleName }) {
    if (roleId) return parseInt(roleId);
    if (roleName) {
        const role = await UserRepository.Role.findOne({ where: { name: roleName } });
        if (!role) throw new Error("validation: role not found");
        return role.id;
    }
    return undefined;
}

class UserService {
    static async getAllUsers({ page = 1, limit = 10, search = "", roleId, sortBy = "createdAt", sortOrder = "DESC" }) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { email: { [Op.iLike]: `%${search}%` } },
                { fullName: { [Op.iLike]: `%${search}%` } },
            ];
        }
        if (roleId) where.roleId = parseInt(roleId);

        const { limit: l, offset } = paging({ page, limit });

        const { count, rows } = await UserRepository.findAndCountAll({
            where,
            include: [{ model: UserRepository.Role, as: "role", attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
            order: [[sortBy, String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC"]],
            limit: l,
            offset,
        });

        const totalPages = Math.ceil(count / l) || 1;
        return {
            users: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: l,
            },
        };
    }

    static async createUser(data) {
        const { email, password, fullName, phone, address } = data || {};
        if (!email || !password || !fullName) {
            throw new Error("validation: email, password, fullName are required");
        }
        const roleId = await resolveRoleId({ roleId: data.roleId, roleName: data.roleName });
        if (!roleId) throw new Error("validation: role is required (roleId or roleName)");

        const exists = await UserRepository.findOne({ where: { email } });
        if (exists) throw new Error("exists: email already in use");

        const hash = await bcrypt.hash(String(password), 10);
        const created = await UserRepository.create({ email, password: hash, fullName, phone, address, roleId });
        const plain = created.get({ plain: true });
        delete plain.password;
        return plain;
    }

    static async getUserById(id) {
        const userId = parseInt(id);
        if (Number.isNaN(userId)) return null;
        return UserRepository.findByPk(userId, {
            include: [{ model: UserRepository.Role, as: "role", attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
    }

    static async updateUser(id, updates) {
        const user = await UserRepository.findByPk(parseInt(id));
        if (!user) return null;

        const data = {};
        if (updates.email !== undefined) data.email = updates.email;
        if (updates.fullName !== undefined) data.fullName = updates.fullName;
        if (updates.phone !== undefined) data.phone = updates.phone;
        if (updates.address !== undefined) data.address = updates.address;

        if (updates.password) {
            data.password = await bcrypt.hash(String(updates.password), 10);
        }

        if (updates.roleId || updates.roleName) {
            data.roleId = await resolveRoleId({ roleId: updates.roleId, roleName: updates.roleName });
        }

        await UserRepository.updateInstance(user, data);
        const fresh = await UserRepository.findByPk(user.id, {
            include: [{ model: UserRepository.Role, as: "role", attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
        return fresh;
    }

    static async deleteUser(id) {
        const user = await UserRepository.findByPk(parseInt(id));
        if (!user) return false;
        await UserRepository.destroyInstance(user);
        return true;
    }
}

export default UserService;
