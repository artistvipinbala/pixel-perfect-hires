import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitApplication } from "@/lib/applications.functions";
import { CV_ACCEPT, EDUCATION_OPTIONS, validateCvMeta, validateFields, type FieldErrors } from "@/lib/application-rules";

const empty = { fullName: "", phone: "", email: "", place: "", education: "", educationOther: "", consent: false };

function formatSize(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function ApplicationForm() {
  const submit = useServerFn(submitApplication);
  const [values, setValues] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const idemKey = useRef<string>(crypto.randomUUID());
  const fileInput = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitBtn = useRef<HTMLButtonElement>(null);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function pickFile(f: File | null) {
    setFile(f);
    setErrors((e) => ({ ...e, cv: f ? validateCvMeta(f) ?? undefined : undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    const errs: FieldErrors = { ...validateFields(values) };
    const cvErr = validateCvMeta(file);
    if (cvErr) errs.cv = cvErr;
    const clean = Object.fromEntries(Object.entries(errs).filter(([, v]) => v)) as FieldErrors;
    setErrors(clean);
    if (Object.keys(clean).length) {
      const first = Object.keys(clean)[0];
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("cv", file!);
    fd.append("idempotencyKey", idemKey.current);
    fd.append("website", (formRef.current?.elements.namedItem("website") as HTMLInputElement)?.value ?? "");

    setSubmitting(true);
    setProgress(10);
    const timer = setInterval(() => setProgress((p) => Math.min(90, p + 8)), 300);
    try {
      const res = await submit({ data: fd });
      if (res.ok) {
        setProgress(100);
        setValues(empty);
        setFile(null);
        if (fileInput.current) fileInput.current.value = "";
        idemKey.current = crypto.randomUUID();
        setSuccess(true);
      } else {
        if (res.fieldErrors) setErrors(res.fieldErrors as FieldErrors);
        setFormError(res.error);
      }
    } catch {
      setFormError("Network problem — your application was not sent. Your details are kept; please retry.");
    } finally {
      clearInterval(timer);
      setSubmitting(false);
      setProgress(0);
    }
  }

  const err = (k: keyof FieldErrors) =>
    errors[k] ? (
      <p id={`${k}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof FieldErrors) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
    "data-field": k,
  });
  const Req = () => <span className="text-primary" aria-hidden="true"> *</span>;

  return (
    <>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10"
      >
        <h2 className="text-3xl font-bold tracking-tight">Apply for Office Staff</h2>
        <p className="mt-1 text-sm text-muted-foreground">All fields are required.</p>

        {/* Honeypot */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <fieldset disabled={submitting} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="fullName">Full Name<Req /></Label>
            <Input id="fullName" className="mt-1.5 h-11" autoComplete="name" required value={values.fullName} onChange={(e) => set("fullName", e.target.value)} {...aria("fullName")} />
            {err("fullName")}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number<Req /></Label>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className="h-11 rounded-l-none" required value={values.phone} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">For numbers outside India, start with + and your country code.</p>
            {err("phone")}
          </div>

          <div>
            <Label htmlFor="email">Email Address<Req /></Label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" className="mt-1.5 h-11" required value={values.email} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
            {err("email")}
          </div>

          <div>
            <Label htmlFor="place">Place / Current Location<Req /></Label>
            <Input id="place" autoComplete="address-level2" className="mt-1.5 h-11" required value={values.place} onChange={(e) => set("place", e.target.value)} {...aria("place")} />
            {err("place")}
          </div>

          <div>
            <Label htmlFor="education">Education<Req /></Label>
            <Select value={values.education} onValueChange={(v) => set("education", v)}>
              <SelectTrigger id="education" className="mt-1.5 h-11" {...aria("education")}>
                <SelectValue placeholder="Select your education" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {err("education")}
          </div>

          {values.education === "Other" && (
            <div>
              <Label htmlFor="educationOther">Your Qualification<Req /></Label>
              <Input id="educationOther" className="mt-1.5 h-11" required value={values.educationOther} onChange={(e) => set("educationOther", e.target.value)} {...aria("educationOther")} />
              {err("educationOther")}
            </div>
          )}

          <div>
            <Label htmlFor="cv">Upload CV / Resume<Req /></Label>
            <input ref={fileInput} id="cv" type="file" accept={CV_ACCEPT} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} {...aria("cv")} />
            {file ? (
              <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-input bg-muted/50 p-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>Replace</Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove file" onClick={() => { pickFile(null); if (fileInput.current) fileInput.current.value = ""; }}>
                  <X />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-1.5 flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-input bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary"
              >
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold">Choose file</span>
                <span className="text-xs text-muted-foreground">PDF, DOC or DOCX · max 5 MB</span>
              </button>
            )}
            {err("cv")}
          </div>

          <div>
            <div className="flex items-start gap-3">
              <Checkbox id="consent" className="mt-0.5" checked={values.consent} onCheckedChange={(c) => set("consent", c === true)} {...aria("consent")} />
              <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
                I agree that Artist Vipin Bala may use my details and CV for recruitment and contact me regarding my application.<Req />
              </Label>
            </div>
            {err("consent")}
          </div>

          {formError && (
            <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              <p>{formError}</p>
              <Button type="submit" variant="outline" size="sm" className="mt-3">Retry</Button>
            </div>
          )}

          {submitting && (
            <div aria-live="polite">
              <Progress value={progress} />
              <p className="mt-2 text-xs text-muted-foreground">Uploading CV and saving your application…</p>
            </div>
          )}

          <Button ref={submitBtn} type="submit" variant="cta" size="lg" className="h-12 w-full" disabled={submitting}>
            {submitting ? (<><Loader2 className="animate-spin" /> Submitting…</>) : "Submit Application"}
          </Button>
        </fieldset>
      </form>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent
          className="max-w-md rounded-2xl"
          onCloseAutoFocus={(e) => { e.preventDefault(); submitBtn.current?.focus(); }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Application Submitted!</DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground">
              നിങ്ങളുടെ അപേക്ഷ ലഭിച്ചു. CV പരിശോധിച്ച ശേഷം, ഷോർട്ട്‌ലിസ്റ്റ് ചെയ്യപ്പെടുന്നവരെ ഇന്റർവ്യൂവിനായി ബന്ധപ്പെടുന്നതാണ്. നന്ദി!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="cta" className="w-full sm:w-auto" onClick={() => setSuccess(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
