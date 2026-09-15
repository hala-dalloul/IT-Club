import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

test("creation timestamp migration backfills legacy rows and preserves insert time", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create schema club_private;
      create table public.club_content(id integer primary key, updated_at timestamptz default now());
      insert into public.club_content values(1, '2026-01-01T00:00:00Z');`);
    const sql = readFileSync("supabase/migrations/202609150001_content_created_at.sql", "utf8");
    await db.exec(sql);
    await db.exec(sql);
    const legacy = await db.query(
      "select created_at = updated_at as correct from club_content where id=1",
    );
    assert.equal(legacy.rows[0].correct, true);
    await db.exec("insert into club_content(id, created_at) values(2, '2000-01-01T00:00:00Z')");
    const before = (await db.query("select created_at::text as stamp from club_content where id=2"))
      .rows[0].stamp;
    assert.ok(!before.startsWith("2000"));
    await db.exec(
      "update club_content set updated_at = '2030-01-01', created_at = '2001-01-01' where id=2",
    );
    const after = (await db.query("select created_at::text as stamp from club_content where id=2"))
      .rows[0].stamp;
    assert.equal(after, before);
  } finally {
    await db.close();
  }
});
