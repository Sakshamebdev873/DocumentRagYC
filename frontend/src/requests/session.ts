"use client";

const TOKEN_KEY = "documentrag_token";
const USER_KEY = "documentrag_user";

export function saveSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function saveSessionUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSessionStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSessionToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser<T>() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}
