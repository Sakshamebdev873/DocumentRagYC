import { Request, Response } from "express";
import { querySchema } from "../schemas/query.schema";
import * as queryService from "../services/query.service";

export const executeQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = querySchema.parse(req.body);
    const draft = await queryService.executeQuery(validatedData.query, req.user!);
    res.status(201).json(draft);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || "Query failed" });
  }
};
