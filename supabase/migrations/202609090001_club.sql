-- UCAS IT Club: run this entire file once in Supabase SQL Editor.
-- Additive migration. Does not drop existing Firebase data or Supabase tables.
begin;
create schema if not exists club_private;
revoke all on schema club_private from public;
grant usage on schema club_private to anon, authenticated;
create table public.club_admins (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(length(name) between 2 and 200),
 email text not null check(length(email) between 3 and 254),
 role text not null check(role in ('editor','super_admin'))
);
create function club_private.is_editor() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.club_admins where id=(select auth.uid()) and role in ('editor','super_admin'));
$$;
create function club_private.is_super() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.club_admins where id=(select auth.uid()) and role='super_admin');
$$;
create function club_private.valid_text(d jsonb,k text,lo int,hi int) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(d->k)='string' and length(trim(d->>k)) between lo and hi,false);
$$;
create function club_private.valid_content(k text,d jsonb) returns boolean language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(d)<>'object' or not club_private.valid_text(d,'title',2,200) or not club_private.valid_text(d,'title_en',2,200) or not club_private.valid_text(d,'description',2,20000) or not club_private.valid_text(d,'description_en',2,20000) then return false; end if;
 if jsonb_typeof(d->'images') is distinct from 'array' then return false; end if;
 if jsonb_array_length(d->'images')>20 then return false; end if;
 if exists(select 1 from jsonb_object_keys(d) a where a not in ('title','title_en','description','description_en','images','category','year','technologies','memberIds','role','role_en','committee','isFounder','date','status','partnershipType','partnershipType_en','websiteUrl','githubUrl','linkedinUrl','demoUrl','apkUrl')) then return false; end if;
 if k='projects' then
  if coalesce(d->>'category','') not in ('web','mobile','games','multimedia') or jsonb_typeof(d->'year') is distinct from 'number' or (d->>'year')::numeric not between 2000 and 2100 or trunc((d->>'year')::numeric)<>(d->>'year')::numeric then return false; end if;
  if jsonb_typeof(d->'technologies') is distinct from 'array' or jsonb_typeof(d->'memberIds') is distinct from 'array' then return false; end if;
  if jsonb_array_length(d->'technologies')>50 or jsonb_array_length(d->'memberIds')>100 then return false;end if;
 end if;
 if k='members' and (coalesce(d->>'committee','') not in ('media','relations','activities','development') or jsonb_typeof(d->'isFounder') is distinct from 'boolean') then return false;end if;
 if k in ('events','achievements') and coalesce(d->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' then return false;end if;
 if k='events' and coalesce(d->>'status','') not in ('upcoming','past') then return false;end if;
 return true;
end;$$;
create table public.club_content (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('projects','members','events','achievements','partners')),
 data jsonb not null check(club_private.valid_content(kind,data)),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
create index club_content_kind_updated on public.club_content(kind,updated_at desc);
create table public.club_settings(id text primary key check(id='public'),data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<100000));
create function club_private.valid_submission(k text,d jsonb) returns boolean language plpgsql immutable set search_path='' as $$
begin
 if jsonb_typeof(d)<>'object' or not club_private.valid_text(d,'email',3,254) or coalesce(d->>'email','') !~ '^[^@ ]+@[^@ ]+[.][^@ ]+$' or not club_private.valid_text(d,'message',10,4000) then return false;end if;
 if k='contactMessages' then
  return club_private.valid_text(d,'name',2,200) and not exists(select 1 from jsonb_object_keys(d) a where a not in ('name','email','message'));
 end if;
 return club_private.valid_text(d,'fullName',2,200) and club_private.valid_text(d,'phone',0,30) and club_private.valid_text(d,'studentId',3,30) and club_private.valid_text(d,'major',2,200) and coalesce(d->>'preferredCommittee','') in ('media','relations','activities','development') and not exists(select 1 from jsonb_object_keys(d) a where a not in ('fullName','email','phone','studentId','major','preferredCommittee','message'));
end;$$;
create table public.club_submissions (
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('joinRequests','contactMessages')),
 data jsonb not null check(club_private.valid_submission(kind,data)),
 status text not null default 'new' check(status in ('new','accepted','rejected','archived')),
 is_read boolean not null default false,submitted_at timestamptz not null default now()
);
create index club_submissions_kind_created on public.club_submissions(kind,submitted_at desc);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('club-media','club-media',true,5242880,array['image/jpeg','image/png','image/webp']);
create table public.club_media (
 id uuid primary key default gen_random_uuid(),name text not null check(length(trim(name)) between 1 and 200),
 path text not null unique check(path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'),
 size bigint not null check(size between 1 and 5242880),mime text not null check(mime in ('image/jpeg','image/png','image/webp')),
 deleting boolean not null default false,created_at timestamptz not null default now(),created_by uuid not null references auth.users(id)
);
create table public.club_content_media(
 content_id uuid not null references public.club_content(id) on delete cascade,
 media_id uuid not null references public.club_media(id) on delete restrict,primary key(content_id,media_id)
);
create function club_private.media_url(p text) returns text language sql immutable set search_path='' as $$
 select 'https://jxweaxenswbjpxxjmihb.supabase.co/storage/v1/object/public/club-media/'||p;
$$;
create function club_private.audit_content() returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();new.updated_by=auth.uid();return new;
end;$$;
create trigger club_content_audit before insert or update on public.club_content for each row execute function club_private.audit_content();
create function club_private.sync_media() returns trigger language plpgsql security definer set search_path='' as $$
declare url text; asset uuid;
begin
 delete from public.club_content_media where content_id=new.id;
 for url in select jsonb_array_elements_text(new.data->'images') loop
  select id into asset from public.club_media where club_private.media_url(path)=url and not deleting for share;
  if not found then raise exception 'Image is missing or being deleted. Refresh the media library.';end if;
  insert into public.club_content_media(content_id,media_id) values(new.id,asset) on conflict do nothing;
 end loop;
 return new;
end;$$;
create trigger club_sync_media after insert or update of data on public.club_content for each row execute function club_private.sync_media();
create function club_private.can_delete_file(p text) returns boolean language sql stable security definer set search_path='' as $$
 select club_private.is_editor() and (
 exists(select 1 from public.club_media where path=p and deleting and not exists(select 1 from public.club_content_media where media_id=club_media.id))
 or (split_part(p,'/',1)=auth.uid()::text and not exists(select 1 from public.club_media where path=p)));
$$;
create function club_private.file_absent(p text) returns boolean language sql stable security definer set search_path='' as $$select not exists(select 1 from storage.objects where bucket_id='club-media' and name=p);$$;
create function public.club_prepare_media_delete(asset_id uuid) returns text language plpgsql security definer set search_path='' as $$
declare p text;
begin
 if not club_private.is_editor() then raise exception 'Not authorized';end if;
 select path into p from public.club_media where id=asset_id for update;
 if not found then raise exception 'Image not found';end if;
 if exists(select 1 from public.club_content_media where media_id=asset_id) then raise exception 'Image is used by published content';end if;
 update public.club_media set deleting=true where id=asset_id;return p;
end;$$;
alter table public.club_admins enable row level security;
alter table public.club_content enable row level security;
alter table public.club_settings enable row level security;
alter table public.club_submissions enable row level security;
alter table public.club_media enable row level security;
alter table public.club_content_media enable row level security;
revoke all on public.club_admins,public.club_content,public.club_settings,public.club_submissions,public.club_media,public.club_content_media from anon,authenticated;
grant select on public.club_content,public.club_settings to anon,authenticated;
grant insert(kind,data) on public.club_submissions to anon,authenticated;
grant select on public.club_admins,public.club_submissions,public.club_media,public.club_content_media to authenticated;
grant insert,update,delete on public.club_content,public.club_admins to authenticated;
grant insert,update on public.club_settings to authenticated;
grant update(status,is_read) on public.club_submissions to authenticated;
grant insert(name,path,size,mime,created_by) on public.club_media to authenticated;
grant update(name) on public.club_media to authenticated;
grant delete on public.club_media to authenticated;
create policy club_content_read on public.club_content for select using(true);
create policy club_content_write on public.club_content for all to authenticated using(club_private.is_editor()) with check(club_private.is_editor());
create policy club_settings_read on public.club_settings for select using(true);
create policy club_settings_write on public.club_settings for all to authenticated using(club_private.is_super()) with check(club_private.is_super());
create policy club_admins_read on public.club_admins for select to authenticated using(id=auth.uid() or club_private.is_super());
create policy club_admins_add on public.club_admins for insert to authenticated with check(club_private.is_super() and role='editor' and id<>auth.uid());
create policy club_admins_change on public.club_admins for update to authenticated using(club_private.is_super() and role='editor' and id<>auth.uid()) with check(role='editor' and id<>auth.uid());
create policy club_admins_delete on public.club_admins for delete to authenticated using(club_private.is_super() and role='editor' and id<>auth.uid());
create policy club_submissions_create on public.club_submissions for insert to anon,authenticated with check(status='new' and not is_read);
create policy club_submissions_read on public.club_submissions for select to authenticated using(club_private.is_editor());
create policy club_submissions_update on public.club_submissions for update to authenticated using(club_private.is_editor()) with check(club_private.is_editor());
create policy club_media_read on public.club_media for select to authenticated using(club_private.is_editor());
create policy club_media_add on public.club_media for insert to authenticated with check(club_private.is_editor() and created_by=auth.uid() and split_part(path,'/',1)=auth.uid()::text and not deleting and not club_private.file_absent(path));
create policy club_media_rename on public.club_media for update to authenticated using(club_private.is_editor()) with check(club_private.is_editor());
create policy club_media_delete on public.club_media for delete to authenticated using(club_private.is_editor() and deleting and club_private.file_absent(path));
create policy club_media_usage_read on public.club_content_media for select to authenticated using(club_private.is_editor());
create policy club_files_read on storage.objects for select to authenticated using(bucket_id='club-media' and club_private.is_editor());
create policy club_files_upload on storage.objects for insert to authenticated with check(bucket_id='club-media' and club_private.is_editor() and (storage.foldername(name))[1]=auth.uid()::text);
create policy club_files_delete on storage.objects for delete to authenticated using(bucket_id='club-media' and club_private.can_delete_file(name));
-- No UPDATE policy on objects: overwrites are not allowed.
revoke all on all functions in schema club_private from public;
grant execute on all functions in schema club_private to anon,authenticated;
revoke all on function public.club_prepare_media_delete(uuid) from public;
grant execute on function public.club_prepare_media_delete(uuid) to authenticated;
commit;
