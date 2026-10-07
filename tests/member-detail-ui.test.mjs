import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const drawer = readFileSync("src/components/ui/information-drawer.tsx", "utf8");

test("member details keep a compact portrait directly beside the text", () => {
  assert.match(drawer, /grid-cols-\[128px_minmax\(0,1fr\)\]/);
  assert.match(drawer, /sm:grid-cols-\[184px_minmax\(0,1fr\)\]/);
  assert.match(drawer, /lg:grid-cols-\[232px_minmax\(0,1fr\)\]/);
  assert.match(drawer, /max-w-\[232px\]/);
});

test("member biography and social links stay in the text column", () => {
  const details = drawer.match(
    /<div className="min-w-0">([\s\S]*?)<\/div>\s*<\/div>\s*\{member\.images/,
  )?.[1];

  assert.ok(details, "member text column should be found");
  assert.match(details, /<RichText value=\{description\}/);
  assert.match(details, /member\.githubUrl/);
  assert.match(details, /member\.linkedinUrl/);
});
