import { Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const data = await authService.login(validatedData.email, validatedData.password);
    res.json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(401).json({ error: error.message || "Authentication failed" });
  }
};
