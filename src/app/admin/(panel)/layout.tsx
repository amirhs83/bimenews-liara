export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import AdminNav from "./admin-nav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Brand bar — same dark language as the site */}
      <header className="bg-petro-black text-white sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bimenews-logo-white-header.png"
              alt="بیمه نیوز"
              className="h-7 w-auto"
            />
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-r border-zinc-800 pr-3 mr-1">
              پنل مدیریت محتوا
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400" dir="ltr">
              {session.email}
            </span>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        {children}
      </main>
      <Toaster position="top-center" richColors dir="rtl" />
    </div>
  );
}
