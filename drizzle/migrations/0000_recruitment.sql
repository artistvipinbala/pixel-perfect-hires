create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create type public.application_status as enum ('New','Reviewed','Shortlisted','Contacted','Rejected');
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  full_name text not null,
  phone text not null,
  email text not null,
  place text not null,
  education text not null,
  education_other text,
  consent_at timestamptz not null,
  cv_path text not null,
  cv_filename text not null,
  cv_mime text not null,
  cv_size integer not null,
  status public.application_status not null default 'New',
  submitter_ip text,
  created_at timestamptz not null default now()
);
create index on public.applications (created_at desc);
create index on public.applications (submitter_ip, created_at);
grant select, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Admins read applications" on public.applications for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update applications" on public.applications for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Admins read resumes" on storage.objects for select to authenticated using (bucket_id = 'resumes' and public.has_role(auth.uid(),'admin'));