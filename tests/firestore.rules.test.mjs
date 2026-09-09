import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-ucas-it-club",
    firestore: { host: "127.0.0.1", port: 8085, rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => {
  await env?.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "admins", "owner"), {
      uid: "owner",
      name: "Owner",
      email: "owner@example.test",
      role: "super_admin",
    });
    await setDoc(doc(db, "admins", "editor"), {
      uid: "editor",
      name: "Editor",
      email: "editor@example.test",
      role: "editor",
    });
  });
});
const as = (uid) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();
const content = (uid) => ({
  title: "مشروع اختبار",
  title_en: "Test project",
  description: "وصف مشروع اختبار",
  description_en: "Test project description",
  images: [],
  category: "web",
  year: 2026,
  technologies: ["React"],
  memberIds: [],
  updatedBy: uid,
  updatedAt: serverTimestamp(),
});
const join = () => ({
  fullName: "Test Applicant",
  email: "student@example.test",
  phone: "",
  studentId: "12345",
  major: "Software",
  preferredCommittee: "development",
  message: "I would like to join the club.",
  status: "new",
  submittedAt: serverTimestamp(),
});
test("visitor reads public content but cannot write it", async () => {
  await assertSucceeds(setDoc(doc(as("editor"), "projects", "p"), content("editor")));
  await assertSucceeds(getDoc(doc(as(), "projects", "p")));
  await assertFails(setDoc(doc(as(), "projects", "p2"), content("editor")));
});
test("authenticated outsider cannot write content or escalate privileges", async () => {
  await assertFails(setDoc(doc(as("outsider"), "projects", "p"), content("outsider")));
  await assertFails(
    setDoc(doc(as("outsider"), "admins", "outsider"), {
      uid: "outsider",
      name: "Outsider",
      email: "out@example.test",
      role: "super_admin",
    }),
  );
});
test("editor can manage content but cannot forge audit fields", async () => {
  const db = as("editor");
  await assertSucceeds(setDoc(doc(db, "projects", "p"), content("editor")));
  await assertFails(
    updateDoc(doc(db, "projects", "p"), { updatedBy: "owner", updatedAt: serverTimestamp() }),
  );
  await assertSucceeds(deleteDoc(doc(db, "projects", "p")));
});
test("editor cannot manage roles or settings", async () => {
  const db = as("editor");
  await assertFails(getDocs(collection(db, "admins")));
  await assertFails(
    setDoc(doc(db, "admins", "new"), {
      uid: "new",
      name: "New Editor",
      email: "new@example.test",
      role: "editor",
    }),
  );
  await assertFails(setDoc(doc(db, "settings", "public"), { vision: "Changed" }));
});
test("super admin can add and revoke editors but cannot delete itself", async () => {
  const db = as("owner");
  await assertSucceeds(
    setDoc(doc(db, "admins", "new"), {
      uid: "new",
      name: "New Editor",
      email: "new@example.test",
      role: "editor",
    }),
  );
  await assertSucceeds(deleteDoc(doc(db, "admins", "new")));
  await assertFails(deleteDoc(doc(db, "admins", "owner")));
});
test("visitor submits valid application but cannot read or alter it", async () => {
  const db = as();
  await assertSucceeds(setDoc(doc(db, "joinRequests", "j"), join()));
  await assertFails(getDoc(doc(db, "joinRequests", "j")));
  await assertFails(updateDoc(doc(db, "joinRequests", "j"), { status: "accepted" }));
});
test("forged status, extra fields and invalid submissions are denied", async () => {
  const db = as();
  await assertFails(setDoc(doc(db, "joinRequests", "a"), { ...join(), status: "accepted" }));
  await assertFails(setDoc(doc(db, "joinRequests", "b"), { ...join(), email: "invalid" }));
  await assertFails(setDoc(doc(db, "joinRequests", "c"), { ...join(), role: "super_admin" }));
  await assertFails(setDoc(doc(db, "joinRequests", "d"), { ...join(), message: "x".repeat(4001) }));
});
test("editor changes application status without overwriting applicant details", async () => {
  await setDoc(doc(as(), "joinRequests", "j"), join());
  const db = as("editor");
  await assertSucceeds(updateDoc(doc(db, "joinRequests", "j"), { status: "accepted" }));
  await assertFails(updateDoc(doc(db, "joinRequests", "j"), { fullName: "Changed Applicant" }));
});
test("contact messages are private and read flag is editor-only", async () => {
  await assertSucceeds(
    setDoc(doc(as(), "contactMessages", "c"), {
      name: "Test Sender",
      email: "sender@example.test",
      message: "A message for the club.",
      submittedAt: serverTimestamp(),
      isRead: false,
    }),
  );
  await assertFails(getDocs(collection(as(), "contactMessages")));
  await assertSucceeds(updateDoc(doc(as("editor"), "contactMessages", "c"), { isRead: true }));
  await assertFails(
    updateDoc(doc(as("editor"), "contactMessages", "c"), { message: "Overwritten message" }),
  );
});
test("revoking an editor removes data access", async () => {
  await deleteDoc(doc(as("owner"), "admins", "editor"));
  await assertFails(setDoc(doc(as("editor"), "projects", "p"), content("editor")));
  await assertFails(getDocs(collection(as("editor"), "joinRequests")));
});
