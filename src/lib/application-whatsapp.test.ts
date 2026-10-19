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

describe("applicant WhatsApp draft body", () => {
  const body = (link: string | null) => new URL(String(link)).searchParams.get("text") ?? "";
  const draft = body(applicationWhatsAppUrl("Asha Kumar", "9876543210"));

  it("greets the applicant by first name", () => {
    expect(draft.startsWith("Hi Asha,")).toBe(true);
  });

  it("invites for Tomorrow at 11 AM, asks for a printed CV copy and closes with thanks", () => {
    expect(draft).toContain("Tomorrow");
    expect(draft).toContain("11 മണിക്ക്");
    expect(draft).toContain("printed copy");
    expect(draft).toContain("Thank you.");
    expect(draft).not.toContain("[തീയതി]");
  });
});
