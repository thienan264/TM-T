import { Router } from "express";
import AnalyticsController from "../../controllers/AnalyticsController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/authorization.js";

const router = Router();

// Tất cả routes yêu cầu admin
router.use(authenticateToken, authorizeRoles("admin"));

router.get("/overview", AnalyticsController.getOverview);
router.get("/revenue-by-month", AnalyticsController.getRevenueByMonth);
router.get("/top-products", AnalyticsController.getTopProducts);
router.get("/orders-by-status", AnalyticsController.getOrdersByStatus);
router.get("/new-customers", AnalyticsController.getNewCustomersByMonth);

export default router;

