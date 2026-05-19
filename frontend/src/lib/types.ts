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
    reviewOutcome?: string;
    reviewActorRole?: UserRole;
    reviewAction?: "EXECUTE" | "DISCARD";
    reviewedAt?: string;
    [key: string]: unknown;
  };
  status: "PENDING" | "EXECUTED" | "DISCARDED";
  createdAt: string;
  updatedAt: string;
}

export interface ApprovedAnswer {
  id: string;
  workflowDraftId: string;
  userId: string;
  query: string;
  title: string;
  content: string;
  draftType: string;
  sourceChunks: string[];
  allowedRole: UserRole;
  approvedByRole: UserRole;
  approvedAt: string;
  department: string | null;
  visibleToUserIds: string[];
  status: "APPROVED";
  createdAt: string;
  updatedAt: string;
}

export interface AdminEmployee {
  id: string;
  email: string;
  role: UserRole;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDocument {
  id: string;
  filename: string;
  fileType: string;
  ingestionStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  allowedRole: UserRole;
  department: string | null;
  visibleToUserIds: string[];
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
