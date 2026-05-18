"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkflowStatus = exports.getPendingWorkflows = void 0;
const prisma_1 = require("../config/prisma");
const getPendingWorkflows = async (userId) => {
    return prisma_1.prisma.workflowDraft.findMany({
        where: {
            userId,
            status: "PENDING"
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getPendingWorkflows = getPendingWorkflows;
const updateWorkflowStatus = async (draftId, userId, action) => {
    const draft = await prisma_1.prisma.workflowDraft.findUnique({
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
    const status = action === "EXECUTE" ? "EXECUTED" : "DISCARDED";
    const updatedDraft = await prisma_1.prisma.workflowDraft.update({
        where: { id: draftId },
        data: { status }
    });
    return updatedDraft;
};
exports.updateWorkflowStatus = updateWorkflowStatus;
