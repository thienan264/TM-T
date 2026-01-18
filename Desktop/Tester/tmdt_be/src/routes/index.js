import express from "express";
import adminProductRoutes from "./admin/products.js";
import adminUserRoutes from "./admin/users.js";
import adminOrderRoutes from "./admin/orders.js";
import adminReviewRoutes from "./admin/reviews.js";
import adminAnalyticsRoutes from "./admin/analytics.js";
import adminCouponRoutes from "./admin/coupons.js";
import adminBannerRoutes from "./admin/banners.js";
import authRoutes from "./auth.js";
import couponRoutes from "./coupons.js";
import publicProductRoutes from "./products.js";
import cartRoutes from "./cart.js";
import paymentsRoutes from "./payments.js";
import reviewRoutes from "./reviews.js";
import ordersRoutes from "./orders.js";
import userOrdersRoutes from "./user_orders.js";
import bannersRoutes from "./banners.js";

const router = express.Router();

// Mount group routes
router.use("/admin", adminProductRoutes);
router.use("/admin", adminUserRoutes);
router.use("/admin", adminOrderRoutes);
router.use("/admin/reviews", adminReviewRoutes);
router.use("/admin/analytics", adminAnalyticsRoutes);
router.use("/admin/coupons", adminCouponRoutes);
router.use("/admin/banners", adminBannerRoutes);
router.use("/auth", authRoutes);
router.use("/coupons", couponRoutes);
router.use("/products", publicProductRoutes);
router.use("/banners", bannersRoutes);
router.use("/cart", cartRoutes);
router.use("/payments", paymentsRoutes);
router.use("/", reviewRoutes);
router.use("/orders", ordersRoutes);
router.use("/user-orders", userOrdersRoutes);

export default router;
