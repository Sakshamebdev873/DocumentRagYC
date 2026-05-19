"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocumentVisibility = exports.listDocuments = exports.listEmployees = exports.createEmployee = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createEmployee = async (data) => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            role: "EMPLOYEE",
            department: data.department || null,
            createdBy: data.createdBy,
        },
        select: {
            id: true,
            email: true,
            role: true,
            department: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.createEmployee = createEmployee;
const listEmployees = async () => {
    return prisma_1.prisma.user.findMany({
        where: {
            role: "EMPLOYEE",
        },
        select: {
            id: true,
            email: true,
            role: true,
            department: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.listEmployees = listEmployees;
const listDocuments = async () => {
    return prisma_1.prisma.document.findMany({
        where: {
            isActive: true,
        },
        select: {
            id: true,
            filename: true,
            fileType: true,
            ingestionStatus: true,
            errorMessage: true,
            allowedRole: true,
            department: true,
            visibleToUserIds: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.listDocuments = listDocuments;
const updateDocumentVisibility = async (documentId, visibleToUserIds) => {
    const document = await prisma_1.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
        throw new Error("Document not found");
    }
    const updatedDocument = await prisma_1.prisma.document.update({
        where: { id: documentId },
        data: { visibleToUserIds },
        select: {
            id: true,
            filename: true,
            fileType: true,
            ingestionStatus: true,
            errorMessage: true,
            allowedRole: true,
            department: true,
            visibleToUserIds: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    await prisma_1.prisma.documentChunk.updateMany({
        where: { documentId },
        data: { visibleToUserIds },
    });
    return updatedDocument;
};
exports.updateDocumentVisibility = updateDocumentVisibility;
const deleteDocument = async (documentId) => {
    const document = await prisma_1.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
        throw new Error("Document not found");
    }
    await prisma_1.prisma.documentChunk.deleteMany({
        where: { documentId },
    });
    await prisma_1.prisma.document.delete({
        where: { id: documentId },
    });
    return { success: true };
};
exports.deleteDocument = deleteDocument;
