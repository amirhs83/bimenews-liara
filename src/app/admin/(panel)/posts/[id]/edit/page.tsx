"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm, { type PostFormInitial } from "@/components/admin/post-form";
import { Loader2 } from "lucide-react";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPost(p: any): PostFormInitial {
  return {
    kicker: p.kicker ?? "",
    title: p.title,
    lead: p.lead,
    body: p.body,
    slug: p.slug,
    hasOwnPage: p.hasOwnPage,
    status: p.status,
    publishedAtLocal: toLocalInput(p.publishedAt),
    categoryId: p.categoryId,
    categoryIds:
      p.categories && p.categories.length > 0
        ? p.categories.map((c: any) => c.categoryId)
        : [p.categoryId],
    tags: p.tags.map((t: any) => t.tag.name),
    homeImage: p.homeImage ?? null,
    homeImageAlt: p.homeImageAlt ?? "",
    innerImage: p.innerImage ?? null,
    innerImageAlt: p.innerImageAlt ?? "",
    videoType: p.videoType,
    videoUrl: p.videoType === "UPLOAD" ? "" : p.videoUrl ?? "",
    videoMedia:
      p.videoType === "UPLOAD" && p.videoUrl
        ? {
            id: "",
            key: "",
            url: p.videoUrl,
            provider: "",
            kind: "video",
            mimeType: "",
            size: 0,
            width: null,
            height: null,
            alt: "",
          }
        : null,
    videoDuration: p.videoDuration ? String(p.videoDuration) : "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    metaKeywords: p.metaKeywords ?? "",
    ogImage: p.ogImage ?? null,
    canonicalUrl: p.canonicalUrl ?? "",
    placements: Object.fromEntries(
      p.placements.map((pl: any) => [pl.section.key, pl.position])
    ),
  };
}

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<PostFormInitial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/posts/${params.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || !d.ok) throw new Error(d?.error ?? "پست یافت نشد");
        setInitial(mapPost(d.post));
      })
      .catch((e) => setError(e.message));
  }, [params.id]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
        {error}
        <button
          onClick={() => router.push("/admin/posts")}
          className="block mt-3 text-blue-700 underline"
        >
          بازگشت به لیست پست‌ها
        </button>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="py-20 text-center text-zinc-500 text-sm">
        <Loader2 className="w-6 h-6 animate-spin inline-block ml-2" />
        در حال بارگذاری پست...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-zinc-900">ویرایش پست</h1>
        <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{initial.title}</p>
      </div>
      <PostForm postId={params.id} initial={initial} />
    </div>
  );
}
