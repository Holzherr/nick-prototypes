-- Maths Castle (native iPad/iPhone app, Holzherr/maths-castle-ios): one castle save per child, so a child's
-- castle survives a reinstall and moves between devices. Numbered after Maths Garden's 0010 because it lives
-- in the same Supabase project and hangs off the same children.
--
-- The app is local-first. `save` is the whole castle save, the same JSON object the web game keeps in
-- localStorage under 'maths-castle.v1'. A device pushes with a conditional update on `rev`
-- (PATCH ...?child_id=eq.<id>&rev=eq.<rev it last saw>, setting rev = that + 1); when another device pushed
-- in between, the update matches no row, and the app pulls, merges (specs/account-sync.md) and pushes again.
-- `changed_at` is when the save last changed on the device that pushed it (it decides "newest" in the merge);
-- `updated_at` is when the row was written.
--
-- Access: like every Maths Garden table, a parent reaches only their own children's rows (is_my_child, 0001).
-- Deleting the account (delete_my_account, 0006) removes these rows through the children cascade.

create table public.castle_saves (
  child_id uuid primary key references public.children (id) on delete cascade,
  save jsonb not null check (jsonb_typeof(save) = 'object' and pg_column_size(save) < 524288),
  rev bigint not null default 1 check (rev >= 1),
  changed_at timestamptz not null default now(),
  device text check (device is null or char_length(device) <= 80),
  updated_at timestamptz not null default now()
);

create or replace function public.castle_saves_touch() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger castle_saves_touch before insert or update on public.castle_saves
  for each row execute function public.castle_saves_touch();

alter table public.castle_saves enable row level security;

create policy "parents manage their children's castle saves" on public.castle_saves
  for all to authenticated using (public.is_my_child(child_id)) with check (public.is_my_child(child_id));

revoke all on public.castle_saves from anon;
grant select, insert, update, delete on public.castle_saves to authenticated;
