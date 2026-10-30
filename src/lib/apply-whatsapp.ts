// Builds the applicant → office WhatsApp message (browser-safe).
export const OFFICE_WHATSAPP = "917907851675";
export const COMMUTE_QUESTION = "ദിവസവും വളാഞ്ചേരിയിൽ വന്നു പോകാൻ കഴിയുമോ?";

export type ApplyDetails = {
  fullName: string;
  phone: string;
  email: string;
  place: string;
  education: string;
  skills: string[];
  otherSkills: string;
  commute: "Yes" | "No";
};

export function applyWhatsAppUrl(d: ApplyDetails): string {
  const lines = [
    "*Job Application – Social Media Manager*",
    "",
    `*Name:* ${d.fullName.trim()}`,
    `*WhatsApp:* ${d.phone}`,
    `*Email:* ${d.email.trim()}`,
    `*Place:* ${d.place.trim()}`,
    `*Education:* ${d.education}`,
    `*Skills:* ${d.skills.length ? d.skills.join(", ") : "-"}`,
    `*Other skills:* ${d.otherSkills.trim() || "-"}`,
    `*${COMMUTE_QUESTION}* ${d.commute === "Yes" ? "അതെ (Yes)" : "ഇല്ല (No)"}`,
    "",
    "My CV is attached below.",
  ];
  return `https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}
