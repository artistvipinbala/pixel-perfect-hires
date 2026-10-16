import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut, Search, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { APPLICATION_STATUSES } from "@/lib/application-rules";
import { checkAdmin, getApplication, listApplications, updateApplicationStatus } from "@/lib/applications.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Applications | Artist Vipin Bala" },
      { name: "description", content: "Private dashboard for reviewing job applications." },
      { property: "og:title", content: "Admin · Artist Vipin Bala" },
      { property: "og:description", content: "Private recruitment dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <Centered><Loader2 className="h-6 w-6 animate-spin text-primary" /></Centered>;
  if (!session) return <Login />;
  return <AdminGate key={session.user.id} email={session.user.email ?? ""} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-background px-4">{children}</main>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("Invalid email or password.");
    setBusy(false);
  }
  return (
    <Centered>
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-walnut">Artist Vipin Bala</p>
        <h1 className="mt-2 text-2xl font-bold">Admin sign in</h1>
        <div className="mt-6 space-y-4">
          <div><Label htmlFor="em">Email</Label><Input id="em" type="email" autoComplete="email" className="mt-1.5 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" autoComplete="current-password" className="mt-1.5 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="cta" className="h-11 w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : "Sign in"}</Button>
        </div>
      </form>
    </Centered>
  );
}

function AdminGate({ email }: { email: string }) {
  const check = useServerFn(checkAdmin);
  const q = useQuery({ queryKey: ["isAdmin"], queryFn: () => check(), retry: false });
  if (q.isLoading) return <Centered><Loader2 className="h-6 w-6 animate-spin text-primary" /></Centered>;
  if (q.isError || !q.data?.isAdmin)
    return (
      <Centered>
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">{email} is signed in but isn’t authorised to view applications.</p>
          <Button className="mt-6" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </Centered>
    );
  return <Dashboard email={email} />;
}

function statusVariant(s: string) {
  return s === "Shortlisted" ? "default" : s === "Rejected" ? "destructive" : s === "New" ? "secondary" : "outline";
}

function Dashboard({ email }: { email: string }) {
  const list = useServerFn(listApplications);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);

  const q = useQuery({
    queryKey: ["applications", debounced, status],
    queryFn: () => list({ data: { search: debounced, status: status === "all" ? undefined : status } }),
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-walnut">Artist Vipin Bala</p>
            <h1 className="text-xl font-bold">Applications</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}><LogOut /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search applications" placeholder="Search name, phone or email" className="h-11 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          {q.isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : q.isError ? (
            <div className="rounded-2xl border border-destructive/40 bg-card p-6 text-center">
              <p className="text-destructive">Couldn’t load applications.</p>
              <Button variant="outline" className="mt-3" onClick={() => q.refetch()}>Try again</Button>
            </div>
          ) : !q.data?.length ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
              {debounced || status !== "all" ? "No applications match your filters." : "No applications yet."}
            </div>
          ) : (
            <ul className="grid gap-3">
              {q.data.map((a) => (
                <li key={a.id}>
                  <button onClick={() => setOpenId(a.id)} className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-colors hover:border-primary">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{a.full_name}</p>
                        <p className="truncate text-sm text-muted-foreground">{a.phone} · {a.email}</p>
                      </div>
                      <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {a.place} · {a.education === "Other" ? a.education_other : a.education} · {fmt(a.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {openId && <Detail id={openId} />}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function Detail({ id }: { id: string }) {
  const get = useServerFn(getApplication);
  const update = useServerFn(updateApplicationStatus);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["application", id], queryFn: () => get({ data: { id } }), staleTime: 0 });
  const m = useMutation({
    mutationFn: (status: string) => update({ data: { id, status } }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["application", id] }); },
    onError: () => toast.error("Couldn’t update status"),
  });

  if (q.isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (q.isError || !q.data) return <p className="py-10 text-center text-destructive">Couldn’t load this application.</p>;
  const a = q.data;
  const rows: [string, string][] = [
    ["Full Name", a.full_name], ["Phone", a.phone], ["Email", a.email], ["Place", a.place],
    ["Education", a.education], ...(a.education === "Other" ? [["Qualification", a.education_other ?? ""] as [string, string]] : []),
    ["Submitted", fmt(a.created_at)], ["Consent given", fmt(a.consent_at)],
    ["CV file", `${a.cv_filename} (${Math.round(a.cv_size / 1024)} KB)`],
  ];
  return (
    <div>
      <SheetHeader className="px-0">
        <SheetTitle className="text-2xl">{a.full_name}</SheetTitle>
        <SheetDescription>Application details</SheetDescription>
      </SheetHeader>
      <div className="mt-4">
        <Label>Status</Label>
        <Select value={a.status} onValueChange={(v) => m.mutate(v)} disabled={m.isPending}>
          <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>{APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <dl className="mt-6 divide-y divide-border rounded-2xl border border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="col-span-2 break-words font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        {a.downloadUrl && <Button variant="cta" asChild><a href={a.downloadUrl}><Download /> Download CV</a></Button>}
        {a.previewUrl && <Button variant="outline" asChild><a href={a.previewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open in new tab</a></Button>}
        <Button variant="ghost" onClick={() => q.refetch()}>Refresh links</Button>
      </div>
      {a.cv_mime === "application/pdf" && a.previewUrl && (
        <iframe title="CV preview" src={a.previewUrl} className="mt-6 h-[70vh] w-full rounded-2xl border border-border bg-muted" />
      )}
      {a.cv_mime?.startsWith("image/") && a.previewUrl && (
        <img src={a.previewUrl} alt={`CV of ${a.full_name}`} className="mt-6 w-full rounded-2xl border border-border bg-muted" />
      )}
      <p className="mt-3 text-xs text-muted-foreground">CV links expire after 5 minutes. Use “Refresh links” if one stops working.</p>
    </div>
  );
}
