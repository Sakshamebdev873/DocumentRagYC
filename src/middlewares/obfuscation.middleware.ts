import { Request, Response, NextFunction } from "express";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.OBFUSCATION_KEY || "fallback-secret-key";

// Decrypt inbound requests
export const decryptPayload = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.data) {
    try {
      const bytes = CryptoJS.AES.decrypt(req.body.data, SECRET_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      req.body = decryptedData; // Replace body with decrypted JSON
    } catch (err) {
      console.error("Decryption failed:", err);
      res.status(400).json({ error: "Invalid obfuscated payload" });
      return;
    }
  }
  next();
};

// Encrypt outbound responses
export const encryptResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  // @ts-ignore
  res.json = function (body) {
    if (body && !body.data) { // avoid double encrypting
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(body), SECRET_KEY).toString();
      // Call the original res.json with the obfuscated payload
      originalJson.call(this, { data: encrypted });
    } else {
      originalJson.call(this, body);
    }
  };

  next();
};
