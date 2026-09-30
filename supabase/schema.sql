-- PHOS shared annotation contract
-- Run this in the Supabase SQL editor before wiring the browser adapter.

create extension if not exists pgcrypto;

create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author text not null check (char_length(trim(author)) between 1 and 80),
  title text not null check (char_length(trim(title)) between 1 and 140),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  lens text not null check (lens in ('philosophy', 'psychology', 'parallels', 'world', 'personal')),
  source_type text not null check (source_type in ('study', 'panel', 'edit')),
  source_id text not null,
  spoiler_level text not null default 'none' check (spoiler_level in ('none', 'mild', 'major')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden', 'rejected')),
  reaction_count integer not null default 0 check (reaction_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists annotations_browse_idx
  on public.annotations (source_type, source_id, status, created_at desc);
create index if not exists annotations_lens_idx
  on public.annotations (lens, status, created_at desc);

create table if not exists public.annotation_reactions (
  annotation_id uuid not null references public.annotations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('resonates', 'question', 'different')),
  created_at timestamptz not null default now(),
  primary key (annotation_id, user_id)
);

create or replace function public.refresh_annotation_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.annotations
  set reaction_count = (
    select count(*) from public.annotation_reactions
    where annotation_id = coalesce(new.annotation_id, old.annotation_id)
  )
  where id = coalesce(new.annotation_id, old.annotation_id);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists annotation_reaction_count on public.annotation_reactions;
create trigger annotation_reaction_count
after insert or update or delete on public.annotation_reactions
for each row execute function public.refresh_annotation_reaction_count();

alter table public.annotations enable row level security;
alter table public.annotation_reactions enable row level security;

create policy "approved annotations are public"
  on public.annotations for select
  using (status = 'approved' or user_id = auth.uid());

create policy "signed-in visitors can submit annotations"
  on public.annotations for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

create policy "authors can edit pending annotations"
  on public.annotations for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');

create policy "authors can remove pending annotations"
  on public.annotations for delete to authenticated
  using (user_id = auth.uid() and status = 'pending');

create policy "approved reactions are public"
  on public.annotation_reactions for select
  using (true);

create policy "signed-in visitors can react once"
  on public.annotation_reactions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.annotations
      where annotations.id = annotation_id
        and annotations.status = 'approved'
    )
  );

create policy "visitors can change their reaction"
  on public.annotation_reactions for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.annotations
      where annotations.id = annotation_id
        and annotations.status = 'approved'
    )
  );

create policy "visitors can remove their reaction"
  on public.annotation_reactions for delete to authenticated
  using (user_id = auth.uid());
