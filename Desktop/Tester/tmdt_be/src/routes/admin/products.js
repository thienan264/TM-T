import express from "express";
import ProductController from "../../controllers/ProductController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/authorization.js";
import { uploadProductImage } from "../../middlewares/upload.js";

const router = express.Router();

// Bảo vệ toàn bộ admin product routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/products
router.get("/products", (req, res) => ProductController.getAllProducts(req, res));

// POST /api/admin/products
router.post("/products", uploadProductImage.single('image'), (req, res) => ProductController.createProduct(req, res));

// GET /api/admin/products/:id
router.get("/products/:id", (req, res) => ProductController.getProductById(req, res));

// PUT /api/admin/products/:id
router.put("/products/:id", uploadProductImage.single('image'), (req, res) => ProductController.updateProduct(req, res));

// PATCH /api/admin/products/:id
router.patch("/products/:id", uploadProductImage.single('image'), (req, res) => ProductController.updateProduct(req, res));

// DELETE /api/admin/products/:id
router.delete("/products/:id", (req, res) => ProductController.deleteProduct(req, res));

export default router;
