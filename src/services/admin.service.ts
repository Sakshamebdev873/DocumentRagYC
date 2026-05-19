import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

interface CreateEmployeeDto {
  email: string;
  password: string;
  department?: string;
  createdBy: string;
}

export const createEmployee = async (data: CreateEmployeeDto) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
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

export const listEmployees = async () => {
  return prisma.user.findMany({
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

export const listDocuments = async () => {
  return prisma.document.findMany({
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

export const updateDocumentVisibility = async (documentId: string, visibleToUserIds: string[]) => {
  const document = await prisma.document.findUnique({ where: { id: documentId } });

  if (!document) {
    throw new Error("Document not found");
  }

  const updatedDocument = await prisma.document.update({
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

  await prisma.documentChunk.updateMany({
    where: { documentId },
    data: { visibleToUserIds },
  });

  return updatedDocument;
};
