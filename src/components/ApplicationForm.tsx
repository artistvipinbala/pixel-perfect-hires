import { useRef, useState } from "react";
import { FileSignature, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_OPTIONS, SKILL_OPTIONS, normalizePhone, validateFields, type FieldErrors } from "@/lib/application-rules";
import { COMMUTE_QUESTION, applyWhatsAppUrl } from "@/lib/apply-whatsapp";

type Errs = FieldErrors & { commute?: string | undefined };
const empty = { fullName: "", phone: "", email: "", place: "", education: "", educationOther: "", consent: false };

export function ApplicationForm() {
  const [values, setValues] = useState(empty);
  const [skills, setSkills] = useState<string[]>([]);
  const [otherSkills, setOtherSkills] = useState("");
  const [commute, setCommute] = useState<"" | "Yes" | "No">("");
  const [errors, setErrors] = useState<Errs>({});
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errs = { ...validateFields(values) };
    if (!commute) errs.commute = "Please choose Yes or No.";
    const clean = Object.fromEntries(Object.entries(errs).filter(([, v]) => v)) as Errs;
    setErrors(clean);
    if (Object.keys(clean).length) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${Object.keys(clean)[0]}"]`)?.focus();
      return;
    }
    window.location.href = applyWhatsAppUrl({
      fullName: values.fullName,
      phone: normalizePhone(values.phone)!,
      email: values.email,
      place: values.place,
      education: values.education === "Other" ? values.educationOther.trim() : values.education,
      skills,
      otherSkills,
      commute: commute as "Yes" | "No",
    });
  }

  const err = (k: keyof Errs) =>
    errors[k] ? <p id={`${k}-error`} role="alert" className="mt-1.5 text-sm text-destructive">{errors[k]}</p> : null;
  const aria = (k: keyof Errs) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined, "data-field": k });
  const Req = () => <span className="text-primary" aria-hidden="true"> *</span>;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4">
        <FileSignature className="h-10 w-10 shrink-0 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Apply for Job</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fill in your details and send your CV on WhatsApp. We'll get back to you for the next steps.</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <Label htmlFor="fullName">Full Name<Req /></Label>
          <Input id="fullName" className="mt-1.5 h-11" placeholder="Enter your full name" autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} {...aria("fullName")} />
          {err("fullName")}
        </div>

        <div>
          <Label htmlFor="phone">Whatsapp Number<Req /></Label>
          <div className="mt-1.5 flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
            <Input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className="h-11 rounded-l-none" value={values.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">For numbers outside India, start with + and your country code.</p>
          {err("phone")}
        </div>

        <div>
          <Label htmlFor="email">Email Address<Req /></Label>
          <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="Enter your email address" className="mt-1.5 h-11" value={values.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
          {err("email")}
        </div>

        <div>
          <Label htmlFor="place">Place / Current Location<Req /></Label>
          <Input id="place" autoComplete="address-level2" placeholder="E.g. Valanchery" className="mt-1.5 h-11" value={values.place} onChange={(e) => set("place", e.target.value)} {...aria("place")} />
          {err("place")}
        </div>

        <div>
          <Label htmlFor="education">Education<Req /></Label>
          <Select value={values.education} onValueChange={(v) => set("education", v)}>
            <SelectTrigger id="education" className="mt-1.5 h-11" {...aria("education")}>
              <SelectValue placeholder="Select your education" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          {err("education")}
        </div>

        {values.education === "Other" && (
          <div>
            <Label htmlFor="educationOther">Your Qualification<Req /></Label>
            <Input id="educationOther" className="mt-1.5 h-11" value={values.educationOther} onChange={(e) => set("educationOther", e.target.value)} {...aria("educationOther")} />
            {err("educationOther")}
          </div>
        )}

        <fieldset>
          <legend className="text-sm font-medium">Basic Skills <span className="font-normal text-muted-foreground">(tick what you know)</span></legend>
          <div className="mt-2 space-y-2.5">
            {SKILL_OPTIONS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <Checkbox id={`skill-${i}`} checked={skills.includes(s)} onCheckedChange={(c) => setSkills((v) => (c === true ? [...v, s] : v.filter((x) => x !== s)))} />
                <Label htmlFor={`skill-${i}`} className="text-sm font-normal">{s}</Label>
              </div>
            ))}
          </div>
          <Label htmlFor="otherSkills" className="mt-4 block">Other skills <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="otherSkills" maxLength={500} className="mt-1.5 h-11" placeholder="e.g. CapCut, Photoshop, Copywriting" value={otherSkills} onChange={(e) => setOtherSkills(e.target.value)} />
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">{COMMUTE_QUESTION}<Req /></legend>
          <div className="mt-2 flex gap-3">
            {(["Yes", "No"] as const).map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={commute === o}
                data-field={o === "Yes" ? "commute" : undefined}
                onClick={() => { setCommute(o); setErrors((e) => ({ ...e, commute: undefined })); }}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${commute === o ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:border-primary"}`}
              >
                {o === "Yes" ? "അതെ (Yes)" : "ഇല്ല (No)"}
              </button>
            ))}
          </div>
          {err("commute")}
        </fieldset>

        <div>
          <div className="flex items-start gap-3">
            <Checkbox id="consent" className="mt-0.5" checked={values.consent} onCheckedChange={(c) => set("consent", c === true)} {...aria("consent")} />
            <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
              I agree that Artist Vipin Bala may use my details and CV for recruitment and contact me regarding my application.<Req />
            </Label>
          </div>
          {err("consent")}
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center text-sm font-medium">
          Your CV will be forwarded to WhatsApp
          <span className="mt-1 block text-xs font-normal text-muted-foreground">Submit അമർത്തിയാൽ WhatsApp തുറക്കും — message അയച്ച ശേഷം CV attach ചെയ്യുക.</span>
        </div>

        <Button type="submit" variant="cta" size="lg" className="h-12 w-full">
          <Send /> Submit Application
        </Button>
      </div>
    </form>
  );
}
