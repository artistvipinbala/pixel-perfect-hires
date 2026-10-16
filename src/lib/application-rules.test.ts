import { describe, expect, it } from "vitest";
import { cvMagicMatches, isValidEmail, normalizePhone, validateCvMeta, validateFields } from "./application-rules";

const base = { fullName: "Asha K", phone: "9876543210", email: "a@b.com", place: "Valanchery", education: "Graduation", educationOther: "", consent: true };

describe("application rules", () => {
  it("defaults phone to +91", () => expect(normalizePhone("98765 43210")).toBe("+919876543210"));
  it("rejects short indian phone", () => expect(normalizePhone("12345")).toBeNull());
  it("rejects invalid email", () => expect(isValidEmail("a@b")).toBe(false));
  it("rejects whitespace-only name", () => expect(validateFields({ ...base, fullName: "   " }).fullName).toBeTruthy());
  it("requires qualification when Other", () => expect(validateFields({ ...base, education: "Other", educationOther: " " }).educationOther).toBeTruthy());
  it("requires consent", () => expect(validateFields({ ...base, consent: false }).consent).toBeTruthy());
  it("requires CV", () => expect(validateCvMeta(null)).toBeTruthy());
  it("rejects CV over 5 MB", () => expect(validateCvMeta({ name: "cv.pdf", size: 5 * 1024 * 1024 + 1, type: "application/pdf" })).toBeTruthy());
  it("rejects unsupported CV type", () => expect(validateCvMeta({ name: "cv.png", size: 100, type: "image/png" })).toBeTruthy());
  it("accepts docx", () => expect(validateCvMeta({ name: "cv.docx", size: 100, type: "" })).toBeNull());
  it("checks pdf signature", () => expect(cvMagicMatches("pdf", new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe(true));
});
