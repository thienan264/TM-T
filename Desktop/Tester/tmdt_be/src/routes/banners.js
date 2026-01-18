import { Router } from "express";
import BannerController from "../controllers/BannerController.js";

const router = Router();

router.get("/", BannerController.listPublic);

export default router;
