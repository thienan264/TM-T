import { Router } from "express";
import BannerController from "../../controllers/BannerController.js";
import { authenticateToken } from "../../middlewares/auth.js";
import { authorizeRoles } from "../../middlewares/authorization.js";
import multer from "multer";
import { uploadBannerImage } from "../../middlewares/upload.js";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

router.get("/", BannerController.listAdmin);
router.post("/", uploadBannerImage.single("image"), BannerController.create);
router.put("/:id", uploadBannerImage.single("image"), BannerController.update);
router.delete("/:id", BannerController.remove);

export default router;
