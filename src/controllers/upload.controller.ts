import { Request, Response } from "express";
import * as ingestionService from "../services/ingestion.service";
import { Role } from "../../generated/prisma";

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const { allowedRole, department } = req.body;

    if (allowedRole === "ADMIN" && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Only admins can upload admin-only documents" });
      return;
    }

    const roleToAssign = (allowedRole as Role) || "EMPLOYEE";
    const depToAssign = department || null;

    const document = await ingestionService.processUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.user!.userId,
      roleToAssign,
      depToAssign,
      [],
    );

    res.status(202).json({
      message: "File is being processed. Assign visibility from the admin panel before employees can use it.",
      documentId: document.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Upload failed" });
  }
};
