import { Request, Response } from "express";
import * as answerService from "../services/answer.service";

export const listApprovedAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers = await answerService.getApprovedAnswers(req.user!);
    res.json(answers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch approved answers" });
  }
};

export const getApprovedAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.getApprovedAnswerById(req.params.id as string, req.user!);
    res.json(answer);
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Approved answer not found" });
  }
};

export const getApprovedAnswerByDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.getApprovedAnswerByDraftId(req.params.draftId as string, req.user!);
    res.json(answer);
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Approved answer not found" });
  }
};

export const listAdminApprovedAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers = await answerService.getAdminApprovedAnswers();
    res.json(answers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch approved answers" });
  }
};
