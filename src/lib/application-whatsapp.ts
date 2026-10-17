import { normalizePhone } from "./application-rules";

export function applicationWhatsAppUrl(fullName: string, phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";
  const message = `Hi ${firstName},

Office Staff ഒഴിവിലേക്ക് നിങ്ങൾ അയച്ച CVയും detailsഉം പരിശോധിച്ചിരുന്നു. അടുത്ത ഘട്ടം ഓഫീസിൽ വെച്ചുള്ള നേരിട്ടുള്ള interview session ആണ്.

നിങ്ങൾക്ക് വരാൻ comfortable ആയിട്ടുള്ള Time അറിയിക്കുക. അതനുസരിച്ച് interview  confirm ചെയ്യാം.

സ്ഥലം: Yara Mall, Second Floor, വളാഞ്ചേരി.
(അവസാന ഭാഗത്ത് ഇടതുവശത്തുള്ള ഓഫീസ്)`;
  return `https://wa.me/${normalized.slice(1)}?text=${encodeURIComponent(message)}`;
}