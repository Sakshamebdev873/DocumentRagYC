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

function extractErrorMessage(status: number, rawText: string) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return `Request failed with status ${status}`;
  }

  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return "The server returned an unexpected HTML page. Please try again in a moment.";
  }

  return trimmed.length > 220 ? `${trimmed.slice(0, 217)}...` : trimmed;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();

  let parsedJson: unknown;
  if (rawText) {
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      if (!response.ok) {
        throw new Error(extractErrorMessage(response.status, rawText));
      }

      throw new Error("The server returned an invalid response. Please try again.");
    }
  }

  const parsed = decryptBody<T>((parsedJson ?? {}) as T);

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed && "error" in parsed
        ? String((parsed as { error?: string }).error)
        : extractErrorMessage(response.status, rawText);
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

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      cache,
      body: formData ?? (body ? JSON.stringify(encryptBody(body)) : undefined),
    });

    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        throw new Error("Network error. Please check your connection and try again.");
      }

      throw error;
    }

    throw new Error("Unexpected network error. Please try again.");
  }
}
