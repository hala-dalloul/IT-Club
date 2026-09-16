import { RegistrationAdmin } from "./RegistrationAdmin";
import { sheetLinks } from "@/lib/club/sheets";
import { MediaLibrary } from "./MediaLibrary";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useClub } from "./ClubProvider";
import {
  configured,
  observeAuth,
  signIn,
  signOut,
  loadRole,
  watchQuery,
  loadAdmins,
  saveAdmin,
  removeAdmin,
  saveContent,
  removeContent,
  uploadImage,
  saveSettings,
} from "@/lib/club/supabase";
import {
  collections,
  labels,
  committees,
  contentSchema,
  safeUrl,
  type Content,
  type ContentCollection,
  type Settings,
} from "@/lib/club/model";
import { BrandButton } from "@/components/game/BrandButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Plus, LogOut, Trash2, Pencil, Upload } from "lucide-react";

type AdminRow = { id: string; name: string; email: string; role: string };

const blank: Omit<Content, "id"> = { title: "", title_en: "", description: "", description_en: "" };

export function AdminPanel() {
  const { lang, setupRequired } = useClub();
  const ar = lang === "ar";
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState("");
  const [checking, setChecking] = useState(configured);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!configured) return;
    let stopRole = () => {};
    let currentUserId: string | null | undefined;

    const stopAuth = observeAuth((current) => {
      if (currentUserId === (current?.id ?? null)) return;
      currentUserId = current?.id ?? null;
      stopRole();
      setUser(current);
      setRole("");

      if (!current) {
        setChecking(false);

        return;
      }

      setChecking(true);
      stopRole = watchQuery(
        () => loadRole(current.id),
        (value) => {
          setRole(value);
          setChecking(false);
        },
        () => {
          setRole("");
          setChecking(false);
        },
        30000,
      );
    });

    return () => {
      stopAuth();
      stopRole();
    };
  }, []);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(e.currentTarget);

    try {
      await signIn(String(values.get("email")), String(values.get("password")));
    } catch {
      setError(
        ar
          ? "تعذر تسجيل الدخول. تحقق من بياناتك وحاول مجددًا."
          : "Sign-in failed. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (setupRequired)
    return (
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="text-2xl font-black">
          {ar ? "تفعيل قاعدة بيانات النادي" : "Set up the club database"}
        </h1>
        <p className="mt-4">
          {ar
            ? "اتصال Supabase جاهز. شغّلي ملف إعداد قاعدة البيانات في SQL Editor، ثم أنشئي حساب المدير وفعّلي صلاحيته."
            : "Supabase is connected. Run the database setup SQL, then create and authorize the administrator account."}
        </p>
      </div>
    );

  if (!configured)
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8">
        <h1 className="text-3xl font-black">{ar ? "لوحة الإدارة" : "Administration"}</h1>
        <p className="mt-4 text-muted-foreground">
          {ar
            ? "لوحة الإدارة غير متاحة حتى إتمام إعداد الخدمة."
            : "Administration is unavailable until service setup is complete."}
        </p>
      </div>
    );

  if (checking) return <p role="status">{ar ? "جارٍ التحقق من الصلاحيات…" : "Checking access…"}</p>;

  if (!user)
    return (
      <form
        onSubmit={login}
        className="mx-auto max-w-md space-y-5 rounded-3xl border border-border bg-card p-8 shadow-card"
      >
        <h1 className="text-3xl font-black">{ar ? "تسجيل دخول الإدارة" : "Admin sign-in"}</h1>
        <label className="block">
          <span className="mb-2 block">{ar ? "البريد الإلكتروني" : "Email"}</span>
          <Input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="block">
          <span className="mb-2 block">{ar ? "كلمة المرور" : "Password"}</span>
          <Input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p role="alert">{error}</p>}
        <BrandButton disabled={busy} type="submit">
          {busy ? (ar ? "جارٍ الدخول…" : "Signing in…") : ar ? "دخول" : "Sign in"}
        </BrandButton>
      </form>
    );

  if (!["editor", "super_admin"].includes(role))
    return (
      <div>
        <p role="alert">
          {ar
            ? "هذا الحساب غير مخوّل بإدارة الموقع."
            : "This account does not have administrative access."}
        </p>
        <BrandButton className="mt-5" onClick={() => void signOut()}>
          {ar ? "تسجيل الخروج" : "Sign out"}
        </BrandButton>
      </div>
    );

  return <AdminWorkspace key={user.id + role} role={role} user={user} />;
}

function DeleteButton({ onDelete, label }: { onDelete: () => Promise<void>; label: string }) {
  const { lang } = useClub();
  const ar = lang === "ar";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <BrandButton variant="ghost" size="sm" aria-label={label}>
          <Trash2 size={16} />
          {ar ? "حذف" : "Delete"}
        </BrandButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ar ? "حذف هذا العنصر؟" : "Delete this item?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {ar
              ? "سيُحذف العنصر من الموقع. لا يمكن التراجع عن هذا الإجراء."
              : "The item will be removed from the website. This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{ar ? "إلغاء" : "Cancel"}</AlertDialogCancel>
          <AlertDialogAction onClick={() => void onDelete()}>
            {ar ? "حذف" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminWorkspace({ role, user }: { role: string; user: User }) {
  const { lang, data, settings } = useClub();
  const ar = lang === "ar";
  const [tab, setTab] = useState("dashboard");
  const [eventDateOrder, setEventDateOrder] = useState(false);
  useEffect(() => {
    try {
      setEventDateOrder(localStorage.getItem("club-admin-event-date-order") === "true");
    } catch {
      /* Storage is optional. */
    }
  }, []);
  const eventItems = [...data.events].sort((a, b) => {
    const created = (item: Content) =>
      Date.parse(item.createdAt || (typeof item.updatedAt === "string" ? item.updatedAt : "")) || 0;
    const eventDate = (item: Content) => Date.parse(item.date || "") || 0;
    return (
      (eventDateOrder ? eventDate(b) - eventDate(a) : 0) ||
      created(b) - created(a) ||
      a.id.localeCompare(b.id)
    );
  });

  // SAFETY: the ternary itself performs the ContentCollection membership check;
  // the cast only satisfies Array<ContentCollection>.includes's parameter type.
  const activeCollection = collections.includes(tab as ContentCollection)
    ? (tab as ContentCollection)
    : null;

  const [editing, setEditing] = useState<Content | null | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const confirmDiscard = () =>
    !dirty ||
    window.confirm(
      ar
        ? "لديك تعديلات غير محفوظة. تجاهل التعديلات والمتابعة؟"
        : "You have unsaved changes. Discard them and continue?",
    );
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const fail = () =>
      setNotice(
        ar
          ? "تعذر تحميل بيانات الإدارة. تحقق من إعداد Supabase."
          : "Could not load admin data. Check Supabase setup.",
      );

    const stops: (() => void)[] = [];

    if (role === "super_admin") stops.push(watchQuery(loadAdmins, setAdmins, fail));

    return () => stops.forEach((stop) => stop());
  }, [role, ar]);

  async function run(action: () => Promise<void>) {
    setNotice("");

    try {
      await action();
      setNotice(ar ? "تم الحفظ بنجاح." : "Saved successfully.");
    } catch {
      setNotice(
        ar
          ? "لم يتم الحفظ. تحقق من الاتصال والصلاحيات وحاول مجددًا."
          : "Changes were not saved. Check your connection and access, then try again.",
      );
    }
  }

  const tabs = [
    ["dashboard", ar ? "نظرة عامة" : "Overview"],
    ["media", ar ? "مكتبة الصور" : "Media library"],
    ...collections.map((x) => [x, labels[x][ar ? 0 : 1]]),
    ["joinRequests", ar ? "طلبات الانضمام" : "Applications"],
    ["contactMessages", ar ? "الرسائل" : "Messages"],
    ...(role === "super_admin"
      ? [
          ["settings", ar ? "إعدادات الموقع" : "Site settings"],
          ["admins", ar ? "المحررون" : "Editors"],
        ]
      : []),
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            {ar ? "لوحة إدارة النادي" : "Club administration"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.email} ·{" "}
            {role === "super_admin" ? (ar ? "مدير عام" : "Super admin") : ar ? "محرر" : "Editor"}
          </p>
        </div>
        <BrandButton variant="outline" onClick={() => void signOut()}>
          <LogOut size={18} />
          {ar ? "خروج" : "Sign out"}
        </BrandButton>
      </div>
      <nav
        aria-label={ar ? "أقسام الإدارة" : "Administration sections"}
        className="mb-8 flex flex-wrap gap-2"
      >
        {tabs.map(([key, label]) => (
          <BrandButton
            key={key}
            size="sm"
            variant={tab === key ? "primary" : "outline"}
            aria-pressed={tab === key}
            onClick={() => {
              if (!confirmDiscard()) return;
              setTab(key!);
              setEditing(undefined);
              setDirty(false);
              setNotice("");
            }}
          >
            {label}
          </BrandButton>
        ))}
      </nav>
      {activeCollection === "events" && (
        <section
          aria-label={ar ? "ترتيب الأخبار والفعاليات" : "News and events ordering"}
          className="mb-6 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="mb-3 font-bold">
            {ar
              ? "ترتيب الأخبار والفعاليات في لوحة الإدارة"
              : "News and events ordering in the admin panel"}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <BrandButton
              variant={eventDateOrder ? "primary" : "outline"}
              type="button"
              role="switch"
              aria-checked={eventDateOrder}
              onClick={() => {
                const enabled = !eventDateOrder;
                setEventDateOrder(enabled);
                try {
                  localStorage.setItem("club-admin-event-date-order", String(enabled));
                } catch {
                  /* Storage is optional. */
                }
              }}
            >
              {ar ? "الترتيب حسب موعد الفعالية" : "Sort by event date"}
              <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
                {eventDateOrder ? (ar ? "مفعّل" : "On") : ar ? "متوقف" : "Off"}
              </span>
            </BrandButton>
            {data.events.some((item) => !item.createdAt) && (
              <p role="status" className="text-sm text-muted-foreground">
                {ar
                  ? "يلزم تحديث قاعدة البيانات لحفظ تاريخ الإضافة؛ يُستخدم آخر تعديل مؤقتًا."
                  : "Apply the database migration to track creation dates; using last update temporarily."}
              </p>
            )}
            <span className="text-sm text-muted-foreground">
              {eventDateOrder
                ? ar
                  ? "موعد الفعالية: الأحدث أولًا"
                  : "Event date: newest first"
                : ar
                  ? "تاريخ الإضافة: الأحدث أولًا"
                  : "Date added: newest first"}
            </span>
          </div>
        </section>
      )}

      {notice && (
        <p role="status" className="mb-6 rounded-2xl bg-brand-gradient-soft p-4">
          {notice}
        </p>
      )}
      {tab === "media" && <MediaLibrary />}
      {tab === "dashboard" && (
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            [data.members.length, ar ? "أعضاء الفريق" : "Team members"],
            [data.events.length, ar ? "الفعاليات" : "Events"],
          ].map(([count, label]) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-8 shadow-card">
              <strong className="block text-4xl font-black text-primary">{count}</strong>
              <span className="mt-3 block">{label}</span>
            </div>
          ))}
        </div>
      )}
      {activeCollection &&
        (editing !== undefined ? (
          <ContentEditor
            key={tab + (editing?.id || "new")}
            kind={activeCollection}
            item={editing}
            onDirtyChange={setDirty}
            onCancel={() => {
              setEditing(undefined);
              setDirty(false);
            }}
            onSaved={() => {
              setEditing(undefined);
              setDirty(false);
              setNotice(ar ? "تم نشر المحتوى." : "Content published.");
            }}
          />
        ) : (
          <>
            <BrandButton
              className="mb-6"
              onClick={() => {
                if (!confirmDiscard()) return;
                setEditing(null);
                setDirty(false);
              }}
            >
              <Plus size={18} />
              {ar ? "إضافة جديد" : "Add new"}
            </BrandButton>
            <div className="space-y-3">
              {data[activeCollection].length === 0 && (
                <p>{ar ? "لا توجد عناصر بعد." : "No items yet."}</p>
              )}
              {(activeCollection === "events" ? eventItems : data[activeCollection]).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <div>
                    <h2 className="font-extrabold">{ar ? item.title : item.title_en}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ar ? "آخر تعديل بواسطة" : "Last edited by"}: {item.updatedBy || "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <BrandButton variant="outline" size="sm" onClick={() => setEditing(item)}>
                      <Pencil size={16} />
                      {ar ? "تعديل" : "Edit"}
                    </BrandButton>
                    <DeleteButton
                      label={item.title}
                      onDelete={() => run(() => removeContent(activeCollection, item.id))}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        ))}
      {tab === "joinRequests" && <RegistrationAdmin canEdit={role === "super_admin"} />}
      {tab === "contactMessages" && (
        <section className="rounded-3xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-bold">{ar ? "رسائل التواصل" : "Contact messages"}</h2>
          <p>
            {ar
              ? "الرسائل الجديدة تُحفظ في Google Sheets فقط."
              : "New messages are stored only in Google Sheets."}
          </p>
          <a
            href={sheetLinks.contact}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary underline"
          >
            {ar ? "فتح شيت رسائل التواصل" : "Open contact spreadsheet"}
          </a>
        </section>
      )}
      {tab === "settings" && role === "super_admin" && (
        <SettingsEditor
          key={tab}
          initial={settings}
          onDirtyChange={setDirty}
          onSave={(value) => run(() => saveSettings(value))}
        />
      )}
      {tab === "admins" && role === "super_admin" && (
        <>
          <p className="mb-5 text-muted-foreground">
            {ar
              ? "أضف حساب المحرر الموجود في Supabase Authentication باستخدام معرّفه UID. إزالة المحرر هنا تلغي صلاحياته على الموقع."
              : "Add an existing Supabase Authentication account by its UID. Removing an editor here revokes their website access."}
          </p>
          <form
            className="mb-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const values = new FormData(f);
              const uid = String(values.get("uid")).trim();

              if (uid === user.id || uid.includes("/") || !uid) return;
              void run(async () => {
                await saveAdmin(
                  uid,
                  String(values.get("name")).trim(),
                  String(values.get("email")).trim(),
                );
                f.reset();
              });
            }}
          >
            {[
              ["uid", "UID"],
              ["name", ar ? "اسم المحرر" : "Editor name"],
              ["email", ar ? "البريد الإلكتروني" : "Email"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-bold">{label}</span>
                <Input
                  name={key!}
                  type={key === "email" ? "email" : "text"}
                  required
                  maxLength={254}
                />
              </label>
            ))}
            <BrandButton type="submit">{ar ? "إضافة محرر" : "Add editor"}</BrandButton>
          </form>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <span>
                  {admin.name} · {admin.email} · {admin.role}
                </span>
                {admin.id !== user.id && admin.role === "editor" && (
                  <DeleteButton
                    label={admin.name}
                    onDelete={() => run(() => removeAdmin(admin.id))}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ContentEditor({
  kind,
  item,
  onCancel,
  onSaved,
  onDirtyChange,
}: {
  kind: ContentCollection;
  item: Content | null;
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { lang } = useClub();
  const ar = lang === "ar";
  const [dirty, setDirty] = useState(false);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const [images, setImages] = useState(item?.images || []);

  const [committee, setCommittee] = useState(
    item?.isFounder || item?.committee === "administrative"
      ? "administrative"
      : item?.committee && committees.some(([key]) => key === item.committee)
        ? item.committee
        : committees[0][0],
  );

  const [status, setStatus] = useState(item?.status || "upcoming");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    if (!file) {
      setPreview("");

      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || file) return;
    // SAFETY: this form has no file inputs, so every FormData entry value is a string.
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = contentSchema.safeParse(values);

    if (!parsed.success) {
      setError(
        ar ? "أدخل العنوان والوصف باللغتين." : "Enter the title and description in both languages.",
      );

      return;
    }

    const value: Omit<Content, "id"> = {
      ...blank,
      title: values["title"]!.trim(),
      title_en: values["title_en"]!.trim(),
      description: values["description"]!.trim(),
      description_en: values["description_en"]!.trim(),
      images,
    };

    if (kind === "members") {
      value.role = values["role"] || "";
      value.role_en = values["role_en"] || "";
      value.committee = committee;
      value.isFounder = committee === "administrative";
    }

    if (kind === "events") value.date = values["date"] || "";

    if (kind === "events") value.status = status;

    if (kind === "partners") {
      value.partnershipType = values["partnershipType"] || "";
      value.partnershipType_en = values["partnershipType_en"] || "";
    }

    for (const key of ["websiteUrl", "githubUrl", "linkedinUrl"] as const) {
      const url = values[key]?.trim();

      if (url) {
        if (!safeUrl(url)) {
          setError(ar ? "استخدم روابط HTTPS صحيحة." : "Use valid HTTPS links.");

          return;
        }

        value[key] = url;
      }
    }

    setBusy(true);
    setError("");

    try {
      await saveContent(kind, value, item?.id);
      onSaved();
    } catch (error) {
      const rejectedBoard =
        kind === "members" &&
        committee === "administrative" &&
        error instanceof Error &&
        error.message.includes("club_content_data_check");
      setError(
        rejectedBoard
          ? ar
            ? "قاعدة البيانات ترفض بيانات الهيئة الإدارية. تأكد من تشغيل تحديث اللجنة الإدارية في Supabase."
            : "The database rejected the board member data. Check that the administrative committee migration has been applied in Supabase."
          : ar
            ? "تعذر حفظ المحتوى. تحقق من الصلاحيات والاتصال."
            : "Content could not be saved. Check permissions and connection.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");

    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
      setDirty(true);
      setFile(null);
    } catch {
      setError(
        ar
          ? "تعذر رفع الصورة. استخدم JPG أو PNG أو WebP حتى 5 ميغابايت وتحقق من إعداد التخزين."
          : "Upload failed. Use JPG, PNG or WebP up to 5 MB and check storage setup.",
      );
    } finally {
      setBusy(false);
    }
  }

  const extraFields: [keyof Content, string, string, string][] =
    kind === "members"
      ? [
          ["role", "الدور بالعربية", "Role in Arabic", "text"],
          ["role_en", "الدور بالإنجليزية", "Role in English", "text"],
          ["githubUrl", "رابط GitHub", "GitHub URL", "url"],
          ["linkedinUrl", "رابط LinkedIn", "LinkedIn URL", "url"],
        ]
      : kind === "partners"
        ? [
            ["partnershipType", "نوع الشراكة بالعربية", "Partnership type in Arabic", "text"],
            [
              "partnershipType_en",
              "نوع الشراكة بالإنجليزية",
              "Partnership type in English",
              "text",
            ],
            ["websiteUrl", "موقع الشريك", "Partner website", "url"],
          ]
        : [["date", "التاريخ", "Date", "date"]];

  return (
    <form
      onSubmit={save}
      onChange={() => setDirty(true)}
      className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <h2 className="text-2xl font-black">
        {item ? (ar ? "تعديل المحتوى" : "Edit content") : ar ? "إضافة محتوى" : "Add content"}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["title", "العنوان بالعربية", "Title in Arabic"],
            ["title_en", "العنوان بالإنجليزية", "Title in English"],
            ["description", "الوصف بالعربية", "Description in Arabic"],
            ["description_en", "الوصف بالإنجليزية", "Description in English"],
          ] as const
        ).map(([key, a, en]) => (
          <label key={key} className="block text-sm font-bold">
            <span className="mb-2 block">{ar ? a : en}</span>
            {key.startsWith("description") ? (
              <Textarea
                name={key}
                required
                minLength={2}
                maxLength={20000}
                defaultValue={item?.[key] || ""}
                dir={key.endsWith("_en") ? "ltr" : "rtl"}
                rows={6}
              />
            ) : (
              <Input
                name={key}
                required
                minLength={2}
                maxLength={200}
                defaultValue={item?.[key] || ""}
                dir={key.endsWith("_en") ? "ltr" : "rtl"}
              />
            )}
          </label>
        ))}
        {extraFields.map(([key, a, en, type]) => (
          <label key={key} className="block text-sm font-bold">
            <span className="mb-2 block">{ar ? a : en}</span>
            <Input
              name={key}
              type={type}
              required={type === "date" || type === "number"}
              min={type === "number" ? 2000 : undefined}
              max={type === "number" ? 2100 : undefined}
              defaultValue={String(item?.[key] || (key === "year" ? new Date().getFullYear() : ""))}
            />
          </label>
        ))}
      </div>
      {kind === "members" && (
        <>
          <label className="block">
            <span className="mb-2 block">{ar ? "اللجنة" : "Committee"}</span>
            <Select
              dir={ar ? "rtl" : "ltr"}
              value={committee}
              onValueChange={(v) => {
                setCommittee(v);
                setDirty(true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrative">
                  {ar ? "الهيئة الإدارية" : "Administrative board"}
                </SelectItem>
                {committees.map(([key, a, en]) => (
                  <SelectItem key={key} value={key}>
                    {ar ? a : en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </>
      )}
      {kind === "events" && (
        <label className="block">
          <span className="mb-2 block">{ar ? "الحالة" : "Status"}</span>
          <Select
            dir={ar ? "rtl" : "ltr"}
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setDirty(true);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">{ar ? "قادمة" : "Upcoming"}</SelectItem>
              <SelectItem value="past">{ar ? "سابقة" : "Past"}</SelectItem>
            </SelectContent>
          </Select>
        </label>
      )}
      <details
        className="rounded-2xl border border-border p-5"
        onToggle={(e) => setMediaPickerOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer font-bold">
          {ar ? "اختيار من مكتبة الصور" : "Choose from media library"}
        </summary>
        {mediaPickerOpen && (
          <MediaLibrary
            onSelect={(url) => {
              setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
              setDirty(true);
            }}
          />
        )}
      </details>
      <fieldset className="rounded-2xl border border-border p-5">
        <legend className="px-2 font-bold">{ar ? "الصور" : "Images"}</legend>
        <p className="mb-4 text-sm text-muted-foreground">
          {ar
            ? "اختاري الصور من المكتبة أو ارفعي صورة، ثم اضغطي حفظ ونشر لإظهارها في الموقع. أول صورة هي صورة الغلاف."
            : "Choose images from the library or upload one, then Save and publish. The first image is the cover."}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((url) => (
            <div key={url}>
              <img
                src={url}
                alt={ar ? "صورة المحتوى" : "Content image"}
                className="h-28 w-full rounded-xl object-contain"
              />
              <BrandButton
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setImages((prev) => prev.filter((x) => x !== url));
                  setDirty(true);
                }}
              >
                {ar ? "إزالة" : "Remove"}
              </BrandButton>
            </div>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm">
            {ar ? "JPG / PNG / WebP، حتى 5 ميغابايت" : "JPG / PNG / WebP, up to 5 MB"}
          </span>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt={ar ? "معاينة قبل الرفع" : "Preview before upload"}
              className="max-h-48 rounded-xl object-contain"
            />
            <div className="mt-3 flex gap-3">
              <BrandButton type="button" disabled={busy} onClick={() => void upload()}>
                <Upload size={16} />
                {ar ? "رفع الصورة" : "Upload image"}
              </BrandButton>
              <BrandButton type="button" variant="ghost" onClick={() => setFile(null)}>
                {ar ? "إلغاء الصورة" : "Discard image"}
              </BrandButton>
            </div>
          </div>
        )}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <BrandButton type="submit" disabled={busy || !!file}>
          {busy ? (ar ? "جارٍ الحفظ…" : "Saving…") : ar ? "حفظ ونشر" : "Save and publish"}
        </BrandButton>
        <BrandButton type="button" variant="outline" disabled={busy} onClick={onCancel}>
          {ar ? "إلغاء" : "Cancel"}
        </BrandButton>
      </div>
    </form>
  );
}

function SettingsEditor({
  initial,
  onSave,
  onDirtyChange,
}: {
  initial: Settings;
  onSave: (value: Settings) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { lang } = useClub();
  const ar = lang === "ar";
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const fields: Record<keyof Settings, [string, string]> = {
    vision: ["الرؤية بالعربية", "Vision in Arabic"],
    vision_en: ["الرؤية بالإنجليزية", "Vision in English"],
    mission: ["الرسالة بالعربية", "Mission in Arabic"],
    mission_en: ["الرسالة بالإنجليزية", "Mission in English"],
    goals: ["الأهداف بالعربية (كل هدف بسطر)", "Goals in Arabic (one per line)"],
    goals_en: ["الأهداف بالإنجليزية (كل هدف بسطر)", "Goals in English (one per line)"],
    email: ["بريد التواصل", "Contact email"],
    facebook: ["Facebook", "Facebook"],
    instagram: ["Instagram", "Instagram"],
    linkedin: ["LinkedIn", "LinkedIn"],
    github: ["GitHub", "GitHub"],
  };

  // SAFETY: key ranges over Object.entries(fields), and fields is a Record<keyof Settings, ...>,
  // so key is always a Settings key.
  return (
    <form
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2"
      onChange={() => setDirty(true)}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        // SAFETY: every field below is named after a Settings key, so the form's
        // FormData entries exactly match Settings' shape.
        const values = Object.fromEntries(new FormData(e.currentTarget)) as Settings;

        try {
          await onSave(values);
          setDirty(false);
        } finally {
          setBusy(false);
        }
      }}
    >
      {Object.entries(fields).map(([key, pair]) => (
        <label key={key} className="block">
          <span className="mb-2 block text-sm font-bold">{pair[ar ? 0 : 1]}</span>
          {["vision", "mission", "goals"].some((prefix) => key.startsWith(prefix)) ? (
            <Textarea
              name={key}
              defaultValue={initial[key as keyof Settings]}
              maxLength={10000}
              rows={5}
              dir={key.endsWith("_en") ? "ltr" : "rtl"}
            />
          ) : (
            <Input
              name={key}
              type={key === "email" ? "email" : "url"}
              pattern={key === "email" ? undefined : "https://.*"}
              defaultValue={initial[key as keyof Settings]}
            />
          )}
        </label>
      ))}
      <BrandButton type="submit" disabled={busy}>
        {ar ? "حفظ الإعدادات" : "Save settings"}
      </BrandButton>
    </form>
  );
}
