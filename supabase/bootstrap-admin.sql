-- First create itclub@ucas.edu.ps in Authentication > Users > Add user.
-- Run this separately AFTER 202609090001_club.sql.
do $$
declare owner_id uuid;
begin
 select id into owner_id from auth.users where lower(email)='itclub@ucas.edu.ps';
 if owner_id is null then raise exception 'Create itclub@ucas.edu.ps in Authentication > Users first';end if;
 insert into public.club_admins(id,name,email,role) values(owner_id,'UCAS IT CLUB','itclub@ucas.edu.ps','super_admin')
 on conflict(id) do update set role='super_admin',name=excluded.name,email=excluded.email;
end;$$;
