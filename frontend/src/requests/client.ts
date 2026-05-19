"use client";

import { API_URL } from "./config";
import { decryptBody, encryptBody } from "./obfuscation";

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: RequestMethod;
  token?: string;
  body?: unknown;
  formData?: FormData;
  cache?: RequestCache;
  headers?: Record<string, string>;
}

function buildHeaders(token?: string, headers?: Record<string, string>) {
  const merged: Record<string, string> = { ...(headers ?? {}) };
  if (token) merged.Authorization = `Bearer ${token}`;
  return merged;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  const parsed = decryptBody<T>(json);

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed && "error" in parsed
        ? String((parsed as { error?: string }).error)
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return parsed;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const { method = "GET", token, body, formData, cache = "no-store", headers } = options;
  const finalHeaders = buildHeaders(token, headers);

  if (body && !formData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    cache,
    body: formData ?? (body ? JSON.stringify(encryptBody(body)) : undefined),
  });

  return parseResponse<T>(response);
}
