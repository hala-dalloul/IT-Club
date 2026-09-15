-- Run once in Supabase SQL Editor. Historical creation times are unavailable;
-- use the last known update as a backfill only for existing rows.
begin;
alter table public.club_content add column if not exists created_at timestamptz;
update public.club_content set created_at = updated_at where created_at is null;
alter table public.club_content alter column created_at set default now();
alter table public.club_content alter column created_at set not null;
create or replace function club_private.preserve_content_created_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then new.created_at := now();
  else new.created_at := old.created_at;
  end if;
  return new;
end;
$$;
drop trigger if exists preserve_content_created_at on public.club_content;
create trigger preserve_content_created_at before insert or update on public.club_content
for each row execute function club_private.preserve_content_created_at();
commit;
