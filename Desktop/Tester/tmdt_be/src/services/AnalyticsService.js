import { Op, fn, col, literal } from "sequelize";
import { sequelize, Order, OrderDetail, User, Product, Role } from "../models/index.js";

class AnalyticsService {
    /**
     * Lấy tổng quan thống kê
     */
    static async getOverview() {
        // Tổng doanh thu (đơn hàng COMPLETE)
        const revenueResult = await Order.findOne({
            where: { status: "COMPLETE" },
            attributes: [[fn("SUM", col("totalPrice")), "totalRevenue"]],
            raw: true,
        });
        const totalRevenue = Number(revenueResult?.totalRevenue) || 0;

        // Tổng số đơn hàng
        const totalOrders = await Order.count();

        // Đơn hàng hoàn thành
        const completedOrders = await Order.count({ where: { status: "COMPLETE" } });

        // Đơn hàng đang chờ
        const pendingOrders = await Order.count({ where: { status: "PENDING" } });

        // Tổng số sản phẩm đã bán (từ đơn hàng COMPLETE)
        const soldResult = await OrderDetail.findOne({
            include: [{
                model: Order,
                as: "order",
                where: { status: "COMPLETE" },
                attributes: [],
            }],
            attributes: [[fn("SUM", col("OrderDetail.quantity")), "totalSold"]],
            raw: true,
        });
        const totalProductsSold = Number(soldResult?.totalSold) || 0;

        // Tổng số khách hàng (role = customer hoặc user)
        const customerRole = await Role.findOne({ where: { name: { [Op.in]: ["customer", "user"] } } });
        const totalCustomers = customerRole
            ? await User.count({ where: { roleId: customerRole.id } })
            : await User.count();

        // Tổng số sản phẩm trong kho
        const totalProducts = await Product.count();

        return {
            totalRevenue,
            totalOrders,
            completedOrders,
            pendingOrders,
            totalProductsSold,
            totalCustomers,
            totalProducts,
        };
    }

    /**
     * Thống kê doanh thu theo tháng (12 tháng gần nhất)
     */
    static async getRevenueByMonth() {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const results = await Order.findAll({
            where: {
                status: "COMPLETE",
                createdAt: { [Op.gte]: twelveMonthsAgo },
            },
            attributes: [
                [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
                [fn("SUM", col("totalPrice")), "revenue"],
                [fn("COUNT", col("id")), "orderCount"],
            ],
            group: [fn("DATE_TRUNC", "month", col("createdAt"))],
            order: [[fn("DATE_TRUNC", "month", col("createdAt")), "ASC"]],
            raw: true,
        });

        // Tạo mảng 12 tháng với dữ liệu
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
            const found = results.find(r => {
                const rMonth = new Date(r.month).toISOString().slice(0, 7);
                return rMonth === monthKey;
            });
            months.push({
                month: monthKey,
                label: `T${d.getMonth() + 1}/${d.getFullYear()}`,
                revenue: found ? Number(found.revenue) : 0,
                orderCount: found ? Number(found.orderCount) : 0,
            });
        }

        return months;
    }

    /**
     * Top sản phẩm bán chạy
     */
    static async getTopProducts(limit = 10) {
        const results = await OrderDetail.findAll({
            include: [
                {
                    model: Order,
                    as: "order",
                    where: { status: "COMPLETE" },
                    attributes: [],
                },
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "image", "price"],
                },
            ],
            attributes: [
                "productId",
                [fn("SUM", col("OrderDetail.quantity")), "totalSold"],
                [fn("SUM", col("OrderDetail.subtotal")), "totalRevenue"],
            ],
            group: ["productId", "product.id"],
            order: [[fn("SUM", col("OrderDetail.quantity")), "DESC"]],
            limit: parseInt(limit),
            raw: false,
        });

        return results.map(r => ({
            productId: r.productId,
            product: r.product,
            totalSold: Number(r.get("totalSold")) || 0,
            totalRevenue: Number(r.get("totalRevenue")) || 0,
        }));
    }

    /**
     * Thống kê đơn hàng theo trạng thái
     */
    static async getOrdersByStatus() {
        const results = await Order.findAll({
            attributes: [
                "status",
                [fn("COUNT", col("id")), "count"],
            ],
            group: ["status"],
            raw: true,
        });

        const statusMap = {
            PENDING: "Chờ xử lý",
            SHIPPING: "Đang giao",
            COMPLETE: "Hoàn thành",
            CANCEL: "Đã hủy",
        };

        return results.map(r => ({
            status: r.status,
            label: statusMap[r.status] || r.status,
            count: Number(r.count),
        }));
    }

    /**
     * Khách hàng mới theo tháng (6 tháng gần nhất)
     */
    static async getNewCustomersByMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const results = await User.findAll({
            where: {
                createdAt: { [Op.gte]: sixMonthsAgo },
            },
            attributes: [
                [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
                [fn("COUNT", col("id")), "count"],
            ],
            group: [fn("DATE_TRUNC", "month", col("createdAt"))],
            order: [[fn("DATE_TRUNC", "month", col("createdAt")), "ASC"]],
            raw: true,
        });

        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = d.toISOString().slice(0, 7);
            const found = results.find(r => {
                const rMonth = new Date(r.month).toISOString().slice(0, 7);
                return rMonth === monthKey;
            });
            months.push({
                month: monthKey,
                label: `T${d.getMonth() + 1}`,
                count: found ? Number(found.count) : 0,
            });
        }

        return months;
    }
}

export default AnalyticsService;

