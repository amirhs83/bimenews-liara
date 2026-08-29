import SiteHeader from "@/components/petro/site-header";
import SiteFooter from "@/components/petro/site-footer";
import { getNavCategories } from "@/lib/home-data";

export default async function Loading() {
  const navItems = await getNavCategories();
  return (
    <>
      <SiteHeader navItems={navItems} />
      <main className="flex-1 bg-zinc-50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-1/3 bg-zinc-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                  <div className="aspect-[16/10] bg-zinc-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-200 rounded w-4/5"></div>
                    <div className="h-3 bg-zinc-200 rounded w-full"></div>
                    <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}