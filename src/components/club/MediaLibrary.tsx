import { useEffect, useState } from "react";
import { useClub } from "./ClubProvider";
import {
  watchQuery,
  loadMedia,
  uploadImage,
  renameMedia,
  deleteMedia,
  type MediaAsset,
} from "@/lib/club/supabase";
import { BrandButton } from "@/components/game/BrandButton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const { lang, data } = useClub();
  const ar = lang === "ar";
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(
    () =>
      watchQuery(
        loadMedia,
        (value) => {
          setAssets(value);
          setLoading(false);
          setError("");
        },
        () => {
          setLoading(false);
          setError(
            ar
              ? "تعذر تحميل مكتبة الصور. تحقق من تفعيل قاعدة البيانات والتخزين."
              : "Could not load media. Check database and storage setup.",
          );
        },
      ),
    [ar],
  );
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const value = URL.createObjectURL(file);
    setPreview(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  async function upload() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    try {
      await uploadImage(file);
      setFile(null);
    } catch {
      setError(
        ar
          ? "تعذر رفع الصورة. استخدم JPG أو PNG أو WebP حتى 5 ميغابايت."
          : "Upload failed. Use JPG, PNG or WebP up to 5 MB.",
      );
    } finally {
      setBusy(false);
    }
  }
  const allContent = Object.values(data).flat();
  return (
    <section className="mt-6 space-y-6">
      <div>
        <h2 className="text-2xl font-black">{ar ? "مكتبة الصور" : "Media library"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {assets.length} {ar ? "صورة" : "images"} ·{" "}
          {(assets.reduce((total, a) => total + a.size, 0) / 1048576).toFixed(1)} MB
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6">
        <label className="block font-bold">
          {ar ? "إضافة صورة إلى المكتبة" : "Add an image to the library"}
          <Input
            className="mt-3"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {preview && (
          <div className="mt-5">
            <img
              src={preview}
              alt={ar ? "معاينة الصورة" : "Image preview"}
              className="max-h-52 object-contain"
            />
            <div className="mt-4 flex gap-3">
              <BrandButton type="button" disabled={busy} onClick={() => void upload()}>
                {busy ? (ar ? "جارٍ الرفع…" : "Uploading…") : ar ? "رفع الصورة" : "Upload image"}
              </BrandButton>
              <BrandButton
                type="button"
                disabled={busy}
                variant="ghost"
                onClick={() => setFile(null)}
              >
                {ar ? "إلغاء" : "Cancel"}
              </BrandButton>
            </div>
          </div>
        )}
      </div>
      <Input
        aria-label={ar ? "البحث في الصور" : "Search images"}
        placeholder={ar ? "ابحث باسم الصورة…" : "Search by image name…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && (
        <p role="alert" className="rounded-xl bg-brand-gradient-soft p-4">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets
            .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
            .map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSelect={onSelect}
                usage={asset.usedBy.map((id) => {
                  const item = allContent.find((c) => c.id === id);
                  return item ? (ar ? item.title : item.title_en) : id;
                })}
              />
            ))}
        </div>
      )}
      {!loading && !assets.length && (
        <p className="text-muted-foreground">
          {ar
            ? "المكتبة فارغة. ارفعي أول صورة من الأعلى."
            : "The library is empty. Upload the first image above."}
        </p>
      )}
    </section>
  );
}
function AssetCard({
  asset,
  onSelect,
  usage,
}: {
  asset: MediaAsset;
  onSelect: ((url: string) => void) | undefined;
  usage: string[];
}) {
  const { lang } = useClub();
  const ar = lang === "ar";
  const [name, setName] = useState(asset.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function action(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch {
      setError(
        ar
          ? "تعذر إتمام العملية. قد تكون الصورة مستخدمة أو تحتاج صلاحيات."
          : "Could not complete the action. The image may be in use or access may be missing.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <img
        src={asset.url}
        alt={asset.name}
        loading="lazy"
        width={320}
        height={240}
        className="h-40 w-full rounded-xl object-contain"
      />
      <label className="mt-4 block text-sm font-bold">
        {ar ? "اسم الصورة" : "Image name"}
        <Input
          className="mt-2"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">{(asset.size / 1024).toFixed(0)} KB</p>
      {usage.length > 0 ? (
        <div className="mt-3 text-sm">
          <strong>{ar ? "مستخدمة في:" : "Used in:"}</strong>
          <ul className="mt-1 list-inside list-disc">
            {usage.map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {ar ? "غير مستخدمة في محتوى منشور" : "Not used in published content"}
        </p>
      )}
      {asset.deleting && (
        <p className="mt-3 text-sm">
          {ar
            ? "الحذف لم يكتمل. أعيدي محاولة الحذف."
            : "Deletion is pending. Retry deletion to finish."}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <BrandButton
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !name.trim() || asset.deleting}
          onClick={() => void action(() => renameMedia(asset.id, name))}
        >
          {ar ? "حفظ الاسم" : "Save name"}
        </BrandButton>
        {onSelect && (
          <BrandButton
            type="button"
            size="sm"
            disabled={busy || asset.deleting}
            onClick={() => onSelect(asset.url)}
          >
            {ar ? "اختيار" : "Select"}
          </BrandButton>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <BrandButton
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy || usage.length > 0}
            >
              {ar ? "حذف نهائي" : "Delete permanently"}
            </BrandButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {ar ? "حذف الصورة من التخزين؟" : "Delete image from storage?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {ar
                  ? "سيُحذف الملف نهائيًا. يسمح الحذف فقط إذا لم تستخدمه أي صفحة منشورة."
                  : "The file will be permanently deleted. Only images unused by published content can be deleted."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{ar ? "إلغاء" : "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void action(() => deleteMedia(asset.id))}>
                {ar ? "حذف" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
