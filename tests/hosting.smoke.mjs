import assert from "node:assert/strict";
const paths = [
  "/",
  "/club",
  "/club/about",
  "/club/projects",
  "/club/projects/example",
  "/club/members",
  "/club/events",
  "/club/achievements",
  "/club/partners",
  "/club/join",
  "/club/contact",
  "/club/admin",
  "/admin",
];
for (const path of paths) {
  const response = await fetch(`http://127.0.0.1:5000${path}`);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get("content-type") || "", /text\/html/);
  const html = await response.text();
  assert.match(html, /<script\b/);
}
const icon = await fetch("http://127.0.0.1:5000/favicon.png");
assert.equal(icon.status, 200);
assert.match(icon.headers.get("content-type") || "", /image\/png/);
console.log(`Hosting smoke checks passed for ${paths.length} routes and the club icon.`);
