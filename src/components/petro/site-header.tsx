"use client";

import { useState, useEffect } from "react";
import { Menu, Search, X, ChevronDown, Bell, Globe } from "lucide-react";
import { utilityLinks } from "@/lib/news-data";
import type { NavItem } from "@/lib/home-data";

const fallbackNav: NavItem[] = [{ label: "صفحه اصلی", href: "/", hot: true }];

export default function SiteHeader({ navItems }: { navItems?: NavItem[] }) {
  const navLinks = navItems?.length ? navItems : fallbackNav;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Compute date string on each render to avoid hydration mismatch
  const today = new Date();
  const dateStr = today.toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="bg-petro-black text-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="hidden md:flex items-center gap-3 text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="live-dot"></span>
                <span className="font-medium">پخش زنده</span>
              </span>
              <span className="text-zinc-700">·</span>
              <span>{dateStr}</span>
            </div>
            <nav className="flex items-center gap-5 overflow-x-auto scrollbar-hidden">
              {utilityLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className={`whitespace-nowrap text-zinc-300 hover:text-white transition-colors relative group ${
                    link.fa ? "" : "tracking-wide uppercase text-[10px] font-semibold"
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 right-0 left-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <button className="text-zinc-400 hover:text-white transition-colors" aria-label="اعلان‌ها">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white border border-zinc-800 px-2 py-0.5 transition-colors">
                <Globe className="w-3 h-3" />
                FA <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main brand bar */}
      <div className={`bg-petro-black text-white transition-all duration-300 ${scrolled ? "py-3" : "py-4 sm:py-5"}`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          {/* ===== Mobile row (logo left — hamburger+search right) ===== */}
          <div className="flex lg:hidden items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 hover:bg-zinc-900 rounded-md transition-colors text-white"
                aria-label="منو"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                className="p-2 hover:bg-zinc-900 rounded-md transition-colors text-white"
                aria-label="جستجو"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
            <a href="/" className="flex items-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bimenews-logo-white-header.png"
                alt="بیمه نیوز - BimeNews"
                className="h-10 w-auto transition-transform group-hover:scale-[1.02]"
              />
            </a>
          </div>

          {/* ===== Desktop row (original layout) ===== */}
          <div className="hidden lg:flex items-center justify-between gap-3 sm:gap-6">
            {/* Right: Logo */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <a href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
                <div className="relative flex-shrink-0 flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/bimenews-logo-white-header.png"
                    alt="بیمه نیوز - BimeNews"
                    className="h-7 sm:h-9 md:h-10 w-auto transition-transform group-hover:scale-[1.02]"
                    width={63}
                    height={34}
                  />
                </div>
                <div className="hidden md:flex flex-col text-[9px] uppercase tracking-[0.25em] text-zinc-500 border-r border-zinc-800 pr-3 mr-1 leading-tight">
                  <span>پایگاه خبری</span>
                  <span className="text-zinc-600">صنعت بیمه ایران و جهان</span>
                </div>
              </a>
            </div>

            {/* Center: Search - desktop only */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <input
                  type="search"
                  placeholder="جستجوی اخبار، تحلیل‌ها، گزارش‌ها..."
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-md text-sm px-4 py-2.5 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white transition-colors"
                  aria-label="جستجو"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Left: Date + CTA (desktop only) */}
            <div className="hidden lg:flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden lg:block text-left">
                <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                  Volume 14 · No 328
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">{dateStr}</div>
              </div>
              <a
                href="/contact"
                className="hidden lg:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-lg shadow-blue-600/20"
              >
                عضویت ویژه
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className={`bg-white border-b border-zinc-200 transition-all duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <ul className="hidden lg:flex items-center h-12 text-sm">
            {navLinks.map((link, i) => (
              <li key={i}>
                <a
                  href={link.href}
                  className={`nav-link inline-flex items-center gap-1.5 px-4 py-2 font-medium transition-colors ${
                    i === 0
                      ? "text-blue-700 active"
                      : "text-zinc-700 hover:text-blue-700"
                  }`}
                >
                  {link.label}
                  {link.hot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile nav */}
          <div className="lg:hidden flex items-center h-12 overflow-x-auto scrollbar-hidden gap-1">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1 text-sm font-medium rounded-md ${
                  i === 0
                    ? "text-blue-700 bg-blue-50"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-petro-black text-white p-5 flex items-center justify-between">
              <img
                src="/bimenews-logo-white-header.png"
                alt="بیمه نیوز - BimeNews"
                className="h-8 w-auto"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="search"
                  placeholder="جستجو..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md text-sm px-4 py-2.5 pl-10 focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
              <ul className="space-y-0.5">
                {navLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-zinc-50 hover:text-blue-700 rounded-md transition-colors"
                    >
                      {link.label}
                      {link.hot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="block mt-4 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold py-2.5 rounded-md transition-colors"
              >
                عضویت ویژه
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
