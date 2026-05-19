"use client";

import type {
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

export function updateWorkflowAction(
  id: string,
  action: "EXECUTE" | "DISCARD",
  token: string,
) {
  return request<WorkflowDraft>(`/workflow/${id}/action`, {
    method: "POST",
    token,
    body: { action },
  });
}

export function createEmployee(payload: CreateEmployeePayload, token: string) {
  return request<Record<string, unknown>>("/admin/users", {
    method: "POST",
    token,
    body: payload,
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
