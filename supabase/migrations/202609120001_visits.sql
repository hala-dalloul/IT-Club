-- Anonymous session visits, not unique people. No IP addresses or personal data.
-- Run once in the Supabase SQL Editor. Existing counts are preserved on reruns.
create table if not exists public.club_visits (
  id uuid primary key
);
alter table public.club_visits enable row level security;
revoke all on public.club_visits from anon, authenticated;
create or replace function public.record_club_visit(visit_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if visit_id is null then raise exception 'Missing visit ID'; end if;
  insert into public.club_visits(id) values (visit_id) on conflict do nothing;
  return (select count(*) from public.club_visits);
end;
$$;
revoke all on function public.record_club_visit(uuid) from public;
grant execute on function public.record_club_visit(uuid) to anon, authenticated;
