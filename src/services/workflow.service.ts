import { prisma } from "../config/prisma";
import { WorkflowStatus } from "../../generated/prisma";

export const getPendingWorkflows = async (userId: string) => {
  return prisma.workflowDraft.findMany({
    where: { 
      userId,
      status: "PENDING"
    },
    orderBy: { createdAt: "desc" }
  });
};

export const updateWorkflowStatus = async (draftId: string, userId: string, action: "EXECUTE" | "DISCARD") => {
  const draft = await prisma.workflowDraft.findUnique({
    where: { id: draftId }
  });

  if (!draft) {
    throw new Error("Draft not found");
  }

  if (draft.userId !== userId) {
    throw new Error("Unauthorized to access this draft");
  }

  if (draft.status !== "PENDING") {
    throw new Error(`Draft is already ${draft.status}`);
  }

  const status: WorkflowStatus = action === "EXECUTE" ? "EXECUTED" : "DISCARDED";

  const updatedDraft = await prisma.workflowDraft.update({
    where: { id: draftId },
    data: { status }
  });

  return updatedDraft;
};
