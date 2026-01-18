import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/change-password", authenticateToken, AuthController.changePassword);

export default router;
