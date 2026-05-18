import { z } from "zod";

export const workflowActionSchema = z.object({
  action: z.enum(["EXECUTE", "DISCARD"]),
});
