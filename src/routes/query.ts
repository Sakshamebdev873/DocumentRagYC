import { Router } from "express";
import { executeQuery } from "../controllers/query.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.post("/", executeQuery);

export default router;
