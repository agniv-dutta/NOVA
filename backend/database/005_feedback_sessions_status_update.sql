-- Allow richer session states for employee flow

alter table if exists public.feedback_sessions
  drop constraint if exists feedback_sessions_status_check;

alter table if exists public.feedback_sessions
  add constraint feedback_sessions_status_check
  check (status in ('scheduled', 'in_progress', 'completed', 'skipped', 'declined'));

alter table if exists public.feedback_sessions
  add column if not exists updated_at timestamptz not null default now();
