import { Router } from "express";
import PublicProductController from "../controllers/PublicProductController.js";

const router = Router();

router.get("/", PublicProductController.list);
router.get("/device-types", PublicProductController.deviceTypes);
router.get("/device-type-options", PublicProductController.deviceTypeOptions);
router.get("/:id", PublicProductController.detail);

export default router;
