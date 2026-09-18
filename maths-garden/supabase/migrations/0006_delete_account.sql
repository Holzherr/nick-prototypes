-- A parent can delete their own account from the app.
--
-- Deleting the auth user removes everything they own: children cascade from auth.users, and every progress
-- table cascades from children. maths_events and maths_feedback hold no user id, so nothing there points back.
-- security definer because the publishable key cannot touch auth.users; auth.uid() pins it to the caller,
-- and it is null (deleting nothing) for anyone not signed in.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
