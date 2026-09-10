import { useEffect, useState } from "react";
import { useClub } from "./ClubProvider";
import { BrandButton } from "@/components/game/BrandButton";
import { Input } from "@/components/ui/input";
import {
  configureRegistration,
  loadRegistration,
  sheetLinks,
  submissionError,
  type Registration,
} from "@/lib/club/sheets";
export function RegistrationAdmin({ canEdit }: { canEdit: boolean }) {
  const { lang } = useClub();
  const ar = lang === "ar";
  const [status, setStatus] = useState<Registration>();
  const [limit, setLimit] = useState("40");
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () =>
      loadRegistration()
        .then((value) => {
          if (active) {
            setStatus(value);
            setUnavailable(false);
          }
        })
        .catch(() => {
          if (active) setUnavailable(true);
        });
    void loadRegistration()
      .then((value) => {
        if (active) {
          setStatus(value);
          setLimit(String(value.limit));
          setEnabled(value.enabled);
        }
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <h2 className="text-2xl font-black">
        {ar ? "استقبال الأعضاء الجدد" : "Membership registration"}
      </h2>
      {unavailable && (
        <p role="alert">
          {ar
            ? "تعذر الوصول إلى سكربت الانضمام. تحققي من إعداد النشر: Anyone، ومن إعداد FORM_KIND والمفتاح العام."
            : "Cannot reach the registration script. Check public deployment access and script properties."}
        </p>
      )}
      {!status && !unavailable && (
        <p role="status">{ar ? "جارٍ تحميل العداد…" : "Loading registration count…"}</p>
      )}
      {status && (
        <>
          <p className="text-xl font-bold text-primary">
            {ar
              ? `المسجلون: ${status.count} / ${status.limit} — المتبقي: ${status.remaining}`
              : `Registered: ${status.count} / ${status.limit} — Remaining: ${status.remaining}`}
          </p>
          <p>
            {status.open
              ? ar
                ? "التسجيل مفتوح"
                : "Registration is open"
              : ar
                ? "تم وقف استقبال الأعضاء الجدد"
                : "Registration is closed"}
          </p>
          {canEdit && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy) return;
                setBusy(true);
                setNotice("");
                try {
                  const value = await configureRegistration(enabled, Number(limit));
                  setStatus(value);
                  setUnavailable(false);
                  setNotice(ar ? "تم حفظ إعدادات التسجيل." : "Registration settings saved.");
                } catch (error) {
                  setNotice(submissionError(error, ar));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="block font-bold">
                {ar ? "الحد الإجمالي للتسجيل" : "Total registration limit"}
                <Input
                  className="mt-2 max-w-xs"
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  required
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                {ar
                  ? "فتح استقبال الطلبات حتى بلوغ الحد"
                  : "Accept applications until the limit is reached"}
              </label>
              <p className="text-sm text-muted-foreground">
                {ar
                  ? "العدد هو الطلبات المحفوظة في الشيت. إعادة الفتح لا تصفّر العداد؛ زيدي الحد لاستقبال المزيد."
                  : "The count comes from saved sheet rows. Reopening does not reset it; increase the limit to accept more."}
              </p>
              <BrandButton type="submit" disabled={busy || unavailable}>
                {busy
                  ? ar
                    ? "جارٍ الحفظ…"
                    : "Saving…"
                  : ar
                    ? "حفظ التحكم بالتسجيل"
                    : "Save registration settings"}
              </BrandButton>
            </form>
          )}
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      <a
        className="inline-block font-bold text-primary underline"
        href={sheetLinks.join}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ar ? "فتح طلبات الانضمام في Google Sheets" : "Open applications in Google Sheets"}
      </a>
    </section>
  );
}
