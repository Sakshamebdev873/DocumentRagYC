"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptResponse = exports.decryptPayload = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const SECRET_KEY = process.env.OBFUSCATION_KEY || "fallback-secret-key";
// Decrypt inbound requests
const decryptPayload = (req, res, next) => {
    if (req.body && req.body.data) {
        try {
            const bytes = crypto_js_1.default.AES.decrypt(req.body.data, SECRET_KEY);
            const decryptedData = JSON.parse(bytes.toString(crypto_js_1.default.enc.Utf8));
            req.body = decryptedData; // Replace body with decrypted JSON
        }
        catch (err) {
            console.error("Decryption failed:", err);
            res.status(400).json({ error: "Invalid obfuscated payload" });
            return;
        }
    }
    next();
};
exports.decryptPayload = decryptPayload;
// Encrypt outbound responses
const encryptResponse = (req, res, next) => {
    const originalJson = res.json;
    // @ts-ignore
    res.json = function (body) {
        if (body && !body.data) { // avoid double encrypting
            const encrypted = crypto_js_1.default.AES.encrypt(JSON.stringify(body), SECRET_KEY).toString();
            // Call the original res.json with the obfuscated payload
            originalJson.call(this, { data: encrypted });
        }
        else {
            originalJson.call(this, body);
        }
    };
    next();
};
exports.encryptResponse = encryptResponse;
