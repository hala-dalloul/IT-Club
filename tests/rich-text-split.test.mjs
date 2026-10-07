import assert from "node:assert/strict";
import { test } from "node:test";
import {
  encodeRichText,
  plainRichText,
  richTextHtml,
  splitRichTextAtHalf,
} from "../src/lib/club/rich-text.ts";

test("plain news text is split near its word-safe midpoint without losing content", () => {
  const source = "one two three four five six seven eight nine ten";
  const [lead, continuation] = splitRichTextAtHalf(source);

  assert.ok(lead.length > 0);
  assert.ok(continuation.length > 0);
  assert.equal(`${lead} ${continuation}`, source);
  assert.ok(Math.abs(lead.length - continuation.length) <= 8);
});

test("rich news text keeps valid formatting and all visible text across both halves", () => {
  const source = encodeRichText(
    "<p>First paragraph has <strong>important words</strong> for readers.</p>" +
      "<p>Second paragraph continues the full newspaper story safely.</p>",
  );
  const [lead, continuation] = splitRichTextAtHalf(source);

  assert.ok(lead.startsWith("::club-rich-text-v1::"));
  assert.ok(continuation.startsWith("::club-rich-text-v1::"));
  assert.doesNotMatch(richTextHtml(lead), /<[^>]*$/);
  assert.doesNotMatch(richTextHtml(continuation), /<[^>]*$/);
  assert.equal(
    `${plainRichText(lead)} ${plainRichText(continuation)}`.replace(/\s+/g, " "),
    plainRichText(source).replace(/\s+/g, " "),
  );
});
