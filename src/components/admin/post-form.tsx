"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RichTextEditor from "@/components/admin/editor/rich-text-editor";
import MediaPicker from "@/components/admin/media-picker";
import TagInput from "@/components/admin/tag-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { UploadedMedia } from "@/lib/upload-client";
import { slugify } from "@/lib/slugify";
import { parseVideoEmbed } from "@/lib/video-embed";
import { Loader2, AlertTriangle } from "lucide-react";

// ---------- types ----------

export interface PostFormInitial {
  kicker: string;
  title: string;
  lead: string;
  body: string;
  slug: string;
  hasOwnPage: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishedAtLocal: string;
  categoryId: string; // main category
  categoryIds: string[]; // all ticked categories (includes main)
  tags: string[];
  homeImage: UploadedMedia | null;
  homeImageAlt: string;
  innerImage: UploadedMedia | null;
  innerImageAlt: string;
  videoType: "NONE" | "UPLOAD" | "APARAT" | "YOUTUBE";
  videoUrl: string;
  videoMedia: UploadedMedia | null;
  videoDuration: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: UploadedMedia | null;
  canonicalUrl: string;
  placements: Record<string, number | undefined>;
}

interface Category {
  id: string;
  name: string;
}

interface SectionInfo {
  id: string;
  key: string;
  name: string;
  capacity: number;
  placements: { position: number; post: { id: string; title: string } }[];
}

interface Conflict {
  sectionKey: string;
  sectionName: string;
  position: number;
  occupiedByTitle: string;
}

export const emptyPostForm: PostFormInitial = {
  kicker: "",
  title: "",
  lead: "",
  body: "",
  slug: "",
  hasOwnPage: true,
  status: "DRAFT",
  publishedAtLocal: "",
  categoryId: "",
  categoryIds: [],
  tags: [],
  homeImage: null,
  homeImageAlt: "",
  innerImage: null,
  innerImageAlt: "",
  videoType: "NONE",
  videoUrl: "",
  videoMedia: null,
  videoDuration: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: null,
  canonicalUrl: "",
  placements: {},
};

// ---------- small ui helpers ----------

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-zinc-800">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-zinc-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}

function CharCount({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length;
  const ok = len >= min && len <= max;
  return (
    <span
      className={`text-[11px] tabular-nums ${
        len === 0 ? "text-zinc-400" : ok ? "text-green-600" : "text-amber-600"
      }`}
    >
      {len} کاراکتر {len > 0 && !ok && `(پیشنهاد: ${min}–${max})`}
    </span>
  );
}

const inputCls =
  "bg-white border-zinc-300 focus-visible:ring-blue-500/30 focus-visible:border-blue-500";

// ---------- main component ----------

export default function PostForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: PostFormInitial;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"content" | "seo" | "display">("content");
  const [form, setForm] = useState<PostFormInitial>(initial ?? emptyPostForm);
  const [slugTouched, setSlugTouched] = useState(Boolean(postId));
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items ?? []))
      .catch(() => {});
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((d) => setSections(d.items ?? []))
      .catch(() => {});
  }, []);

  function set<K extends keyof PostFormInitial>(key: K, value: PostFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onTitleChange(v: string) {
    setForm((f) => ({
      ...f,
      title: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  }

  // default publish time = now (once, for new posts)
  useEffect(() => {
    if (!initial && !form.publishedAtLocal) {
      const d = new Date();
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      set("publishedAtLocal", local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const occupiedMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sections) {
      for (const p of s.placements) {
        m.set(`${s.key}:${p.position}`, p.post.title);
      }
    }
    return m;
  }, [sections]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "تیتر الزامی است";
    if (!form.lead.trim()) e.lead = "لید الزامی است";
    const bodyText = form.body.replace(/<[^>]*>/g, "").trim();
    if (!bodyText) e.body = "بدنه خبر الزامی است";
    if (!form.categoryId) e.categoryId = "دسته‌بندی اصلی را انتخاب کنید";
    if (form.categoryIds.length === 0)
      e.categoryIds = "حداقل یک دسته‌بندی را انتخاب کنید";
    if (form.categoryId && !form.categoryIds.includes(form.categoryId))
      e.categoryId = "دسته‌بندی اصلی باید جزو دسته‌های انتخاب‌شده باشد";
    if (!form.homeImage) e.homeImage = "تصویر صفحه اصلی الزامی است";
    if (!form.homeImageAlt.trim()) e.homeImageAlt = "متن جایگزین تصویر الزامی است";
    if (form.innerImage && !form.innerImageAlt.trim())
      e.innerImageAlt = "متن جایگزین تصویر داخل خبر الزامی است";
    if (!form.publishedAtLocal) e.publishedAt = "تاریخ انتشار الزامی است";
    if (form.videoType === "UPLOAD" && !form.videoMedia)
      e.video = "فایل ویدیو را انتخاب کنید";
    if (
      (form.videoType === "APARAT" || form.videoType === "YOUTUBE") &&
      !parseVideoEmbed(form.videoUrl || "")
    )
      e.video = "لینک ویدیو معتبر نیست (آپارات یا یوتیوب)";
    setErrors(e);
    if (Object.keys(e).length) {
      setTab("content");
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return false;
    }
    return true;
  }

  function buildPayload(mode: "strict" | "force") {
    const placements = Object.entries(form.placements)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
      .map(([sectionKey, position]) => ({ sectionKey, position }));

    let videoUrl: string | null = null;
    if (form.videoType === "UPLOAD") videoUrl = form.videoMedia?.url ?? null;
    else if (form.videoType !== "NONE")
      videoUrl = parseVideoEmbed(form.videoUrl)?.embedUrl ?? null;

    return {
      kicker: form.kicker || null,
      title: form.title.trim(),
      lead: form.lead.trim(),
      body: form.body,
      slug: form.slug || null,
      hasOwnPage: form.hasOwnPage,
      status: form.status,
      publishedAt: new Date(form.publishedAtLocal).toISOString(),
      categoryId: form.categoryId,
      categories: form.categoryIds,
      tags: form.tags,
      homeImageId: form.homeImage!.id,
      homeImageAlt: form.homeImageAlt.trim(),
      innerImageId: form.innerImage?.id ?? null,
      innerImageAlt: form.innerImageAlt.trim(),
      videoType: form.videoType,
      videoUrl,
      videoDuration: form.videoDuration ? parseInt(form.videoDuration, 10) : null,
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
      metaKeywords: form.metaKeywords || null,
      ogImageId: form.ogImage?.id ?? null,
      canonicalUrl: form.canonicalUrl || null,
      placements,
      placementsMode: mode,
    };
  }

  async function submit(mode: "strict" | "force") {
    setSaving(true);
    try {
      const res = await fetch(
        postId ? `/api/admin/posts/${postId}` : "/api/admin/posts",
        {
          method: postId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(mode)),
        }
      );
      const data = await res.json().catch(() => null);

      if (res.status === 409 && data?.conflicts) {
        setConflicts(data.conflicts);
        return;
      }
      if (!res.ok || !data?.ok) {
        toast.error(data?.error ?? "ذخیره پست ناموفق بود");
        return;
      }
      toast.success(postId ? "پست به‌روزرسانی شد" : "پست ایجاد شد");
      setConflicts(null);
      router.push("/admin/posts");
      router.refresh();
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    submit("strict");
  }

  const tabs = [
    { key: "content" as const, label: "محتوا" },
    { key: "seo" as const, label: "سئو" },
    { key: "display" as const, label: "نمایش در سایت" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-zinc-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ============ TAB: content ============ */}
      <div className={tab === "content" ? "space-y-5" : "hidden"}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* right column: text fields */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <Field label="روتیتر" hint="اختیاری — بالای تیتر نمایش داده می‌شود">
                <Input
                  value={form.kicker}
                  onChange={(e) => set("kicker", e.target.value)}
                  className={inputCls}
                  maxLength={200}
                />
              </Field>
              <Field label="تیتر" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className={`${inputCls} font-bold`}
                  maxLength={300}
                />
              </Field>
              <Field label="لید" required error={errors.lead}>
                <Textarea
                  value={form.lead}
                  onChange={(e) => set("lead", e.target.value)}
                  className={`${inputCls} min-h-[80px] leading-relaxed`}
                  maxLength={1500}
                />
              </Field>
              <Field label="بدنه خبر" required error={errors.body}>
                <RichTextEditor
                  value={form.body}
                  onChange={(html) => set("body", html)}
                />
              </Field>
            </div>

            {/* video */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-zinc-900 text-sm">
                ویدیو (برای بخش ویدیو) — اختیاری
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["NONE", "بدون ویدیو"],
                    ["UPLOAD", "آپلود فایل"],
                    ["APARAT", "آپارات"],
                    ["YOUTUBE", "یوتیوب"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("videoType", v)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      form.videoType === v
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "border-zinc-300 text-zinc-600 hover:border-blue-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.videoType === "UPLOAD" && (
                <MediaPicker
                  kind="video"
                  value={form.videoMedia}
                  onSelect={(m) => set("videoMedia", m)}
                  onClear={() => set("videoMedia", null)}
                />
              )}
              {(form.videoType === "APARAT" || form.videoType === "YOUTUBE") && (
                <Input
                  dir="ltr"
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder={
                    form.videoType === "APARAT"
                      ? "https://www.aparat.com/v/..."
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className={inputCls}
                />
              )}
              {form.videoType !== "NONE" && (
                <Field label="مدت ویدیو (ثانیه)" hint="اختیاری">
                  <Input
                    dir="ltr"
                    type="number"
                    min={0}
                    value={form.videoDuration}
                    onChange={(e) => set("videoDuration", e.target.value)}
                    className={`${inputCls} w-40`}
                  />
                </Field>
              )}
              {errors.video && (
                <p className="text-[11px] text-red-600 font-medium">{errors.video}</p>
              )}
            </div>
          </div>

          {/* left column: images + taxonomy + publishing */}
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <Field label="تصویر صفحه اصلی" required error={errors.homeImage}>
                <MediaPicker
                  kind="image"
                  value={form.homeImage}
                  onSelect={(m) => {
                    set("homeImage", m);
                    if (!form.homeImageAlt && m.alt) set("homeImageAlt", m.alt);
                  }}
                  onClear={() => set("homeImage", null)}
                />
              </Field>
              <Field label="متن جایگزین (alt)" required error={errors.homeImageAlt}>
                <Input
                  value={form.homeImageAlt}
                  onChange={(e) => set("homeImageAlt", e.target.value)}
                  className={inputCls}
                  maxLength={300}
                />
              </Field>
              <Field
                label="تصویر داخل خبر"
                hint="اختیاری — اگر خالی باشد از تصویر صفحه اصلی استفاده می‌شود"
                error={errors.innerImageAlt}
              >
                <MediaPicker
                  kind="image"
                  value={form.innerImage}
                  onSelect={(m) => {
                    set("innerImage", m);
                    if (!form.innerImageAlt && m.alt) set("innerImageAlt", m.alt);
                  }}
                  onClear={() => set("innerImage", null)}
                />
              </Field>
              {form.innerImage && (
                <Field label="alt تصویر داخل خبر" required>
                  <Input
                    value={form.innerImageAlt}
                    onChange={(e) => set("innerImageAlt", e.target.value)}
                    className={inputCls}
                    maxLength={300}
                  />
                </Field>
              )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <Field
                label="دسته‌بندی‌ها"
                hint="چند دسته را تیک بزنید؛ با دکمه «اصلی» اصلی‌ترین دسته را مشخص کنید"
                required
                error={errors.categoryIds || errors.categoryId}
              >
                <div className="space-y-1.5">
                  {categories.map((c) => {
                    const checked = form.categoryIds.includes(c.id);
                    const isMain = form.categoryId === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                          checked
                            ? "border-blue-400 bg-blue-50/50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setForm((f) => {
                                let ids = e.target.checked
                                  ? [...f.categoryIds, c.id]
                                  : f.categoryIds.filter((id) => id !== c.id);
                                // auto-assign main when first category is ticked
                                let main = f.categoryId;
                                if (e.target.checked && !main) main = c.id;
                                // when the main category is unticked, promote another
                                if (!e.target.checked && main === c.id) {
                                  main = ids[0] ?? "";
                                }
                                return { ...f, categoryIds: ids, categoryId: main };
                              });
                            }}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span
                            className={`text-sm ${
                              isMain
                                ? "font-bold text-blue-800"
                                : "font-medium text-zinc-800"
                            }`}
                          >
                            {c.name}
                          </span>
                        </label>
                        <label
                          className={`flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                            isMain
                              ? "bg-blue-600 text-white"
                              : checked
                                ? "bg-white text-blue-600 border border-blue-300 hover:bg-blue-50"
                                : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                          }`}
                        >
                          <input
                            type="radio"
                            name="main-category"
                            checked={isMain}
                            disabled={!checked}
                            onChange={() => {
                              setForm((f) => ({ ...f, categoryId: c.id }));
                            }}
                            className="sr-only"
                          />
                          اصلی
                        </label>
                      </div>
                    );
                  })}
                </div>
              </Field>
              <Field label="برچسب‌ها" hint="Enter برای افزودن — حداکثر ۲۰ برچسب">
                <TagInput
                  value={form.tags}
                  onChange={(tags) => set("tags", tags)}
                />
              </Field>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <Field label="تاریخ و ساعت انتشار" required error={errors.publishedAt}>
                <Input
                  type="datetime-local"
                  dir="ltr"
                  value={form.publishedAtLocal}
                  onChange={(e) => set("publishedAtLocal", e.target.value)}
                  className={`${inputCls} text-left`}
                />
              </Field>
              <Field label="وضعیت">
                <div className="flex gap-2">
                  {(
                    [
                      ["DRAFT", "پیش‌نویس"],
                      ["SCHEDULED", "زمان‌بندی‌شده"],
                      ["PUBLISHED", "منتشرشده"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("status", v)}
                      className={`flex-1 px-2 py-2 text-xs rounded-lg border transition-colors ${
                        form.status === v
                          ? "bg-blue-600 text-white border-blue-600 font-bold"
                          : "border-zinc-300 text-zinc-600 hover:border-blue-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="صفحه اختصاصی">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.hasOwnPage}
                    onClick={() => set("hasOwnPage", !form.hasOwnPage)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.hasOwnPage ? "bg-blue-600" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        form.hasOwnPage ? "right-0.5" : "right-[22px]"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-700">
                    {form.hasOwnPage ? "دارد" : "ندارد"}
                  </span>
                </div>
              </Field>
              {form.hasOwnPage && (
                <Field label="اسلاگ (آدرس صفحه)" hint="خالی = ساخت خودکار از تیتر">
                  <Input
                    dir="ltr"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className={`${inputCls} text-left`}
                    maxLength={220}
                  />
                </Field>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ TAB: seo ============ */}
      <div className={tab === "seo" ? "space-y-5" : "hidden"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <Field
              label="عنوان متا"
              hint="خالی = همان تیتر خبر"
            >
              <Input
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                className={inputCls}
                maxLength={300}
              />
              <CharCount value={form.metaTitle} min={50} max={60} />
            </Field>
            <Field label="توضیحات متا" hint="خالی = همان لید خبر">
              <Textarea
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                className={`${inputCls} min-h-[90px] leading-relaxed`}
                maxLength={500}
              />
              <CharCount value={form.metaDescription} min={150} max={160} />
            </Field>
            <Field label="کلمات کلیدی" hint="با ویرگول جدا کنید">
              <Input
                value={form.metaKeywords}
                onChange={(e) => set("metaKeywords", e.target.value)}
                className={inputCls}
                maxLength={500}
              />
            </Field>
            <Field
              label="تصویر Open Graph"
              hint="خالی = تصویر صفحه اصلی خبر"
            >
              <MediaPicker
                kind="image"
                value={form.ogImage}
                onSelect={(m) => set("ogImage", m)}
                onClear={() => set("ogImage", null)}
              />
            </Field>
            <Field label="Canonical URL" hint="خالی = ساخت خودکار از اسلاگ">
              <Input
                dir="ltr"
                value={form.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                className={`${inputCls} text-left`}
                placeholder="https://bimenews.com/news/..."
              />
            </Field>
          </div>

          {/* google preview */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-bold text-zinc-900 text-sm mb-4">
              پیش‌نمایش در نتایج گوگل
            </h3>
            <div className="border border-zinc-100 rounded-lg p-4 bg-zinc-50/50" dir="rtl">
              <div className="text-[12px] text-zinc-500 mb-1" dir="ltr">
                bimenews.ir › news › {form.slug || "..."}
              </div>
              <div className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer line-clamp-1">
                {form.metaTitle || form.title || "تیتر خبر"}
              </div>
              <div className="text-sm text-zinc-600 leading-relaxed mt-1 line-clamp-2">
                {form.metaDescription || form.lead || "توضیحات متا اینجا نمایش داده می‌شود..."}
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed">
              پیش‌نمایش تقریبی است؛ نمایش نهایی به گوگل بستگی دارد.
            </p>
          </div>
        </div>
      </div>

      {/* ============ TAB: display ============ */}
      <div className={tab === "display" ? "space-y-5" : "hidden"}>
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-bold text-zinc-900 text-sm mb-1">
            قرارگیری در بخش‌های صفحه اصلی
          </h3>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            برای هر بخش، موقعیت دلخواه را انتخاب کنید. یک پست می‌تواند هم‌زمان
            در چند بخش و حتی چند موقعیت از یک بخش قرار گیرد. اگر موقعیت اشغال
            باشد، هنگام ذخیره هشدار می‌گیرید و می‌توانید جایگزین کنید.
          </p>
          <div className="divide-y divide-zinc-100">
            {sections.map((s) => {
              const position = form.placements[s.key];
              const checked = typeof position === "number";
              return (
                <div key={s.key} className="flex items-center gap-3 py-3">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setForm((f) => {
                          const placements = { ...f.placements };
                          if (e.target.checked) {
                            // first free position within capacity
                            let pos = 1;
                            const taken = new Set(
                              s.placements.map((p) => p.position)
                            );
                            while (taken.has(pos) && pos <= s.capacity) pos++;
                            placements[s.key] = pos;
                          } else {
                            delete placements[s.key];
                          }
                          return { ...f, placements };
                        });
                      }}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm font-medium text-zinc-800">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      (ظرفیت {s.capacity})
                    </span>
                  </label>
                  {checked && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">موقعیت:</span>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={position}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setForm((f) => ({
                            ...f,
                            placements: {
                              ...f.placements,
                              [s.key]: Number.isNaN(v) ? 1 : Math.max(1, v),
                            },
                          }));
                        }}
                        className={`${inputCls} w-20 text-center`}
                      />
                      {occupiedMap.has(`${s.key}:${position}`) && (
                        <span
                          className="text-[10px] text-amber-600 inline-flex items-center gap-1"
                          title={occupiedMap.get(`${s.key}:${position}`)}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          اشغال
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* submit bar */}
      <div className="sticky bottom-0 bg-white border border-zinc-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-lg">
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {postId ? "به‌روزرسانی پست" : "ایجاد پست"}
        </button>
      </div>

      {/* conflict dialog */}
      {conflicts && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" dir="rtl">
            <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              موقعیت اشغال است
            </h3>
            <p className="text-sm text-zinc-600 mb-3 leading-relaxed">
              موقعیت‌های زیر توسط پست‌های دیگر اشغال شده‌اند. با جایگزینی،
              پست‌های قبلی از آن موقعیت خارج می‌شوند:
            </p>
            <ul className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 space-y-1">
              {conflicts.map((c, i) => (
                <li key={i}>
                  <strong>{c.sectionName}</strong> — موقعیت {c.position}: «
                  {c.occupiedByTitle}»
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConflicts(null)}
                className="px-4 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                بازبینی موقعیت‌ها
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => submit("force")}
                className="px-4 py-2 text-sm font-bold rounded-md bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-60"
              >
                {saving ? "در حال ذخیره..." : "جایگزینی"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
