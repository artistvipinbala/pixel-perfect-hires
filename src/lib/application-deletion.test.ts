import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { deleteApplicationRecord } from "./application-deletion.server";

function setup(admin = true, storageError: object | null = null) {
  const remove = vi.fn().mockResolvedValue({ error: storageError });
  const selectDeleted = vi.fn().mockResolvedValue({ data: [{ id: "application-id" }], error: null });
  const deleteEq = vi.fn().mockReturnValue({ select: selectDeleted });
  const deleteRow = vi.fn().mockReturnValue({ eq: deleteEq });
  const readEq = vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: "application-id", cv_path: "private/cv.pdf" }, error: null }) });
  const from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: readEq }), delete: deleteRow });
  const client = { rpc: vi.fn().mockResolvedValue({ data: admin, error: null }), from, storage: { from: vi.fn().mockReturnValue({ remove }) } };
  return { client: client as unknown as SupabaseClient<Database>, remove, deleteRow, deleteEq, readEq };
}

describe("admin application deletion", () => {
  it("denies non-admins before reading or deleting applications and CVs", async () => {
    const s = setup(false);
    await expect(deleteApplicationRecord(s.client, "user-id", "application-id")).rejects.toThrow("admin access required");
    expect(s.client.from).not.toHaveBeenCalled();
    expect(s.remove).not.toHaveBeenCalled();
  });
  it("removes only the selected application and its CV", async () => {
    const s = setup();
    await expect(deleteApplicationRecord(s.client, "admin-id", "application-id")).resolves.toEqual({ ok: true });
    expect(s.client.rpc).toHaveBeenCalledWith("has_role", { _user_id: "admin-id", _role: "admin" });
    expect(s.readEq).toHaveBeenCalledWith("id", "application-id");
    expect(s.remove).toHaveBeenCalledWith(["private/cv.pdf"]);
    expect(s.deleteEq).toHaveBeenCalledWith("id", "application-id");
  });
  it("keeps the application if CV removal fails", async () => {
    const s = setup(true, { message: "unavailable" });
    await expect(deleteApplicationRecord(s.client, "admin-id", "application-id")).rejects.toThrow("Couldn’t delete the CV");
    expect(s.deleteRow).not.toHaveBeenCalled();
  });
});