import { Request, Response } from "express";
import { assignDocumentVisibilitySchema, createEmployeeSchema } from "../schemas/admin.schema";
import * as adminService from "../services/admin.service";
import * as answerService from "../services/answer.service";

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);

    const newEmployee = await adminService.createEmployee({
      ...validatedData,
      createdBy: req.user!.userId,
    });

    res.status(201).json(newEmployee);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(400).json({ error: error.message || "Failed to create user" });
  }
};

export const listEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await adminService.listEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list employees" });
  }
};

export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await adminService.listDocuments();
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list documents" });
  }
};

export const updateDocumentVisibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = assignDocumentVisibilitySchema.parse(req.body);
    const document = await adminService.updateDocumentVisibility(req.params.id as string, validatedData.visibleToUserIds);
    res.json(document);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(400).json({ error: error.message || "Failed to update document visibility" });
  }
};

export const listApprovedAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers = await answerService.getAdminApprovedAnswers();
    res.json(answers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list approved answers" });
  }
};
