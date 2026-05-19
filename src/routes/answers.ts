import { Router } from "express";
import { getApprovedAnswer, getApprovedAnswerByDraft, listApprovedAnswers } from "../controllers/answer.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listApprovedAnswers);
router.get("/by-draft/:draftId", getApprovedAnswerByDraft);
router.get("/:id", getApprovedAnswer);

export default router;
