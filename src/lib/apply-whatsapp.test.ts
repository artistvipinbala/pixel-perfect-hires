import { describe, expect, it } from "vitest";
import { applyWhatsAppUrl } from "./apply-whatsapp";

const url = applyWhatsAppUrl({
  fullName: "Asha", phone: "+919876543210", email: "a@b.com", place: "Tirur",
  education: "Diploma", skills: ["Basic Video Editing"], otherSkills: "", commute: "Yes",
});

describe("apply via WhatsApp", () => {
  it("sends to the office number 7907851675", () => {
    expect(new URL(url).pathname).toBe("/917907851675");
  });
  it("prefills all selected details including daily commute answer", () => {
    const t = new URL(url).searchParams.get("text") ?? "";
    expect(t).toContain("Asha");
    expect(t).toContain("Diploma");
    expect(t).toContain("Basic Video Editing");
    expect(t).toContain("അതെ (Yes)");
  });
});
