"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="بازگشت به بالا"
      className="fixed bottom-6 left-6 z-40 w-11 h-11 bg-black text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
