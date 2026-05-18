import { Request, Response } from "express";
import { workflowActionSchema } from "../schemas/workflow.schema";
import * as workflowService from "../services/workflow.service";

export const getPendingWorkflows = async (req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await workflowService.getPendingWorkflows(req.user!.userId);
    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch workflows" });
  }
};

export const updateWorkflowStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = workflowActionSchema.parse(req.body);
    const updated = await workflowService.updateWorkflowStatus(req.params.id as string, req.user!.userId, validatedData.action);
    res.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(400).json({ error: error.message || "Failed to process workflow action" });
  }
};
