"use client";

import { useState } from "react";
import RichTextEditor from "@/components/admin/editor/rich-text-editor";

export default function EditorTestPage() {
  const [html, setHtml] = useState("<p>متن خبر را اینجا بنویسید...</p>");
  const [showHtml, setShowHtml] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-zinc-900 mb-1">
          ویرایشگر متن غنی — TipTap
        </h1>
        <p className="text-sm text-zinc-500">
          تصویر و ویدیو از طریق لایه‌ی ذخیره‌سازی فاز ۳ آپلود می‌شوند. خروجی
          هنگام ذخیره‌ی پست، سمت سرور پاکسازی (sanitize) می‌شود.
        </p>
      </div>

        <RichTextEditor value={html} onChange={setHtml} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHtml((s) => !s)}
            className="px-4 py-2 text-sm rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          >
            {showHtml ? "پنهان‌کردن HTML" : "نمایش خروجی HTML"}
          </button>
        </div>

        {showHtml && (
          <pre
            dir="ltr"
            className="bg-zinc-900 text-zinc-100 text-xs leading-relaxed rounded-xl p-4 overflow-x-auto whitespace-pre-wrap"
          >
            {html}
          </pre>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="text-sm font-bold text-zinc-700 mb-4">
            پیش‌نمایش رندر:
          </h2>
          <div
            className="tiptap-editor rendered-preview"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
    </div>
  );
}
