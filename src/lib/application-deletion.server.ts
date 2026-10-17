import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function deleteApplicationRecord(supabase: SupabaseClient<Database>, userId: string, id: string) {
  const role = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (role.error || !role.data) throw new Error("Forbidden: admin access required");

  const application = await supabase.from("applications").select("id, cv_path").eq("id", id).maybeSingle();
  if (application.error) throw new Error("Couldn’t load this application. Please try again.");
  if (!application.data) return { ok: true };

  // Keep the application available for retry if its private CV cannot be removed.
  const cv = await supabase.storage.from("resumes").remove([application.data.cv_path]);
  if (cv.error) throw new Error("Couldn’t delete the CV. Please try again.");

  const deleted = await supabase.from("applications").delete().eq("id", id).select("id");
  if (deleted.error || !deleted.data?.length) throw new Error("Couldn’t delete this application. Please try again.");
  return { ok: true };
}