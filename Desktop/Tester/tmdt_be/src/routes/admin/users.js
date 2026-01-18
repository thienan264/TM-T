import express from "express";
import UserController from "../../controllers/UserController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { requireAdmin } from "../../middlewares/authorization.js";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// GET /api/admin/users
router.get("/users", (req, res) => UserController.getAllUsers(req, res));

// POST /api/admin/users
router.post("/users", (req, res) => UserController.createUser(req, res));

// GET /api/admin/users/:id
router.get("/users/:id", (req, res) => UserController.getUserById(req, res));

// PUT /api/admin/users/:id
router.put("/users/:id", (req, res) => UserController.updateUser(req, res));

// PATCH /api/admin/users/:id
router.patch("/users/:id", (req, res) => UserController.updateUser(req, res));

// DELETE /api/admin/users/:id
router.delete("/users/:id", (req, res) => UserController.deleteUser(req, res));

export default router;
