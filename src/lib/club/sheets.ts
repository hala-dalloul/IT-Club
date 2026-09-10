import { z } from "zod";
import { contactSchema, joinSchema } from "./model";

export const sheetLinks = {
  contact:
    "https://docs.google.com/spreadsheets/d/1-k2MvrFu2lvOq0ypMJCo-Zs_Q2lw3MD7_sTNAXUi6rc/edit",
  join: "https://docs.google.com/spreadsheets/d/1v6RYlzZujoRSAHvOwsY_FQ7X5s3UOHW8E9b3SGxzcWg/edit",
};
const endpoints = {
  contact:
    "https://script.google.com/a/macros/ucas.edu.ps/s/AKfycbxbRhHH3dTxdsvpAD0TSGFae6mtBmLwf3zUApDqe6VGiNvZrE-M4Ni164_0LDu-e1MTow/exec",
  join: "https://script.google.com/a/macros/ucas.edu.ps/s/AKfycbxvckZM9moWs-jyGrPPQQj8UXcDlpgWRFQn1-YPTBY13nCCBjn_erpmuxqd4WLFSFnt/exec",
};
const registrationSchema = z.object({
  open: z.boolean(),
  enabled: z.boolean(),
  limit: z.number().int().positive(),
  count: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});
export type Registration = z.infer<typeof registrationSchema>;
export class SheetsError extends Error {}
async function request(kind: keyof typeof endpoints, body?: object) {
  let result: Response;
  try {
    result = await fetch(endpoints[kind], {
      method: body ? "POST" : "GET",
      credentials: "omit",
      redirect: "follow",
      ...(body
        ? { headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }
        : {}),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    throw new SheetsError("UNAVAILABLE");
  }
  if (!result.ok || !result.headers.get("content-type")?.includes("application/json"))
    throw new SheetsError("UNAVAILABLE");
  let value;
  try {
    value = await result.json();
  } catch {
    throw new SheetsError("UNAVAILABLE");
  }
  if (value?.ok !== true)
    throw new SheetsError(typeof value?.code === "string" ? value.code : "UNAVAILABLE");
  return value;
}
export async function loadRegistration(): Promise<Registration> {
  const value = await request("join");
  const parsed = registrationSchema.safeParse(value.registration);
  if (!parsed.success) throw new SheetsError("UNAVAILABLE");
  return parsed.data;
}
export async function configureRegistration(enabled: boolean, limit: number) {
  // Only the current Supabase session authenticates the admin. Form data never goes there.
  const { supabase } = await import("./supabase");
  const { data, error } = await supabase().auth.getSession();
  if (error || !data.session) throw new SheetsError("UNAUTHORIZED");
  const value = await request("join", {
    action: "configure",
    accessToken: data.session.access_token,
    enabled,
    limit,
  });
  return registrationSchema.parse(value.registration);
}
export async function submitToSheet(
  join: boolean,
  values: Record<string, string>,
  requestId: string,
) {
  const data = (join ? joinSchema : contactSchema).parse(values);
  await request(join ? "join" : "contact", { action: join ? "join" : "contact", requestId, data });
}
export function submissionError(error: unknown, ar: boolean) {
  const code = error instanceof Error ? error.message : "";
  if (code === "JOIN_CLOSED")
    return ar ? "تم وقف استقبال الأعضاء الجدد" : "New membership applications are closed.";
  if (code === "ALREADY_REGISTERED")
    return ar
      ? "تم تسجيل طلب سابق بهذا الرقم الجامعي."
      : "An application with this student ID already exists.";
  if (code === "UNAUTHORIZED")
    return ar
      ? "تعذر التحقق من صلاحية المدير. سجّلي الدخول مجددًا."
      : "Admin authorization failed. Please sign in again.";
  if (code === "NOT_CONFIGURED")
    return ar
      ? "إعداد ربط Google Sheets غير مكتمل."
      : "Google Sheets integration setup is incomplete.";
  return ar
    ? "تعذر تأكيد العملية. تحققي من الاتصال وحاولي مجددًا؛ إعادة الإرسال لن تكرر الطلب نفسه."
    : "The operation could not be confirmed. Check your connection and retry; the same request will not be duplicated.";
}
