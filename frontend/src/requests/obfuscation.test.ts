import { describe, expect, it } from "vitest";
import { decryptBody, encryptBody } from "./obfuscation";

describe("obfuscation helpers", () => {
  it("encrypts and decrypts a payload round-trip", () => {
    const payload = {
      email: "admin@enterprise.com",
      role: "ADMIN",
      nested: { department: "SYSTEM" },
    };

    const encrypted = encryptBody(payload);

    expect(encrypted).toHaveProperty("data");
    expect(typeof encrypted.data).toBe("string");
    expect(encrypted.data).not.toContain(payload.email);

    const decrypted = decryptBody<typeof payload>(encrypted);
    expect(decrypted).toEqual(payload);
  });

  it("returns plain payloads unchanged", () => {
    const payload = { ok: true };
    expect(decryptBody(payload)).toEqual(payload);
  });
});
