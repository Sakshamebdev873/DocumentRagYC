export type UserRole = "ADMIN" | "EMPLOYEE";

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  department: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface WorkflowDraft {
  id: string;
  userId: string;
  query: string;
  sourceChunks: string[];
  draftType: string;
  draftContent: {
    title?: string;
    content?: string;
    actionItems?: string[];
    draftType?: string;
    [key: string]: unknown;
  };
  status: "PENDING" | "EXECUTED" | "DISCARDED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  email: string;
  password: string;
  department?: string;
}

export interface UploadPayload {
  file: File;
  allowedRole?: UserRole;
  department?: string;
}
