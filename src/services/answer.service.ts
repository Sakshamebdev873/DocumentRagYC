import { prisma } from "../config/prisma";
import { AuthPayload } from "../types";

function visibilityWhere(user: AuthPayload) {
  const allowedRoles = user.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : ["EMPLOYEE"];

  if (user.role === "ADMIN") {
    return {
      allowedRole: { in: allowedRoles as any },
    };
  }

  return {
    allowedRole: { in: allowedRoles as any },
    visibleToUserIds: { has: user.userId },
  };
}

export const getApprovedAnswers = async (user: AuthPayload) => {
  return prisma.approvedAnswer.findMany({
    where: visibilityWhere(user),
    orderBy: { approvedAt: "desc" },
  });
};

export const getApprovedAnswerById = async (id: string, user: AuthPayload) => {
  const answer = await prisma.approvedAnswer.findFirst({
    where: {
      id,
      ...visibilityWhere(user),
    },
  });

  if (!answer) {
    throw new Error("Approved answer not found or not accessible");
  }

  return answer;
};

export const getApprovedAnswerByDraftId = async (draftId: string, user: AuthPayload) => {
  const answer = await prisma.approvedAnswer.findFirst({
    where: {
      workflowDraftId: draftId,
      ...visibilityWhere(user),
    },
  });

  if (!answer) {
    throw new Error("Approved answer not found or not accessible");
  }

  return answer;
};
