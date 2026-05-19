import { Router } from "express";
import {
  getAdminPendingWorkflows,
  getPendingWorkflows,
  getWorkflowHistory,
  updateAdminWorkflowStatus,
  updateWorkflowStatus,
} from "../controllers/workflow.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/pending", getPendingWorkflows);
router.get("/history", getWorkflowHistory);
router.post("/:id/action", updateWorkflowStatus);
router.get("/admin/pending", requireAdmin, getAdminPendingWorkflows);
router.post("/admin/:id/action", requireAdmin, updateAdminWorkflowStatus);

export default router;
