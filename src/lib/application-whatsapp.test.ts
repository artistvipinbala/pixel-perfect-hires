import { describe, expect, it } from "vitest";
import { applicationWhatsAppUrl } from "./application-whatsapp";

describe("applicant WhatsApp recipient", () => {
  it("addresses the applicant's normalized phone number", () => {
    const link = applicationWhatsAppUrl("Asha Kumar", "98765 43210");
    expect(link && new URL(link).pathname).toBe("/919876543210");
  });
  it("does not create a link for an invalid phone number", () => {
    expect(applicationWhatsAppUrl("Asha Kumar", "123")).toBeNull();
  });
});