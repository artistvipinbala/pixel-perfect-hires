import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  APPLICATION_STATUSES,
  CV_TYPES,
  cvExtension,
  cvMagicMatches,
  normalizePhone,
  validateCvMeta,
  validateFields,
  type ApplicationStatus,
} from "./application-rules";

type SubmitResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const submitApplication = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission");
    return data;
  })
  .handler(async ({ data }): Promise<SubmitResult> => {
    const str = (k: string) => {
      const v = data.get(k);
      return typeof v === "string" ? v : "";
    };
    // Honeypot: bots fill hidden field. Pretend success, store nothing.
    if (str("website").trim()) return { ok: true };

    const key = str("idempotencyKey");
    if (!/^[0-9a-f-]{36}$/i.test(key)) return { ok: false, error: "Invalid submission. Please reload and try again." };

    const fields = {
      fullName: str("fullName"),
      phone: str("phone"),
      email: str("email"),
      place: str("place"),
      education: str("education"),
      educationOther: str("educationOther"),
      consent: str("consent") === "true",
    };
    const fieldErrors: Record<string, string> = { ...validateFields(fields) } as Record<string, string>;
    const cv = data.get("cv");
    const file = cv instanceof File ? cv : null;
    const cvErr = validateCvMeta(file);
    if (cvErr) fieldErrors["cv"] = cvErr;
    if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

    const ext = cvExtension(file!.name)!;
    const bytes = new Uint8Array(await file!.arrayBuffer());
    if (!cvMagicMatches(ext, bytes))
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: { cv: "This file doesn't look like a valid PDF, DOC, DOCX, JPG or PNG." } };

    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Idempotency: a retry of an already-saved submission succeeds without duplicating.
    const existing = await supabaseAdmin.from("applications").select("id").eq("idempotency_key", key).maybeSingle();
    if (existing.data) return { ok: true };

    // Basic rate limit: 5 applications per IP per hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("submitter_ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) return { ok: false, error: "Too many applications from this connection. Please try again later." };

    const path = `${crypto.randomUUID()}/${crypto.randomUUID()}.${ext}`;
    const mime = CV_TYPES[ext]![0]!;
    const up = await supabaseAdmin.storage.from("resumes").upload(path, bytes, { contentType: mime, upsert: false });
    if (up.error) {
      console.error("CV upload failed", up.error.message);
      return { ok: false, error: "We couldn't upload your CV. Please try again." };
    }

    const ins = await supabaseAdmin.from("applications").insert({
      idempotency_key: key,
      full_name: fields.fullName.trim(),
      phone: normalizePhone(fields.phone)!,
      email: fields.email.trim().toLowerCase(),
      place: fields.place.trim(),
      education: fields.education,
      education_other: fields.education === "Other" ? fields.educationOther.trim() : null,
      consent_at: new Date().toISOString(),
      cv_path: path,
      cv_filename: file!.name.slice(0, 200),
      cv_mime: mime,
      cv_size: file!.size,
      submitter_ip: ip,
    });
    if (ins.error) {
      await supabaseAdmin.storage.from("resumes").remove([path]);
      if (ins.error.code === "23505") return { ok: true }; // concurrent duplicate already saved
      console.error("Application insert failed", ins.error.message);
      return { ok: false, error: "We couldn't save your application. Please try again." };
    }
    return { ok: true };
  });

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden: admin access required");
}

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { search?: string | undefined; status?: string | undefined }) => ({
    search: (d.search ?? "").trim().slice(0, 100),
    status: (APPLICATION_STATUSES as readonly string[]).includes(d.status ?? "") ? (d.status as ApplicationStatus) : null,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("applications")
      .select("id, full_name, phone, email, place, education, education_other, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) {
      const s = data.search.replace(/[%,()*\\]/g, " ");
      q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s.replace(/\s/g, "")}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows;
  });

export const getApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => ({ id: String(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("applications")
      .select("id, full_name, phone, email, place, education, education_other, consent_at, cv_path, cv_filename, cv_mime, cv_size, status, created_at")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const signed = await context.supabase.storage.from("resumes").createSignedUrl(row.cv_path, 300);
    const download = await context.supabase.storage.from("resumes").createSignedUrl(row.cv_path, 300, { download: row.cv_filename });
    return { ...row, previewUrl: signed.data?.signedUrl ?? null, downloadUrl: download.data?.signedUrl ?? null };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string; status: string }) => {
    if (!(APPLICATION_STATUSES as readonly string[]).includes(d.status)) throw new Error("Invalid status");
    return { id: String(d.id), status: d.status as ApplicationStatus };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("applications").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
