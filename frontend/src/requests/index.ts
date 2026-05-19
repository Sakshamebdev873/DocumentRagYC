"use client";

import type {
  AdminDocument,
  AdminEmployee,
  ApprovedAnswer,
  CreateEmployeePayload,
  LoginResponse,
  UploadPayload,
  WorkflowDraft,
} from "@/lib/types";
import { request } from "./client";
import {
  clearSessionStorage,
  getSessionToken,
  getSessionUser,
  saveSessionToken,
  saveSessionUser,
} from "./session";

export function saveSession(session: LoginResponse) {
  saveSessionToken(session.token);
  saveSessionUser(session.user);
}

export function clearSession() {
  clearSessionStorage();
}

export function getToken() {
  return getSessionToken();
}

export function getStoredUser() {
  return getSessionUser<LoginResponse["user"]>();
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function runQuery(query: string, token: string) {
  return request<WorkflowDraft>("/query", {
    method: "POST",
    token,
    body: { query },
  });
}

export function getPendingWorkflows(token: string) {
  return request<WorkflowDraft[]>("/workflow/pending", {
    token,
  });
}

export function getWorkflowHistory(token: string) {
  return request<WorkflowDraft[]>("/workflow/history", {
    token,
  });
}

export function updateWorkflowAction(id: string, action: "EXECUTE" | "DISCARD", token: string) {
  return request<{ draft: WorkflowDraft; approvedAnswer: ApprovedAnswer | null; alreadyProcessed: boolean }>(`/workflow/${id}/action`, {
    method: "POST",
    token,
    body: { action },
  });
}

export function getAdminPendingWorkflows(token: string) {
  return request<WorkflowDraft[]>("/workflow/admin/pending", {
    token,
  });
}

export function updateAdminWorkflowAction(id: string, action: "EXECUTE" | "DISCARD", token: string) {
  return request<{ draft: WorkflowDraft; approvedAnswer: ApprovedAnswer | null; alreadyProcessed: boolean }>(`/workflow/admin/${id}/action`, {
    method: "POST",
    token,
    body: { action },
  });
}

export function getApprovedAnswers(token: string) {
  return request<ApprovedAnswer[]>("/answers", { token });
}

export function getApprovedAnswerById(id: string, token: string) {
  return request<ApprovedAnswer>(`/answers/${id}`, { token });
}

export function getApprovedAnswerByDraftId(draftId: string, token: string) {
  return request<ApprovedAnswer>(`/answers/by-draft/${draftId}`, { token });
}

export function createEmployee(payload: CreateEmployeePayload, token: string) {
  return request<Record<string, unknown>>("/admin/users", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getEmployees(token: string) {
  return request<AdminEmployee[]>("/admin/users", {
    token,
  });
}

export function getAdminDocuments(token: string) {
  return request<AdminDocument[]>("/admin/documents", {
    token,
  });
}

export function updateDocumentVisibility(documentId: string, visibleToUserIds: string[], token: string) {
  return request<AdminDocument>(`/admin/documents/${documentId}/visibility`, {
    method: "POST",
    token,
    body: { visibleToUserIds },
  });
}

export function deleteAdminDocument(documentId: string, token: string) {
  return request<{ success: boolean }>(`/admin/documents/${documentId}`, {
    method: "DELETE",
    token,
  });
}

export function uploadDocument(payload: UploadPayload, token: string) {
  const formData = new FormData();
  formData.append("file", payload.file);
  if (payload.allowedRole) formData.append("allowedRole", payload.allowedRole);
  if (payload.department) formData.append("department", payload.department);

  return request<{ message: string; documentId: string }>("/upload", {
    method: "POST",
    token,
    formData,
  });
}
