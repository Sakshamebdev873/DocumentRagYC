"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovedAnswerByDraftId = exports.getApprovedAnswerById = exports.getApprovedAnswers = void 0;
const prisma_1 = require("../config/prisma");
function visibilityWhere(user) {
    const allowedRoles = user.role === "ADMIN" ? ["ADMIN", "EMPLOYEE"] : ["EMPLOYEE"];
    if (user.role === "ADMIN") {
        return {
            allowedRole: { in: allowedRoles },
        };
    }
    return {
        allowedRole: { in: allowedRoles },
        visibleToUserIds: { has: user.userId },
    };
}
const getApprovedAnswers = async (user) => {
    return prisma_1.prisma.approvedAnswer.findMany({
        where: visibilityWhere(user),
        orderBy: { approvedAt: "desc" },
    });
};
exports.getApprovedAnswers = getApprovedAnswers;
const getApprovedAnswerById = async (id, user) => {
    const answer = await prisma_1.prisma.approvedAnswer.findFirst({
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
exports.getApprovedAnswerById = getApprovedAnswerById;
const getApprovedAnswerByDraftId = async (draftId, user) => {
    const answer = await prisma_1.prisma.approvedAnswer.findFirst({
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
exports.getApprovedAnswerByDraftId = getApprovedAnswerByDraftId;
