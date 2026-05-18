import { Router } from "express";
import { createEmployee } from "../controllers/admin.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// Secure all admin routes
router.use(requireAuth, requireAdmin);

router.post("/users", createEmployee);

export default router;
