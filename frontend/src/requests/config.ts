const rawObfuscationKey = process.env.NEXT_PUBLIC_OBFUSCATION_KEY;
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawObfuscationKey) {
  throw new Error("NEXT_PUBLIC_OBFUSCATION_KEY is not set");
}

if (!rawApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export const OBFUSCATION_KEY: string = rawObfuscationKey;
export const API_URL: string = rawApiUrl;
