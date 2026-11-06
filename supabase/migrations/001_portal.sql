begin;

create table public.club_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 1200),
  practices text not null default '' check (char_length(practices) <= 250),
  interests text not null default '' check (char_length(interests) <= 250),
  open_to text not null default '' check (char_length(open_to) <= 250),
  is_public boolean not null default false
);

create table public.club_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.club_profiles(id) on delete cascade,
  kind text not null check (kind in ('work', 'publication')),
  title text not null check (char_length(btrim(title)) between 1 and 140),
  body text not null check (char_length(btrim(body)) between 1 and 12000),
  world text not null check (world in ('dark', 'slavic', 'magic', 'romantic', 'sciences', 'selfmade')),
  topics text not null default '' check (char_length(topics) <= 250),
  url text check (url is null or (char_length(url) <= 1024 and url ~ '^https://[^[:space:]]+$')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  check (kind <> 'work' or url is not null)
);
create index club_entries_author_idx on public.club_entries (author_id, created_at desc);
create index club_entries_published_idx on public.club_entries (created_at desc) where status = 'published';

create table public.club_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_key text not null check (entity_key ~ '^(work|person|entry|member):[a-z0-9-]{1,60}$'),
  primary key (user_id, entity_key)
);

alter table public.club_profiles enable row level security;
alter table public.club_entries enable row level security;
alter table public.club_saves enable row level security;

revoke all on public.club_profiles, public.club_entries, public.club_saves from anon, authenticated;
grant select on public.club_profiles, public.club_entries to anon;
grant select, insert, update on public.club_profiles to authenticated;
grant select, insert on public.club_entries to authenticated;
grant update (kind, title, body, world, topics, url, status) on public.club_entries to authenticated;
grant select, insert, delete on public.club_saves to authenticated;

create policy profiles_read on public.club_profiles for select to anon, authenticated
  using (is_public or id = (select auth.uid()));
create policy profiles_insert on public.club_profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update on public.club_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy entries_read on public.club_entries for select to anon, authenticated
  using (author_id = (select auth.uid()) or
    (status = 'published' and exists (
      select 1 from public.club_profiles where id = author_id and is_public
    )));
create policy entries_insert on public.club_entries for insert to authenticated
  with check (author_id = (select auth.uid()) and
    (status = 'draft' or exists (select 1 from public.club_profiles where id = author_id and is_public)));
create policy entries_update on public.club_entries for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()) and
    (status = 'draft' or exists (select 1 from public.club_profiles where id = author_id and is_public)));

create policy saves_read on public.club_saves for select to authenticated
  using (user_id = (select auth.uid()));
create policy saves_insert on public.club_saves for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy saves_delete on public.club_saves for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
