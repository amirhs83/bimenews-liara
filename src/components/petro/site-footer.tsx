import { socialLinks } from "@/lib/news-data";
import { db } from "@/lib/db";
import { Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";

function SocialIcon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    twitter: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z" />
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default async function SiteFooter() {
  const footerCategories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: 10,
  });

  return (
    <footer className="mt-auto bg-petro-black text-zinc-300 border-t-4 border-blue-700 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-950/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Newsletter top bar */}
      <div id="newsletter" className="relative border-b border-zinc-800/80">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold mb-1.5">
              BimeNews Newsletter
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5">
              مشترک خبرنامه بیمه نیوز شوید
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              هر روز خلاصه مهم‌ترین اخبار و تحلیل‌های صنعت بیمه را در ایمیل خود
              دریافت کنید.
            </p>
          </div>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="ایمیل شما..."
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 flex-1 transition-all"
              dir="rtl"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-4 sm:px-5 py-2.5 text-xs sm:text-sm rounded-lg whitespace-nowrap transition-all shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              عضویت
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* About - spans 2 cols on mobile */}
          <div className="lg:col-span-4 col-span-2">
            <img
              src="/bimenews-logo-white.png"
              alt="بیمه نیوز - BimeNews"
              className="h-12 sm:h-14 w-auto mb-3 sm:mb-4"
            />
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4 sm:mb-5">
              بیمه نیوز، پایگاه تخصصی اخبار و تحلیل صنعت بیمه ایران و جهان است
              که با هدف اطلاع‌رسانی دقیق و به‌موقع در حوزه بازار بیمه،
              تنظیم‌گری و اینشورتک فعالیت می‌کند.
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2 sm:gap-2.5 text-zinc-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 sm:w-3.5 sm:h-3.5 h-3 text-blue-500" />
                </div>
                <span className="pt-1 text-[11px] sm:text-sm">تهران، خیابان ولیعصر، برج بیمه، طبقه ۱۲</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-zinc-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3 sm:w-3.5 sm:h-3.5 h-3 text-blue-500" />
                </div>
                <span dir="ltr" className="pt-1 text-[11px] sm:text-sm">+98 21 8800 1234</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 text-zinc-400">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3 sm:w-3.5 sm:h-3.5 h-3 text-blue-500" />
                </div>
                <span dir="ltr" className="pt-1 text-[11px] sm:text-sm">info@bimenews.ir</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              دسته‌بندی‌ها
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {footerCategories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/category/${cat.slug}`}
                    className="text-xs sm:text-sm text-zinc-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all text-blue-500" />
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              دسترسی سریع
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { label: "درباره ما", href: "/about" },
                { label: "تماس با ما", href: "/contact" },
                { label: "تبلیغات", href: "/contact" },
                { label: "نقشه سایت", href: "/sitemap.xml" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-xs sm:text-sm text-zinc-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all text-blue-500" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social - spans 2 cols on mobile */}
          <div className="lg:col-span-4 col-span-2">
            <div className="mt-0">
              <h4 className="text-white font-bold mb-3 text-xs sm:text-sm uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                ما را دنبال کنید
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-zinc-700 hover:bg-blue-600 hover:border-blue-600 text-zinc-300 hover:text-white rounded-md transition-all hover:scale-105"
                  >
                    <SocialIcon name={s.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="relative border-t border-zinc-800/80 bg-black/40 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-center">
            <span>© {new Date().getFullYear()} پایگاه خبری بیمه نیوز</span>
            <span className="text-zinc-700">·</span>
            <span>تمامی حقوق محفوظ است.</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/privacy" className="hover:text-blue-400 transition-colors">
              قوانین
            </a>
            <span className="text-zinc-700">|</span>
            <a href="/privacy" className="hover:text-blue-400 transition-colors">
              حریم خصوصی
            </a>
            <span className="text-zinc-700">|</span>
            <a href="/feed.xml" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
