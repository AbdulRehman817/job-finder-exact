-- Supabase schema for Jobpilot

create extension if not exists "pgcrypto";

-- Utility for updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text check (role in ('candidate', 'employer')) default 'candidate',
  full_name text default '',
  avatar_url text,
  title text,
  location text,
  bio text,
  skills text[],
  education text,
  experience_years integer,
  phone text,
  linkedin_url text,
  github_url text,
  website text,
  resume_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profiles on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  logo_url text,
  description text,
  website text,
  location text,
  industry text,
  size text,
  founded text,
  email text,
  phone text,
  linkedin_url text,
  twitter_url text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- Jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  location text not null,
  type text not null,
  salary_min numeric,
  salary_max numeric,
  currency text default 'USD',
  experience_level text,
  category text,
  benefits text[],
  requirements text[],
  responsibilities text[],
  featured boolean default false,
  status text check (status in ('active', 'closed', 'draft')) default 'active',
  posted_date timestamptz default now(),
  expiry_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

-- Job applications
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  cover_letter text,
  resume_url text,
  status text check (status in ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')) default 'pending',
  applied_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (job_id, user_id)
);

drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

-- Saved jobs
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  saved_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (job_id, user_id)
);

drop trigger if exists saved_jobs_set_updated_at on public.saved_jobs;
create trigger saved_jobs_set_updated_at
before update on public.saved_jobs
for each row execute function public.set_updated_at();

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text default 'general',
  title text not null,
  message text not null,
  job_id uuid references public.jobs (id) on delete set null,
  application_id uuid references public.job_applications (id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Companies policies
drop policy if exists "Companies are viewable by everyone" on public.companies;
create policy "Companies are viewable by everyone"
on public.companies for select
using (true);

drop policy if exists "Employers can create companies" on public.companies;
create policy "Employers can create companies"
on public.companies for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer')
);

drop policy if exists "Company owners can update" on public.companies;
create policy "Company owners can update"
on public.companies for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Company owners can delete" on public.companies;
create policy "Company owners can delete"
on public.companies for delete
to authenticated
using (auth.uid() = user_id);

-- Jobs policies
drop policy if exists "Public can view active jobs or own jobs" on public.jobs;
create policy "Public can view active jobs or own jobs"
on public.jobs for select
using (status = 'active' or user_id = auth.uid());

drop policy if exists "Employers can create jobs" on public.jobs;
create policy "Employers can create jobs"
on public.jobs for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer')
);

drop policy if exists "Job owners can update" on public.jobs;
create policy "Job owners can update"
on public.jobs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Job owners can delete" on public.jobs;
create policy "Job owners can delete"
on public.jobs for delete
to authenticated
using (auth.uid() = user_id);

-- Job applications policies
drop policy if exists "Applicants or job owners can view applications" on public.job_applications;
create policy "Applicants or job owners can view applications"
on public.job_applications for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid())
);

drop policy if exists "Candidates can apply" on public.job_applications;
create policy "Candidates can apply"
on public.job_applications for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'candidate')
);

drop policy if exists "Job owners can update application status" on public.job_applications;
create policy "Job owners can update application status"
on public.job_applications for update
to authenticated
using (
  exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid())
)
with check (
  exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid())
);

-- Saved jobs policies
drop policy if exists "Users can view their saved jobs" on public.saved_jobs;
create policy "Users can view their saved jobs"
on public.saved_jobs for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can save jobs" on public.saved_jobs;
create policy "Users can save jobs"
on public.saved_jobs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can delete saved jobs" on public.saved_jobs;
create policy "Users can delete saved jobs"
on public.saved_jobs for delete
to authenticated
using (user_id = auth.uid());

-- Notifications policies
drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their notifications" on public.notifications;
create policy "Users can delete their notifications"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Applicants and job owners can send notifications" on public.notifications;
create policy "Applicants and job owners can send notifications"
on public.notifications for insert
to authenticated
with check (
  (
    application_id is not null
    and job_id is not null
    and exists (
      select 1
      from public.job_applications a
      join public.jobs j on j.id = a.job_id
      where a.id = application_id
        and j.id = job_id
        and (
          (a.user_id = auth.uid() and notifications.user_id = j.user_id)
          or (j.user_id = auth.uid() and notifications.user_id = a.user_id)
        )
    )
  )
  or (user_id = auth.uid())
);
