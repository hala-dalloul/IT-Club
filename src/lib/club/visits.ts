import { supabase } from "./supabase";
let request: Promise<number> | undefined;
let sessionId: string | undefined;
export function recordVisit(): Promise<number> {
  if (request) return request;
  try {
    sessionId = sessionStorage.getItem("club-visit-session") || undefined;
  } catch {
    /* Session storage is optional. */
  }
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) sessionId = crypto.randomUUID();
  try {
    sessionStorage.setItem("club-visit-session", sessionId);
  } catch {
    /* Use in-memory ID. */
  }
  request = (async () => {
    const { data, error } = await supabase().rpc("record_club_visit", { visit_id: sessionId });
    if (error) throw error;
    const count = Number(data);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid visit count");
    return count;
  })().catch((error) => {
    request = undefined;
    throw error;
  });
  return request;
}
