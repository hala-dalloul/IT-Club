import { useEffect, useState, type FormEvent } from "react";
import { BrandButton } from "@/components/club/BrandButton";
import { Input } from "@/components/ui/input";
import { loadAdmins, removeAdmin, saveAdmin, watchQuery } from "@/lib/club/supabase";
import { DeleteButton } from "./DeleteButton";

type AdminRow = { id: string; name: string; email: string; role: string };

type AdminUsersEditorProps = {
  ar: boolean;
  currentUserId: string;
  onLoadError: () => void;
  run: (action: () => Promise<void>) => Promise<void>;
};

export function AdminUsersEditor({ ar, currentUserId, onLoadError, run }: AdminUsersEditorProps) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  useEffect(() => watchQuery(loadAdmins, setAdmins, onLoadError), [onLoadError]);

  function addEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const uid = String(values.get("uid")).trim();

    if (uid === currentUserId || uid.includes("/") || !uid) return;

    void run(async () => {
      await saveAdmin(uid, String(values.get("name")).trim(), String(values.get("email")).trim());
      form.reset();
    });
  }

  return (
    <>
      <p className="mb-5 text-muted-foreground">
        {ar
          ? "أضف حساب المحرر الموجود في Supabase Authentication باستخدام معرّفه UID. إزالة المحرر هنا تلغي صلاحياته على الموقع."
          : "Add an existing Supabase Authentication account by its UID. Removing an editor here revokes their website access."}
      </p>
      <form
        className="mb-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2"
        onSubmit={addEditor}
      >
        {[
          ["uid", "UID"],
          ["name", ar ? "اسم المحرر" : "Editor name"],
          ["email", ar ? "البريد الإلكتروني" : "Email"],
        ].map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-2 block text-sm font-bold">{label}</span>
            <Input name={key} type={key === "email" ? "email" : "text"} required maxLength={254} />
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
            {admin.id !== currentUserId && admin.role === "editor" && (
              <DeleteButton label={admin.name} onDelete={() => run(() => removeAdmin(admin.id))} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
