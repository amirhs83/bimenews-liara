"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PlusCircle,
  Search,
  Loader2,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

const statusMeta: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "پیش‌نویس", cls: "bg-zinc-100 text-zinc-600" },
  SCHEDULED: { label: "زمان‌بندی‌شده", cls: "bg-amber-100 text-amber-700" },
  PUBLISHED: { label: "منتشرشده", cls: "bg-green-100 text-green-700" },
};

export default function PostsListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const pageSize = 15;

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/admin/posts?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => toast.error("بارگذاری پست‌ها ناموفق بود"))
      .finally(() => setLoading(false));
  }, [page, q, status, categoryId]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function onDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleting.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.ok) throw new Error(d?.error ?? "حذف ناموفق بود");
      toast.success("پست حذف شد");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حذف ناموفق بود");
    } finally {
      setDeleteBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">پست‌ها</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {total} پست — جستجو، ویرایش و حذف
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          پست جدید
        </Link>
      </div>

      {/* filters */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو در تیترها..."
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="PUBLISHED">منتشرشده</option>
          <option value="DRAFT">پیش‌نویس</option>
          <option value="SCHEDULED">زمان‌بندی‌شده</option>
        </select>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin inline-block ml-2" />
            در حال بارگذاری...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-500">
            پستی یافت نشد.{" "}
            <Link href="/admin/posts/new" className="text-blue-700 underline">
              اولین پست را بسازید
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {items.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50/60">
                <div className="w-16 h-11 flex-shrink-0 rounded-md overflow-hidden bg-zinc-100 ring-1 ring-zinc-200">
                  {p.homeImage?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.homeImage.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                      {p.category?.name}
                    </span>
                    {p.categories?.length > 1 && (
                      <span className="bg-blue-50/50 text-blue-600 rounded-full px-2 py-0.5">
                        {p.categories.length - 1} دسته دیگر
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 font-medium ${statusMeta[p.status]?.cls}`}>
                      {statusMeta[p.status]?.label}
                    </span>
                    <span className="tabular-nums">
                      {new Date(p.publishedAt).toLocaleString("fa-IR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Eye className="w-3 h-3" />
                      {p.views.toLocaleString("fa-IR")}
                    </span>
                    {p.placements?.length > 0 && (
                      <span className="text-zinc-400">
                        بخش‌ها: {p.placements.map((pl: any) => `${pl.section.name} ${pl.position}`).join("، ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/admin/posts/${p.id}/edit`}
                    className="p-2 rounded-md text-zinc-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="ویرایش"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleting(p)}
                    className="p-2 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-sm">
            <span className="text-xs text-zinc-500 tabular-nums">
              صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-md border border-zinc-300 disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-md border border-zinc-300 disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" dir="rtl">
            <h3 className="font-bold text-zinc-900 mb-2">حذف پست</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              «{deleting.title}» برای همیشه حذف شود؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={onDelete}
                className="px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {deleteBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
