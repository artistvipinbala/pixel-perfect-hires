// Shared validation rules for the job application (used by browser and server).

export const EDUCATION_OPTIONS = ["Plus Two", "Diploma", "Graduation", "Post Graduation", "Other"] as const;
export type Education = (typeof EDUCATION_OPTIONS)[number];

export const APPLICATION_STATUSES = ["New", "Reviewed", "Shortlisted", "Contacted", "Rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const MAX_CV_BYTES = 5 * 1024 * 1024;

export const CV_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

export const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Normalizes a phone number to E.164. Bare numbers default to +91. Returns null if invalid. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/[^\d\s()+\-.]/.test(trimmed)) return null;
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!hasPlus) {
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length !== 10) return null;
    digits = "91" + digits;
  }
  if (digits.startsWith("91")) {
    return /^91[6-9]\d{9}$/.test(digits) ? "+" + digits : null;
  }
  return /^[1-9]\d{7,14}$/.test(digits) ? "+" + digits : null;
}

export function isValidEmail(raw: string): boolean {
  const v = raw.trim();
  if (v.length > 254) return false;
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(v) && !v.includes("..");
}

export function cvExtension(name: string): string | null {
  const m = /\.([A-Za-z0-9]+)$/.exec(name);
  const ext = m?.[1]?.toLowerCase();
  return ext && ext in CV_TYPES ? ext : null;
}

/** Returns an error message, or null when the file is acceptable. */
export function validateCvMeta(file: { name: string; size: number; type: string } | null | undefined): string | null {
  if (!file) return "Please upload your CV / resume.";
  const ext = cvExtension(file.name);
  if (!ext) return "Only PDF, DOC or DOCX files are accepted.";
  if (file.type && file.type !== "application/octet-stream" && !CV_TYPES[ext]!.includes(file.type))
    return "Only PDF, DOC or DOCX files are accepted.";
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > MAX_CV_BYTES) return "File is too large. Maximum size is 5 MB.";
  return null;
}

/** Checks file signature bytes match the extension. */
export function cvMagicMatches(ext: string, bytes: Uint8Array): boolean {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (ext === "pdf") return starts([0x25, 0x50, 0x44, 0x46]);
  if (ext === "docx") return starts([0x50, 0x4b, 0x03, 0x04]);
  if (ext === "doc") return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  return false;
}

export type ApplicationFields = {
  fullName: string;
  phone: string;
  email: string;
  place: string;
  education: string;
  educationOther: string;
  consent: boolean;
};

export type FieldErrors = { [K in keyof ApplicationFields | "cv"]?: string | undefined };

export function validateFields(f: ApplicationFields): FieldErrors {
  const e: FieldErrors = {};
  const name = f.fullName.trim();
  if (!name) e.fullName = "Please enter your full name.";
  else if (name.length > 100) e.fullName = "Name must be under 100 characters.";
  if (!f.phone.trim()) e.phone = "Please enter your phone number.";
  else if (!normalizePhone(f.phone)) e.phone = "Enter a valid phone number (10 digits for India).";
  if (!f.email.trim()) e.email = "Please enter your email address.";
  else if (!isValidEmail(f.email)) e.email = "Enter a valid email address.";
  const place = f.place.trim();
  if (!place) e.place = "Please enter your place / current location.";
  else if (place.length > 120) e.place = "Place must be under 120 characters.";
  if (!(EDUCATION_OPTIONS as readonly string[]).includes(f.education)) e.education = "Please select your education.";
  else if (f.education === "Other") {
    const o = f.educationOther.trim();
    if (!o) e.educationOther = "Please enter your qualification.";
    else if (o.length > 120) e.educationOther = "Qualification must be under 120 characters.";
  }
  if (!f.consent) e.consent = "You must agree before submitting.";
  return e;
}
