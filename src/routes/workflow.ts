import { Router } from "express";
import { getPendingWorkflows, updateWorkflowStatus } from "../controllers/workflow.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/pending", getPendingWorkflows);
router.post("/:id/action", updateWorkflowStatus);

export default router;
