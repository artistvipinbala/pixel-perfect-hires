import { normalizePhone } from "./application-rules";

export function applicationWhatsAppUrl(fullName: string, phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";
  const message = `Hi ${firstName},

Office Staff ഒഴിവിലേക്ക് നിങ്ങൾ അയച്ച CVയും detailsഉം പരിശോധിച്ചിരുന്നു. Next, ഓഫീസിൽ വെച്ച് നേരിട്ടുള്ള interview session ആണ്.

Interviewനായി Tomorrow രാവിലെ 11 മണിക്ക് ഓഫീസിൽ എത്തിച്ചേരുക.

സ്ഥലം: Yara Mall, Second Floor, വളാഞ്ചേരി.
(അവസാന ഭാഗത്ത് ഇടതുവശത്തുള്ള ഓഫീസ്)`;
  return `https://wa.me/${normalized.slice(1)}?text=${encodeURIComponent(message)}`;
}