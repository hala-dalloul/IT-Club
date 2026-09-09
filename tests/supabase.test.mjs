import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test, before, after } from "node:test";
let db;
const owner = "00000000-0000-4000-8000-000000000001",
  editor = "00000000-0000-4000-8000-000000000002",
  outsider = "00000000-0000-4000-8000-000000000003";
const media = "00000000-0000-4000-8000-000000000010";
const path = editor + "/" + media + ".webp";
const image =
  "https://jxweaxenswbjpxxjmihb.supabase.co/storage/v1/object/public/club-media/" + path;
before(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create schema storage;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,storage to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant select,insert,delete on storage.objects to authenticated;create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`,
  );
  await db.exec(readFileSync("supabase/migrations/202609090001_club.sql", "utf8"));
  await db.query("insert into auth.users values($1,$2),($3,$4),($5,$6)", [
    owner,
    "owner@test.invalid",
    editor,
    "editor@test.invalid",
    outsider,
    "outsider@test.invalid",
  ]);
  await db.query("insert into public.club_admins values($1,$2,$3,$4),($5,$6,$7,$8)", [
    owner,
    "Owner",
    "owner@test.invalid",
    "super_admin",
    editor,
    "Editor",
    "editor@test.invalid",
    "editor",
  ]);
});
after(async () => db?.close());
async function as(id) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id || ""]);
  await db.exec("set role " + (id ? "authenticated" : "anon"));
}
const payload = {
  title: "مشروع تجريبي",
  title_en: "Test project",
  description: "وصف المشروع التجريبي",
  description_en: "A project description",
  images: [],
  category: "web",
  year: 2026,
  technologies: [],
  memberIds: [],
};
const addContent = (value = payload) =>
  db.query("insert into public.club_content(kind,data) values($1,$2) returning id,updated_by", [
    "projects",
    JSON.stringify(value),
  ]);
test("anonymous cannot write content, read applications or grant themselves admin", async () => {
  await as(null);
  await assert.rejects(() => addContent());
  await assert.rejects(() => db.query("select * from public.club_submissions"));
  await assert.rejects(() =>
    db.query("insert into public.club_admins values($1,$2,$3,$4)", [
      outsider,
      "Outsider",
      "out@test.invalid",
      "super_admin",
    ]),
  );
});
test("outsider has no content access to write and cannot escalate", async () => {
  await as(outsider);
  await assert.rejects(() => addContent());
  await assert.rejects(() =>
    db.query("insert into public.club_admins values($1,$2,$3,$4)", [
      outsider,
      "Outsider",
      "out@test.invalid",
      "editor",
    ]),
  );
});
test("editor writes valid content and server owns audit fields", async () => {
  await as(editor);
  const result = await addContent();
  assert.equal(result.rows[0].updated_by, editor);
  await assert.rejects(() => addContent({ ...payload, year: 1800 }));
  await assert.rejects(() => addContent({ ...payload, unknown: true }));
  await as(null);
  assert.ok((await db.query("select * from public.club_content")).rows.length > 0);
});
test("public submissions are valid only and cannot inject status", async () => {
  await as(null);
  const data = {
    name: "Test Sender",
    email: "sender@test.invalid",
    message: "This is a test message.",
  };
  await db.query("insert into public.club_submissions(kind,data) values($1,$2)", [
    "contactMessages",
    JSON.stringify(data),
  ]);
  await assert.rejects(() =>
    db.query(
      "insert into public.club_submissions(kind,data,status) values('contactMessages',$1,'accepted')",
      [JSON.stringify(data)],
    ),
  );
  await assert.rejects(() =>
    db.query("insert into public.club_submissions(kind,data) values('contactMessages',$1)", [
      JSON.stringify({ ...data, email: "bad" }),
    ]),
  );
});
test("editor changes flags but cannot alter submitted data or settings", async () => {
  await as(editor);
  await db.exec("update public.club_submissions set is_read=true");
  await assert.rejects(() => db.exec("update public.club_submissions set data='{}'"));
  await assert.rejects(() => db.exec("insert into public.club_settings values('public','{}')"));
});
test("super admin grants and revokes editors but cannot delete itself", async () => {
  await as(owner);
  await db.query("insert into public.club_admins values($1,$2,$3,$4)", [
    outsider,
    "New Editor",
    "out@test.invalid",
    "editor",
  ]);
  await as(outsider);
  await addContent();
  await as(owner);
  await db.query("delete from public.club_admins where id=$1", [outsider]);
  const removed = await db.query("delete from public.club_admins where id=$1 returning id", [
    owner,
  ]);
  assert.equal(removed.rows.length, 0);
  await as(outsider);
  await assert.rejects(() => addContent());
});
test("media library guards in-use files and updates links transactionally", async () => {
  await as(editor);
  await db.query("insert into storage.objects(bucket_id,name) values($1,$2)", ["club-media", path]);
  await db.query(
    "insert into public.club_media(name,path,size,mime,created_by) values($1,$2,$3,$4,$5)",
    ["test.webp", path, 200, "image/webp", editor],
  );
  const asset = (await db.query("select id from public.club_media where path=$1", [path])).rows[0]
    .id;
  const content = (await addContent({ ...payload, images: [image] })).rows[0].id;
  assert.equal(
    (await db.query("select * from public.club_content_media where media_id=$1", [asset])).rows
      .length,
    1,
  );
  await assert.rejects(() => db.query("select public.club_prepare_media_delete($1)", [asset]));
  const deleted = await db.query("delete from storage.objects where name=$1 returning name", [
    path,
  ]);
  assert.equal(deleted.rows.length, 0);
  await db.query("update public.club_content set data=$1 where id=$2", [
    JSON.stringify(payload),
    content,
  ]);
  await db.query("select public.club_prepare_media_delete($1)", [asset]);
  await assert.rejects(() =>
    db.query("update public.club_content set data=$1 where id=$2", [
      JSON.stringify({ ...payload, images: [image] }),
      content,
    ]),
  );
  await db.query("delete from storage.objects where name=$1", [path]);
  await db.query("delete from public.club_media where id=$1", [asset]);
  assert.equal(
    (await db.query("select * from public.club_media where id=$1", [asset])).rows.length,
    0,
  );
});
test("editor cannot write into another uploader folder", async () => {
  await as(editor);
  await assert.rejects(() =>
    db.query("insert into storage.objects(bucket_id,name) values($1,$2)", [
      "club-media",
      owner + "/wrong.webp",
    ]),
  );
});
