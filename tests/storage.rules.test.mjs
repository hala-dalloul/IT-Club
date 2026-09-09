import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getBytes } from "firebase/storage";
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-ucas-it-club",
    firestore: { host: "127.0.0.1", port: 8085 },
    storage: { host: "127.0.0.1", port: 9199, rules: readFileSync("storage.rules", "utf8") },
  });
});
after(async () => {
  await env?.cleanup();
});
beforeEach(async () => {
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admins", "editor"), { uid: "editor", role: "editor" });
  });
});
const storage = (uid) =>
  uid ? env.authenticatedContext(uid).storage() : env.unauthenticatedContext().storage();
test("visitors cannot upload files", async () => {
  await assertFails(
    uploadBytes(ref(storage(), "content/editor/test"), new Uint8Array([1, 2]), {
      contentType: "image/png",
    }),
  );
});
test("editor uploads an image and visitors can read it", async () => {
  await assertSucceeds(
    uploadBytes(ref(storage("editor"), "content/editor/test"), new Uint8Array([1, 2]), {
      contentType: "image/png",
    }),
  );
  await assertSucceeds(getBytes(ref(storage(), "content/editor/test")));
});
test("HTML, oversized images, other owners and overwrites are denied", async () => {
  const s = storage("editor");
  await assertFails(
    uploadBytes(ref(s, "content/editor/html"), new Uint8Array([1]), { contentType: "text/html" }),
  );
  await assertFails(
    uploadBytes(ref(s, "content/editor/large"), new Uint8Array(5 * 1024 * 1024 + 1), {
      contentType: "image/png",
    }),
  );
  await assertFails(
    uploadBytes(ref(s, "content/other/test"), new Uint8Array([1]), { contentType: "image/png" }),
  );
  await uploadBytes(ref(s, "content/editor/once"), new Uint8Array([1]), {
    contentType: "image/png",
  });
  await assertFails(
    uploadBytes(ref(s, "content/editor/once"), new Uint8Array([2]), { contentType: "image/png" }),
  );
});
