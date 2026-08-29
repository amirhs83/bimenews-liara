"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderTree,
  X,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => toast.error("بارگذاری دسته‌بندی‌ها ناموفق بود"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || null,
          ...(order ? { order: parseInt(order, 10) } : {}),
        }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error(d?.error ?? "ایجاد ناموفق بود");
      toast.success(`دسته «${d.category.name}» ایجاد شد`);
      setName("");
      setSlug("");
      setOrder("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ایجاد ناموفق بود");
    } finally {
      setAdding(false);
    }
  }

  async function onSaveEdit() {
    if (!editing) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          slug: editing.slug,
          order: Number(editing.order),
        }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error(d?.error ?? "به‌روزرسانی ناموفق بود");
      toast.success("دسته‌بندی به‌روزرسانی شد");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "به‌روزرسانی ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleting.id}`, {
        method: "DELETE",
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error(d?.error ?? "حذف ناموفق بود");
      toast.success("دسته‌بندی حذف شد");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حذف ناموفق بود");
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-zinc-900">دسته‌بندی‌ها</h1>
        <p className="text-sm text-zinc-500 mt-1">
          دسته‌های خبری سایت — در نویگیشن، فرم پست و صفحات آرشیو استفاده می‌شوند
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={onAdd}
        className="bg-white border border-zinc-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row gap-2 sm:items-end"
      >
        <div className="flex-1">
          <label className="text-xs font-bold text-zinc-700 block mb-1">
            نام دسته <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: بیمه عمر"
            className="bg-white border-zinc-300"
            maxLength={100}
          />
        </div>
        <div className="sm:w-52">
          <label className="text-xs font-bold text-zinc-700 block mb-1">
            اسلاگ (اختیاری)
          </label>
          <Input
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="life-insurance"
            className="bg-white border-zinc-300 text-left"
            maxLength={120}
          />
        </div>
        <div className="sm:w-24">
          <label className="text-xs font-bold text-zinc-700 block mb-1">ترتیب</label>
          <Input
            dir="ltr"
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="خودکار"
            className="bg-white border-zinc-300 text-left"
          />
        </div>
        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          افزودن
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin inline-block ml-2" />
            در حال بارگذاری...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 text-xs">
                <th className="text-right px-4 py-3 font-bold w-16">ترتیب</th>
                <th className="text-right px-4 py-3 font-bold">نام</th>
                <th className="text-right px-4 py-3 font-bold">اسلاگ</th>
                <th className="text-right px-4 py-3 font-bold w-24">پست‌ها</th>
                <th className="text-right px-4 py-3 font-bold w-28">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/60">
                  <td className="px-4 py-3 tabular-nums text-zinc-500">{c.order}</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">
                    <span className="inline-flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-blue-600" />
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500" dir="ltr">
                    <span className="text-xs bg-zinc-100 rounded px-2 py-0.5">/category/{c.slug}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-500">
                    {c._count?.posts ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...c })}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-blue-700 hover:bg-blue-50"
                        title="ویرایش"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(c)}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900">ویرایش دسته‌بندی</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">نام</label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="bg-white border-zinc-300"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">اسلاگ</label>
                <Input
                  dir="ltr"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="bg-white border-zinc-300 text-left"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">ترتیب</label>
                <Input
                  dir="ltr"
                  type="number"
                  min={0}
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: e.target.value })}
                  className="bg-white border-zinc-300 text-left w-28"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={busy || !editing.name.trim()}
                onClick={onSaveEdit}
                className="px-4 py-2 text-sm font-bold rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" dir="rtl">
            <h3 className="font-bold text-zinc-900 mb-2">حذف دسته‌بندی</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-1">
              «{deleting.name}» حذف شود؟
            </p>
            {(deleting._count?.posts ?? 0) > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-1">
                این دسته {deleting._count.posts} پست دارد و قابل حذف نیست — ابتدا
                پست‌ها را منتقل کنید.
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={busy || (deleting._count?.posts ?? 0) > 0}
                onClick={onDelete}
                className="px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
