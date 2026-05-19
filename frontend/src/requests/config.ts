const OBFUSCATION_KEY = process.env.NEXT_PUBLIC_OBFUSCATION_KEY ?? "enterprise-secret-key-123";

export { OBFUSCATION_KEY };
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
