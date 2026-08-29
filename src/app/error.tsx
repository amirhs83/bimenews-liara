"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-zinc-50 flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3">
          خطایی رخ داد
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 mb-8">
          در بارگذاری این صفحه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            تلاش مجدد
          </button>
          <Link
            href="/"
            className="bg-white border border-zinc-300 hover:border-blue-500 text-zinc-700 hover:text-blue-700 font-bold text-sm px-6 py-3 rounded-lg transition-colors"
          >
            صفحه اصلی
          </Link>
        </div>
      </div>
    </main>
  );
}