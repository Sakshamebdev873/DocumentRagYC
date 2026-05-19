"use client";

import CryptoJS from "crypto-js";
import { OBFUSCATION_KEY } from "./config";

export function encryptBody(payload: unknown) {
  return {
    data: CryptoJS.AES.encrypt(JSON.stringify(payload), OBFUSCATION_KEY).toString(),
  };
}

export function decryptBody<T>(payload: { data?: string } | T): T {
  if (!payload || typeof payload !== "object" || !("data" in payload) || !payload.data) {
    return payload as T;
  }

  const bytes = CryptoJS.AES.decrypt(payload.data, OBFUSCATION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
}
