-- Employee actions tables: meetings, internal messages, recognitions

create extension if not exists pgcrypto;

create table if not exists public.scheduled_meetings (
    id uuid primary key default gen_random_uuid(),
    employee_id text not null,
    scheduled_by text not null,
    manager_id text,
    meeting_type text not null default '1on1' check (meeting_type in ('1on1')),
    scheduled_date timestamptz not null,
    notes text,
    urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed')),
    created_at timestamptz not null default now()
);

create table if not exists public.internal_messages (
    id uuid primary key default gen_random_uuid(),
    to_employee_id text not null,
    from_user_id text not null,
    subject text not null,
    body text not null,
    message_type text not null default 'general' check (message_type in ('general', 'recognition', 'alert', 'action_required')),
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.recognitions (
    id uuid primary key default gen_random_uuid(),
    employee_id text not null,
    given_by text not null,
    recognition_type text not null check (recognition_type in ('above_and_beyond', 'team_player', 'innovation', 'milestone', 'customer_impact')),
    message text not null,
    is_public boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists idx_scheduled_meetings_employee on public.scheduled_meetings(employee_id, scheduled_date desc);
create index if not exists idx_internal_messages_to_employee on public.internal_messages(to_employee_id, created_at desc);
create index if not exists idx_recognitions_employee on public.recognitions(employee_id, created_at desc);

alter table public.scheduled_meetings enable row level security;
alter table public.internal_messages enable row level security;
alter table public.recognitions enable row level security;

-- Service role full access (backend writes through service key)
create policy if not exists "Service role full access scheduled meetings"
    on public.scheduled_meetings for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy if not exists "Service role full access internal messages"
    on public.internal_messages for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy if not exists "Service role full access recognitions"
    on public.recognitions for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Employees read own rows only
create policy if not exists "Employees read own meetings"
    on public.scheduled_meetings for select
    using (employee_id = coalesce(auth.jwt() ->> 'sub', auth.email()));

create policy if not exists "Employees read own inbox"
    on public.internal_messages for select
    using (to_employee_id = coalesce(auth.jwt() ->> 'sub', auth.email()));

create policy if not exists "Employees read own recognitions"
    on public.recognitions for select
    using (employee_id = coalesce(auth.jwt() ->> 'sub', auth.email()));

-- HR and leadership read all rows
create policy if not exists "HR leadership read all meetings"
    on public.scheduled_meetings for select
    using ((auth.jwt() ->> 'role') in ('hr', 'leadership'));

create policy if not exists "HR leadership read all messages"
    on public.internal_messages for select
    using ((auth.jwt() ->> 'role') in ('hr', 'leadership'));

create policy if not exists "HR leadership read all recognitions"
    on public.recognitions for select
    using ((auth.jwt() ->> 'role') in ('hr', 'leadership'));
