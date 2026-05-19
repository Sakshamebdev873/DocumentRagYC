import { Router } from "express";
import {
  createEmployee,
  listApprovedAnswers,
  listDocuments,
  listEmployees,
  updateDocumentVisibility,
} from "../controllers/admin.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.post("/users", createEmployee);
router.get("/users", listEmployees);
router.get("/documents", listDocuments);
router.post("/documents/:id/visibility", updateDocumentVisibility);
router.get("/answers", listApprovedAnswers);

export default router;
