import { prisma } from "../config/prisma";
import { Role, WorkflowStatus } from "../../generated/prisma";

function buildReviewMetadata(action: "EXECUTE" | "DISCARD", actorRole: "ADMIN" | "EMPLOYEE") {
  return {
    reviewOutcome: action === "EXECUTE" ? "Approved for use" : "Rejected during review",
    reviewActorRole: actorRole,
    reviewAction: action,
    reviewedAt: new Date().toISOString(),
  };
}

function readDraftContent(draftContent: unknown) {
  return typeof draftContent === "object" && draftContent ? (draftContent as Record<string, unknown>) : {};
}

async function buildApprovedAnswerData(draftId: string, actorRole: "ADMIN" | "EMPLOYEE") {
  const draft = await prisma.workflowDraft.findUnique({ where: { id: draftId } });

  if (!draft) {
    throw new Error("Draft not found");
  }

  const owner = await prisma.user.findUnique({ where: { id: draft.userId } });
  if (!owner) {
    throw new Error("Draft owner not found");
  }

  const content = readDraftContent(draft.draftContent);

  const sourceDocuments = draft.sourceChunks.length
    ? await prisma.documentChunk.findMany({
        where: { id: { in: draft.sourceChunks } },
        select: { visibleToUserIds: true },
      })
    : [];

  const visibleToUserIds = Array.from(
    new Set(sourceDocuments.flatMap((documentChunk) => documentChunk.visibleToUserIds).concat(draft.userId)),
  );

  return {
    workflowDraftId: draft.id,
    userId: draft.userId,
    query: draft.query,
    title: String(content.title ?? draft.query),
    content: String(content.content ?? ""),
    draftType: draft.draftType,
    sourceChunks: draft.sourceChunks,
    allowedRole: owner.role as Role,
    approvedByRole: actorRole,
    approvedAt: new Date(),
    department: owner.department ?? null,
    visibleToUserIds,
    status: "APPROVED" as const,
  };
}

async function executeDraftAction(draftId: string, action: "EXECUTE" | "DISCARD", actorRole: "ADMIN" | "EMPLOYEE") {
  const draft = await prisma.workflowDraft.findUnique({ where: { id: draftId } });

  if (!draft) {
    throw new Error("Draft not found");
  }

  if (draft.status !== "PENDING") {
    if (action === "EXECUTE" && draft.status === "EXECUTED") {
      const existingApproved = await prisma.approvedAnswer.findUnique({
        where: { workflowDraftId: draftId },
      });

      if (existingApproved) {
        return { draft, approvedAnswer: existingApproved, alreadyProcessed: true };
      }
    }

    throw new Error(`Draft is already ${draft.status}`);
  }

  const status: WorkflowStatus = action === "EXECUTE" ? "EXECUTED" : "DISCARDED";
  const existingDraftContent = readDraftContent(draft.draftContent);
  const reviewMetadata = buildReviewMetadata(action, actorRole);

  return prisma.$transaction(async (transaction) => {
    const updatedDraft = await transaction.workflowDraft.update({
      where: { id: draftId },
      data: {
        status,
        draftContent: {
          ...(existingDraftContent as Record<string, unknown>),
          ...reviewMetadata,
        } as any,
      },
    });

    if (action === "DISCARD") {
      return { draft: updatedDraft, approvedAnswer: null, alreadyProcessed: false };
    }

    const existingApproved = await transaction.approvedAnswer.findUnique({
      where: { workflowDraftId: draftId },
    });

    if (existingApproved) {
      return { draft: updatedDraft, approvedAnswer: existingApproved, alreadyProcessed: true };
    }

    const approvedAnswer = await transaction.approvedAnswer.create({
      data: await buildApprovedAnswerData(draftId, actorRole),
    });

    return { draft: updatedDraft, approvedAnswer, alreadyProcessed: false };
  });
}

export const getPendingWorkflows = async (userId: string) => {
  return prisma.workflowDraft.findMany({
    where: {
      userId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllPendingWorkflows = async () => {
  return prisma.workflowDraft.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getWorkflowHistory = async (userId: string) => {
  return prisma.workflowDraft.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateWorkflowStatus = async (draftId: string, userId: string, action: "EXECUTE" | "DISCARD") => {
  const draft = await prisma.workflowDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    throw new Error("Draft not found");
  }

  if (draft.userId !== userId) {
    throw new Error("Unauthorized to access this draft");
  }

  return executeDraftAction(draftId, action, "EMPLOYEE");
};

export const updateWorkflowStatusAsAdmin = async (draftId: string, action: "EXECUTE" | "DISCARD") => {
  return executeDraftAction(draftId, action, "ADMIN");
};
