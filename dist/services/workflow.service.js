"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkflowStatusAsAdmin = exports.updateWorkflowStatus = exports.getWorkflowHistory = exports.getAllPendingWorkflows = exports.getPendingWorkflows = void 0;
const prisma_1 = require("../config/prisma");
function buildReviewMetadata(action, actorRole) {
    return {
        reviewOutcome: action === "EXECUTE" ? "Approved for use" : "Rejected during review",
        reviewActorRole: actorRole,
        reviewAction: action,
        reviewedAt: new Date().toISOString(),
    };
}
function readDraftContent(draftContent) {
    return typeof draftContent === "object" && draftContent ? draftContent : {};
}
async function buildApprovedAnswerData(draftId, actorRole) {
    const draft = await prisma_1.prisma.workflowDraft.findUnique({ where: { id: draftId } });
    if (!draft) {
        throw new Error("Draft not found");
    }
    const owner = await prisma_1.prisma.user.findUnique({ where: { id: draft.userId } });
    if (!owner) {
        throw new Error("Draft owner not found");
    }
    const content = readDraftContent(draft.draftContent);
    const sourceDocuments = draft.sourceChunks.length
        ? await prisma_1.prisma.documentChunk.findMany({
            where: { id: { in: draft.sourceChunks } },
            select: { visibleToUserIds: true },
        })
        : [];
    const visibleToUserIds = Array.from(new Set(sourceDocuments.flatMap((documentChunk) => documentChunk.visibleToUserIds).concat(draft.userId)));
    return {
        workflowDraftId: draft.id,
        userId: draft.userId,
        query: draft.query,
        title: String(content.title ?? draft.query),
        content: String(content.content ?? ""),
        draftType: draft.draftType,
        sourceChunks: draft.sourceChunks,
        allowedRole: owner.role,
        approvedByRole: actorRole,
        approvedAt: new Date(),
        department: owner.department ?? null,
        visibleToUserIds,
        status: "APPROVED",
    };
}
async function executeDraftAction(draftId, action, actorRole) {
    const draft = await prisma_1.prisma.workflowDraft.findUnique({ where: { id: draftId } });
    if (!draft) {
        throw new Error("Draft not found");
    }
    if (draft.status !== "PENDING") {
        if (action === "EXECUTE" && draft.status === "EXECUTED") {
            const existingApproved = await prisma_1.prisma.approvedAnswer.findUnique({
                where: { workflowDraftId: draftId },
            });
            if (existingApproved) {
                return { draft, approvedAnswer: existingApproved, alreadyProcessed: true };
            }
        }
        throw new Error(`Draft is already ${draft.status}`);
    }
    const status = action === "EXECUTE" ? "EXECUTED" : "DISCARDED";
    const existingDraftContent = readDraftContent(draft.draftContent);
    const reviewMetadata = buildReviewMetadata(action, actorRole);
    return prisma_1.prisma.$transaction(async (transaction) => {
        const updatedDraft = await transaction.workflowDraft.update({
            where: { id: draftId },
            data: {
                status,
                draftContent: {
                    ...existingDraftContent,
                    ...reviewMetadata,
                },
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
const getPendingWorkflows = async (userId) => {
    return prisma_1.prisma.workflowDraft.findMany({
        where: {
            userId,
            status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getPendingWorkflows = getPendingWorkflows;
const getAllPendingWorkflows = async () => {
    return prisma_1.prisma.workflowDraft.findMany({
        where: {
            status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getAllPendingWorkflows = getAllPendingWorkflows;
const getWorkflowHistory = async (userId) => {
    return prisma_1.prisma.workflowDraft.findMany({
        where: {
            userId,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getWorkflowHistory = getWorkflowHistory;
const updateWorkflowStatus = async (draftId, userId, action) => {
    const draft = await prisma_1.prisma.workflowDraft.findUnique({
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
exports.updateWorkflowStatus = updateWorkflowStatus;
const updateWorkflowStatusAsAdmin = async (draftId, action) => {
    return executeDraftAction(draftId, action, "ADMIN");
};
exports.updateWorkflowStatusAsAdmin = updateWorkflowStatusAsAdmin;
