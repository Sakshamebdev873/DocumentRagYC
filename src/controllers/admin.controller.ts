import { Request, Response } from "express";
import { createEmployeeSchema } from "../schemas/admin.schema";
import * as adminService from "../services/admin.service";

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);
    
    const newEmployee = await adminService.createEmployee({
      ...validatedData,
      createdBy: req.user!.userId
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
