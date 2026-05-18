import CryptoJS from "crypto-js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const SECRET_KEY = process.env.NEXT_PUBLIC_OBFUSCATION_KEY || "fallback-secret-key";

const encrypt = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decrypt = (encryptedText: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const request = async (endpoint: string, method: string, body?: any, isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let payload = body;

  if (!isFormData) {
    if (body) {
      headers["Content-Type"] = "application/json";
      // Obfuscate the payload
      payload = JSON.stringify({ data: encrypt(body) });
    }
  } else {
    // Note: Multipart forms are harder to encrypt fully without breaking files,
    // so we typically only encrypt JSON. We will pass FormData as-is.
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: isFormData ? { Authorization: headers.Authorization } : headers,
    body: payload,
  });

  const rawData = await response.json();

  let finalData = rawData;
  // Decrypt if it's an obfuscated payload
  if (rawData.data) {
    try {
      finalData = decrypt(rawData.data);
    } catch (err) {
      console.error("Failed to decrypt response");
    }
  }

  if (!response.ok) {
    throw new Error(finalData.error || "An error occurred");
  }

  return finalData;
};

export const api = {
  get: (endpoint: string) => request(endpoint, "GET"),
  post: (endpoint: string, body: any, isFormData = false) => request(endpoint, "POST", body, isFormData),
  patch: (endpoint: string, body: any) => request(endpoint, "PATCH", body),
  delete: (endpoint: string) => request(endpoint, "DELETE"),
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (e) {
    return null;
  }
};
