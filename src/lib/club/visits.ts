import { recordClubVisit } from "./public-api";

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

  request = recordClubVisit(sessionId).catch((error) => {
    request = undefined;
    throw error;
  });

  return request;
}
