import express from "express";
import CartController from "../controllers/CartController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// All cart endpoints require authentication
router.use(authenticateToken);

// GET /api/cart
router.get("/", (req, res) => CartController.getCart(req, res));

// POST /api/cart/items
router.post("/items", (req, res) => CartController.addItem(req, res));

// PATCH /api/cart/items/:id
router.patch("/items/:id", (req, res) => CartController.updateItem(req, res));

// DELETE /api/cart/items/:id
router.delete("/items/:id", (req, res) => CartController.removeItem(req, res));

// POST /api/cart/checkout - Đặt hàng (trừ kho)
router.post("/checkout", (req, res) => CartController.checkout(req, res));

export default router;
