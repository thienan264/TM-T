// Note: Query construction is delegated to the repository layer
import ProductRepository from "../repositories/ProductRepository.js";

function buildPaging({ page = 1, limit = 10 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    return { limit: l, offset: (p - 1) * l };
}

class ProductService {
    static async getPublicProducts({ page = 1, limit = 12, search = "", category = "", deviceType = "", minPrice, maxPrice, sortBy = "createdAt", sortOrder = "DESC" }) {
        const { count, rows } = await ProductRepository.searchPublic({ page, limit, search, category, deviceType, minPrice, maxPrice, sortBy, sortOrder });
        const { limit: l } = buildPaging({ page, limit });
        const totalPages = Math.ceil(count / l) || 1;
        return {
            products: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: l,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
            },
        };
    }

    static async getPublicProductById(id) {
        return this.getProductById(id);
    }
    static async getAllProducts({ page = 1, limit = 10, search = "", category = "", sortBy = "createdAt", sortOrder = "DESC" }) {
        const { count, rows } = await ProductRepository.searchAdmin({ page, limit, search, category, sortBy, sortOrder });
        const { limit: l } = buildPaging({ page, limit });
        const totalPages = Math.ceil(count / l) || 1;
        return {
            products: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: l,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
            },
        };
    }

    static async getDeviceTypes() {
        const types = await ProductRepository.getDeviceTypes();
        return types;
    }

    static async createProduct(data) {
        if (!data?.name || !data?.price) {
            throw new Error("validation: name and price are required");
        }
        if (Number(data.price) <= 0) {
            throw new Error("validation: price must be > 0");
        }

        const toInt = (v, def = null) => {
            if (v === undefined || v === null || String(v).trim() === "") return def;
            const n = parseInt(v);
            return Number.isNaN(n) ? def : n;
        };
        const toNum = (v, def = null) => {
            if (v === undefined || v === null || String(v).trim() === "") return def;
            const n = Number(v);
            return Number.isNaN(n) ? def : n;
        };

        const payload = {
            name: String(data.name).trim(),
            price: toNum(data.price, null),
            image: data.image || null,
            description: data.description || null,
            category: data.category || null,
            quantity: toInt(data.quantity, 0),
            cost: toNum(data.cost, null),
            profitPercent: toNum(data.profitPercent, null),
            weight: toNum(data.weight, null),
            // Thông tin thiết bị y tế
            brand: data.brand || null,
            modelNumber: data.modelNumber || null,
            warrantyPeriod: toInt(data.warrantyPeriod, null),
            certification: data.certification || null,
            specifications: data.specifications || null,
            usageInstructions: data.usageInstructions || null,
            medicalDeviceType: data.medicalDeviceType || null,
            status: data.status || "active",
        };

        const created = await ProductRepository.create(payload);
        return created;
    }

    static async getProductById(id) {
        const productId = parseInt(id);
        if (Number.isNaN(productId)) return null;
        return ProductRepository.findByPk(productId);
    }

    static async updateProduct(id, updates) {
        const product = await this.getProductById(id);
        if (!product) return null;

        if (updates.price != null && Number(updates.price) <= 0) {
            throw new Error("validation: price must be > 0");
        }
        if (updates.quantity != null && Number(updates.quantity) < 0) {
            throw new Error("validation: quantity must be >= 0");
        }

        const toInt = (v, def = null) => {
            if (v === undefined || v === null || String(v).trim() === "") return def;
            const n = parseInt(v);
            return Number.isNaN(n) ? def : n;
        };
        const toNum = (v, def = null) => {
            if (v === undefined || v === null || String(v).trim() === "") return def;
            const n = Number(v);
            return Number.isNaN(n) ? def : n;
        };

        const data = {};
        if (updates.name !== undefined) data.name = String(updates.name).trim();
        if (updates.price !== undefined) data.price = toNum(updates.price, undefined);
        if (updates.image !== undefined) data.image = updates.image;
        if (updates.description !== undefined) data.description = updates.description;
        if (updates.category !== undefined) data.category = updates.category;
        if (updates.quantity !== undefined) {
            const q = toInt(updates.quantity, undefined);
            if (q !== undefined) data.quantity = q;
        }
        if (updates.cost !== undefined) data.cost = toNum(updates.cost, null);
        if (updates.profitPercent !== undefined) data.profitPercent = toNum(updates.profitPercent, null);
        if (updates.weight !== undefined) data.weight = toNum(updates.weight, null);
        // Thông tin thiết bị y tế
        if (updates.brand !== undefined) data.brand = updates.brand;
        if (updates.modelNumber !== undefined) data.modelNumber = updates.modelNumber;
        if (updates.warrantyPeriod !== undefined) data.warrantyPeriod = toInt(updates.warrantyPeriod, null);
        if (updates.certification !== undefined) data.certification = updates.certification;
        if (updates.specifications !== undefined) data.specifications = updates.specifications;
        if (updates.usageInstructions !== undefined) data.usageInstructions = updates.usageInstructions;
        if (updates.medicalDeviceType !== undefined) data.medicalDeviceType = updates.medicalDeviceType;
        if (updates.status !== undefined) data.status = updates.status;

        await ProductRepository.updateInstance(product, data);
        return product;
    }

    static async deleteProduct(id) {
        const product = await this.getProductById(id);
        if (!product) return false;
        await ProductRepository.destroyInstance(product);
        return true;
    }
}

export default ProductService;
