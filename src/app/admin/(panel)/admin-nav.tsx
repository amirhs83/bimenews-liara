"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";
import { LayoutDashboard, Newspaper, PlusCircle, FolderTree, LayoutGrid } from "lucide-react";

const items = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "پست‌ها", icon: Newspaper },
  { href: "/admin/posts/new", label: "پست جدید", icon: PlusCircle },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/sections", label: "چیدمان صفحه اصلی", icon: LayoutGrid },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-zinc-800">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex items-center justify-between">
        <ul className="flex items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) &&
                !(item.href === "/admin/posts" && pathname === "/admin/posts/new");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? "border-blue-500 text-white"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden sm:block">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
