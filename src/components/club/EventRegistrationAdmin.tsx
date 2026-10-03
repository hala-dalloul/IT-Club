import { useEffect, useState } from "react";
import { BrandButton } from "./BrandButton";
import { Input } from "@/components/ui/input";
import { useClub } from "./ClubProvider";
import type { EventRegistration } from "@/lib/club/model";
import { configureEventSheet, eventSheetStatus, submissionError } from "@/lib/club/sheets";

export function EventRegistrationAdmin({
  eventId,
  title,
  value,
  onChange,
}: {
  eventId: string | undefined;
  title: string;
  value: EventRegistration;
  onChange: (value: EventRegistration) => void;
}) {
  const { lang } = useClub();
  const ar = lang === "ar";
  const [sheetUrl, setSheetUrl] = useState("");
  const [linkedUrl, setLinkedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!eventId) return;
    void eventSheetStatus(eventId)
      .then((sheet) => setLinkedUrl(sheet.url || ""))
      .catch(() => {});
  }, [eventId]);

  const toggle = (key: keyof EventRegistration) => onChange({ ...value, [key]: !value[key] });

  async function connect(create: boolean) {
    if (!eventId || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const sheet = await configureEventSheet(eventId, title, create ? undefined : sheetUrl);
      setLinkedUrl(sheet.url || "");
      setSheetUrl("");
      setNotice(ar ? "تم تجهيز شيت الفعالية." : "The event sheet is ready.");
    } catch (error) {
      setNotice(submissionError(error, ar));
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-border p-5">
      <legend className="px-2 font-bold">
        {ar ? "نموذج تسجيل الفعالية" : "Event registration form"}
      </legend>
      {(["enabled", "nameEnabled", "phoneEnabled", "attendanceEnabled"] as const).map((key) => {
        const labels = {
          enabled: ["إظهار نموذج التسجيل", "Show registration form"],
          nameEnabled: ["حقل الاسم", "Name field"],
          phoneEnabled: ["حقل رقم الهاتف", "Phone field"],
          attendanceEnabled: ["الالتزام بالحضور", "Attendance commitment"],
        } as const;
        return (
          <label key={key} className="flex items-center gap-3">
            <input type="checkbox" checked={value[key]} onChange={() => toggle(key)} />
            {labels[key][ar ? 0 : 1]}
          </label>
        );
      })}
      {!eventId ? (
        <p className="text-sm text-muted-foreground">
          {ar
            ? "احفظ الفعالية أولًا، ثم عدّلها لربط Google Sheet."
            : "Save the event first, then edit it to link a Google Sheet."}
        </p>
      ) : (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm font-bold">
            <span className="mb-2 block">
              {ar ? "رابط Google Sheet موجود" : "Existing Google Sheet URL"}
            </span>
            <Input
              dir="ltr"
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <BrandButton
              type="button"
              variant="outline"
              disabled={busy || !sheetUrl.trim()}
              onClick={() => void connect(false)}
            >
              {ar ? "ربط شيت موجود" : "Link existing sheet"}
            </BrandButton>
            <BrandButton type="button" disabled={busy} onClick={() => void connect(true)}>
              {ar ? "إنشاء شيت تلقائيًا" : "Create sheet automatically"}
            </BrandButton>
            {linkedUrl && (
              <a
                className="self-center font-bold text-primary underline"
                href={linkedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ar ? "فتح الشيت المرتبط" : "Open linked sheet"}
              </a>
            )}
          </div>
          {notice && (
            <p role="status" className="text-sm text-primary">
              {notice}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
