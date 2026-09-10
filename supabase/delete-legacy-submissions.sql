-- Run once in Supabase SQL Editor. User-requested deletion of old form submissions only.
-- Google Sheets, content, images, settings and accounts are not touched.
begin;
delete from public.club_submissions
where kind in ('joinRequests', 'contactMessages');
select count(*) as remaining_submissions
from public.club_submissions
where kind in ('joinRequests', 'contactMessages');
commit;
