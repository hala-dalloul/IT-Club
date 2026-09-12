import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { prepareImage } from "./images";
import { contentSchema, type Content, type ContentCollection, type Settings } from "./model";
// Public browser configuration; RLS still controls all data access.
const url = import.meta.env.VITE_SUPABASE_URL || "https://jxweaxenswbjpxxjmihb.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_kHJik-SCyMiMQ7nn2SRHbQ_0FR6CpOZ";
export const configured = Boolean(url && key);
let client: SupabaseClient | undefined;
export function supabase() {
  if (!configured) throw new Error("Supabase is not configured");
  client ??= createClient(url, key, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: false,
    },
  });
  return client;
}
export class SetupRequiredError extends Error {
  constructor() {
    super("Supabase database setup is required. Run the supplied migration.");
  }
}
function check(error: { message: string; code?: string | undefined } | null) {
  if (!error) return;
  if (["PGRST205", "42P01", "PGRST202"].includes(error.code || "")) throw new SetupRequiredError();
  throw new Error(error.message);
}
export const changed = () => window.dispatchEvent(new Event("club-data-changed"));
type Row = Record<string, unknown>;
async function rows(table: string, order = "id", tie = "id") {
  const result: Row[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase()
      .from(table)
      .select("*")
      .order(order, { ascending: false })
      .order(tie)
      .range(offset, offset + 499);
    check(error);
    result.push(...(data || []));
    if (!data || data.length < 500) break;
  }
  return result;
}
/** Poll only visible tabs; mutations refresh immediately without Realtime setup. */
export function watchQuery<T>(
  load: () => Promise<T>,
  next: (value: T) => void,
  fail: (error: Error) => void,
  interval = 60000,
) {
  let active = true,
    running = false,
    again = false;
  async function refresh() {
    if (!active) return;
    if (running) {
      again = true;
      return;
    }
    running = true;
    try {
      const value = await load();
      if (active) next(value);
    } catch (error) {
      if (active) fail(error instanceof Error ? error : new Error("Request failed"));
    } finally {
      running = false;
      if (again) {
        again = false;
        void refresh();
      }
    }
  }
  const visible = () => {
    if (document.visibilityState === "visible") void refresh();
  };
  const changedHandler = () => void refresh();
  void refresh();
  const timer = window.setInterval(visible, interval);
  window.addEventListener("club-data-changed", changedHandler);
  document.addEventListener("visibilitychange", visible);
  return () => {
    active = false;
    window.clearInterval(timer);
    window.removeEventListener("club-data-changed", changedHandler);
    document.removeEventListener("visibilitychange", visible);
  };
}
export async function loadPublic() {
  const [content, settings] = await Promise.all([
    rows("club_content", "updated_at"),
    supabase().from("club_settings").select("data").eq("id", "public").maybeSingle(),
  ]);
  check(settings.error);
  const data: Record<ContentCollection, Content[]> = {
    members: [],
    events: [],
    achievements: [],
    partners: [],
  };
  for (const row of content) {
    const kind = row["kind"] as ContentCollection;
    if (!Object.hasOwn(data, kind)) continue;
    data[kind].push({
      ...(row["data"] as Omit<Content, "id">),
      id: String(row["id"]),
      updatedAt: row["updated_at"],
      updatedBy: String(row["updated_by"] || ""),
    });
  }
  return { data, settings: settings.data?.data as Settings | undefined };
}
export async function saveContent(
  kind: ContentCollection,
  value: Omit<Content, "id">,
  id?: string,
) {
  contentSchema.parse(value);
  const result = id
    ? await supabase()
        .from("club_content")
        .update({ data: value })
        .eq("id", id)
        .eq("kind", kind)
        .select("id")
        .single()
    : await supabase().from("club_content").insert({ kind, data: value }).select("id").single();
  check(result.error);
  changed();
}
export async function removeContent(kind: ContentCollection, id: string) {
  const { error } = await supabase()
    .from("club_content")
    .delete()
    .eq("kind", kind)
    .eq("id", id)
    .select("id")
    .single();
  check(error);
  changed();
}
export async function saveSettings(data: Settings) {
  const { error } = await supabase().from("club_settings").upsert({ id: "public", data });
  check(error);
  changed();
}
export function observeAuth(next: (user: User | null) => void) {
  let active = true;
  const { data } = supabase().auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => {
      if (active) next(session?.user || null);
    });
  });
  return () => {
    active = false;
    data.subscription.unsubscribe();
  };
}
export async function signIn(email: string, password: string) {
  const { error } = await supabase().auth.signInWithPassword({ email, password });
  check(error);
}
export async function signOut() {
  const { error } = await supabase().auth.signOut();
  check(error);
  changed();
}
export async function loadRole(id: string) {
  const { data, error } = await supabase()
    .from("club_admins")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  check(error);
  return String(data?.role || "");
}
export type InboxRow = {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  studentId?: string;
  major?: string;
  preferredCommittee?: string;
  message: string;
  status?: string;
  isRead?: boolean;
  submittedAt?: string;
};
export type AdminRow = { id: string; name: string; email: string; role: string };
export async function loadInbox() {
  return (await rows("club_submissions", "submitted_at")).map((row) => ({
    ...(row["data"] as Record<string, string>),
    id: String(row["id"]),
    kind: String(row["kind"]),
    status: String(row["status"]),
    isRead: Boolean(row["is_read"]),
    submittedAt: String(row["submitted_at"]),
  })) as (InboxRow & { kind: string })[];
}
export async function updateSubmission(id: string, patch: { status?: string; isRead?: boolean }) {
  const { error } = await supabase()
    .from("club_submissions")
    .update(patch.status ? { status: patch.status } : { is_read: patch.isRead })
    .eq("id", id)
    .select("id")
    .single();
  check(error);
  changed();
}
export async function loadAdmins() {
  return (await rows("club_admins")) as unknown as AdminRow[];
}
export async function saveAdmin(id: string, name: string, email: string) {
  const { error } = await supabase()
    .from("club_admins")
    .upsert({ id, name, email, role: "editor" });
  check(error);
  changed();
}
export async function removeAdmin(id: string) {
  const { error } = await supabase()
    .from("club_admins")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  check(error);
  changed();
}
export type MediaAsset = {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  mime: string;
  deleting: boolean;
  usedBy: string[];
};
export async function loadMedia(): Promise<MediaAsset[]> {
  const [assets, links] = await Promise.all([
    rows("club_media", "created_at"),
    rows("club_content_media", "content_id", "media_id"),
  ]);

  return assets.map((a) => ({
    id: String(a["id"]),
    name: String(a["name"]),
    path: String(a["path"]),
    url: supabase().storage.from("club-media").getPublicUrl(String(a["path"])).data.publicUrl,
    size: Number(a["size"]),
    mime: String(a["mime"]),
    deleting: Boolean(a["deleting"]),
    usedBy: links.filter((l) => l["media_id"] === a["id"]).map((l) => String(l["content_id"])),
  }));
}
export async function uploadImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5242880)
    throw new Error("Use JPG, PNG or WebP up to 5 MB");
  const { data, error } = await supabase().auth.getUser();
  check(error);
  if (!data.user) throw new Error("Sign in required");
  const image = await prepareImage(file);
  const ext = image.type === "image/jpeg" ? "jpg" : image.type === "image/png" ? "png" : "webp";
  const path = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
  const bucket = supabase().storage.from("club-media");
  const upload = await bucket.upload(path, image, {
    upsert: false,
    contentType: image.type,
    cacheControl: "31536000",
  });
  check(upload.error);
  const record = await supabase()
    .from("club_media")
    .insert({
      name: file.name.slice(0, 200),
      path,
      size: image.size,
      mime: image.type,
      created_by: data.user.id,
    });
  if (record.error) {
    await bucket.remove([path]);
    check(record.error);
  }
  changed();
  return bucket.getPublicUrl(path).data.publicUrl;
}
export async function renameMedia(id: string, name: string) {
  if (!name.trim() || name.trim().length > 200) throw new Error("Invalid name");
  const { error } = await supabase()
    .from("club_media")
    .update({ name: name.trim() })
    .eq("id", id)
    .select("id")
    .single();
  check(error);
  changed();
}
export async function deleteMedia(id: string) {
  const prepared = await supabase().rpc("club_prepare_media_delete", { asset_id: id });
  check(prepared.error);
  const removed = await supabase()
    .storage.from("club-media")
    .remove([String(prepared.data)]);
  check(removed.error);
  const done = await supabase().from("club_media").delete().eq("id", id).select("id").single();
  check(done.error);
  changed();
}
