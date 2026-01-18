import express from "express";
import OrderController from "../../controllers/OrderController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/authorization.js";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// GET /api/admin/orders
router.get("/orders", (req, res) => OrderController.getOrders(req, res));

// GET /api/admin/orders/:id
router.get("/orders/:id", (req, res) => OrderController.getOrderById(req, res));

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", (req, res) => OrderController.updateOrderStatus(req, res));

// DELETE /api/admin/orders/:id
router.delete("/orders/:id", (req, res) => OrderController.deleteOrder(req, res));

export default router;
