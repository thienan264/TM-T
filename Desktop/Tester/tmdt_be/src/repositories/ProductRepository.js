import { sequelize, Product } from "../models/index.js";
import { Op } from "sequelize";

// Repository layer for Product model
// Keeps all direct ORM calls in one place
const ProductRepository = {
    findAndCountAll: (options) => Product.findAndCountAll(options),
    findByPk: (id, options) => Product.findByPk(id, options),
    create: (data) => Product.create(data),
    updateInstance: (instance, data) => instance.update(data),
    destroyInstance: (instance) => instance.destroy(),

    /**
     * Public search (for storefront) — encapsulates filters, paging, and sorting.
     * If process.env.USE_DB_FUNCTIONS === 'true', will try raw DB function call; otherwise uses ORM.
     * Returns { count, rows } like findAndCountAll for compatibility.
     */
    async searchPublic({ page = 1, limit = 12, search = "", category = "", deviceType = "", minPrice, maxPrice, sortBy = "createdAt", sortOrder = "DESC" }) {
        if (String(process.env.USE_DB_FUNCTIONS).toLowerCase() === "true") {
            // Optional raw path: expects a DB function returning rows with total_count column.
            // CREATE OR REPLACE FUNCTION public.search_products(
            //   p_search text, p_category text, p_min_price numeric, p_max_price numeric,
            //   p_sort_by text, p_sort_order text, p_page int, p_limit int
            // ) RETURNS TABLE(id int, name text, price numeric, image text, category text, createdAt timestamptz, updatedAt timestamptz, total_count bigint)
            // LANGUAGE sql AS $$ ... $$;
            try {
                const [rows] = await sequelize.query(
                    `SELECT * FROM search_products(:search, :category, :min_price, :max_price, :sort_by, :sort_order, :page, :limit)`,
                    {
                        replacements: {
                            search: search || null,
                            category: category || null,
                            min_price: minPrice != null ? Number(minPrice) : null,
                            max_price: maxPrice != null ? Number(maxPrice) : null,
                            sort_by: sortBy,
                            sort_order: String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC",
                            page: Math.max(1, parseInt(page)),
                            limit: Math.max(1, parseInt(limit)),
                        },
                        // map to plain objects
                        plain: false,
                    }
                );
                const count = rows?.[0]?.total_count ? Number(rows[0].total_count) : rows.length;
                return { rows, count };
            } catch (e) {
                // Fallback to ORM if function not found
            }
        }

        // ORM fallback
        const where = {};
        if (search) where.name = { [Op.iLike]: `%${search}%` };
        if (category) where.category = category;
        if (deviceType) where.medicalDeviceType = deviceType;
        if (minPrice != null) where.price = { ...(where.price || {}), [Op.gte]: Number(minPrice) };
        if (maxPrice != null) where.price = { ...(where.price || {}), [Op.lte]: Number(maxPrice) };

        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, parseInt(limit));
        const result = await Product.findAndCountAll({
            where,
            limit: l,
            offset: (p - 1) * l,
            order: [[sortBy, String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC"]],
            attributes: ["id", "name", "price", "image", "category", "brand", "medicalDeviceType", "status", "createdAt", "updatedAt"],
        });
        return result;
    },

    async getDeviceTypes() {
        const rows = await Product.findAll({
            where: { medicalDeviceType: { [Op.ne]: null } },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('medicalDeviceType')), 'medicalDeviceType']],
            raw: true,
        });
        return rows.map(r => r.medicalDeviceType).filter(Boolean);
    },

    /**
     * Admin search — similar to public but returns more fields.
     * Can also be wired to a DB function like search_products_admin.
     */
    async searchAdmin({ page = 1, limit = 10, search = "", category = "", sortBy = "createdAt", sortOrder = "DESC" }) {
        if (String(process.env.USE_DB_FUNCTIONS).toLowerCase() === "true") {
            try {
                const [rows] = await sequelize.query(
                    `SELECT * FROM search_products_admin(:search, :category, :sort_by, :sort_order, :page, :limit)`,
                    {
                        replacements: {
                            search: search || null,
                            category: category || null,
                            sort_by: sortBy,
                            sort_order: String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC",
                            page: Math.max(1, parseInt(page)),
                            limit: Math.max(1, parseInt(limit)),
                        },
                        plain: false,
                    }
                );
                const count = rows?.[0]?.total_count ? Number(rows[0].total_count) : rows.length;
                return { rows, count };
            } catch (e) {
                // fallback
            }
        }

        // ORM fallback
        const where = {};
        if (search) where.name = { [Op.iLike]: `%${search}%` };
        if (category) where.category = category;

        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, parseInt(limit));
        const result = await Product.findAndCountAll({
            where,
            limit: l,
            offset: (p - 1) * l,
            order: [[sortBy, String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC"]],
            attributes: [
                "id",
                "name",
                "price",
                "image",
                "description",
                "category",
                "quantity",
                "cost",
                "profitPercent",
                "weight",
                "brand",
                "modelNumber",
                "warrantyPeriod",
                "certification",
                "specifications",
                "usageInstructions",
                "medicalDeviceType",
                "status",
                "createdAt",
                "updatedAt",
            ],
        });
        return result;
    },
};

export default ProductRepository;
