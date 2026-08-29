import { db } from "@/lib/db";
import Link from "next/link";
import {
  Newspaper,
  LayoutGrid,
  Tags,
  FolderTree,
  Image as ImageIcon,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [postCount, publishedCount, categoryCount, tagCount, sectionCount, mediaCount] =
    await Promise.all([
      db.post.count(),
      db.post.count({ where: { status: "PUBLISHED" } }),
      db.category.count(),
      db.tag.count(),
      db.homeSection.count(),
      db.media.count(),
    ]);

  const stats = [
    { label: "همه پست‌ها", value: postCount, icon: Newspaper },
    { label: "منتشرشده", value: publishedCount, icon: Newspaper },
    { label: "دسته‌بندی‌ها", value: categoryCount, icon: FolderTree },
    { label: "برچسب‌ها", value: tagCount, icon: Tags },
    { label: "بخش‌های صفحه اصلی", value: sectionCount, icon: LayoutGrid },
    { label: "رسانه‌ها", value: mediaCount, icon: ImageIcon },
  ];

  const actions = [
    {
      href: "/admin/posts/new",
      title: "پست جدید",
      desc: "ایجاد خبر با محتوا، سئو و چیدمان بخش‌ها",
      icon: PlusCircle,
    },
    {
      href: "/admin/posts",
      title: "مدیریت پست‌ها",
      desc: "جستجو، ویرایش و حذف پست‌های موجود",
      icon: Newspaper,
    },
    {
      href: "/admin/sections",
      title: "چیدمان صفحه اصلی",
      desc: "ترتیب پست‌ها در هر بخش هوم‌پیج",
      icon: LayoutGrid,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">داشبورد</h1>
          <p className="text-sm text-zinc-500 mt-1">
            مدیریت محتوای پایگاه خبری بیمه نیوز
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-blue-700 transition-colors"
        >
          مشاهده سایت
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-zinc-200 rounded-xl p-4"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5">
              <s.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-black text-zinc-900 tabular-nums">
              {s.value}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
              <a.icon className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-zinc-900 mb-1">{a.title}</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
