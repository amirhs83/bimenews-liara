import { Camera, Film, ArrowLeft, VolumeX } from "lucide-react";
import SmartImage from "./smart-image";
import VideoPreview from "./video-preview";
import type { HomePost } from "@/lib/home-data";

export default function MultimediaSection({ items }: { items: HomePost[] }) {
  if (items.length === 0) return null;

  const featured = items[0];
  const p2 = items[1];
  const p3 = items[2];
  const videoTile = items[3];
  const p4 = items[4];
  const wide = items.slice(5, 7);

  const subtitle = (p: HomePost) => p.kicker ?? "گزارش تصویری";

  return (
    <section className="bg-zinc-50 border-b border-zinc-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-petro-black">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-petro-black text-white flex items-center justify-center">
              <Camera className="w-4.5 h-4.5" />
            </span>
            <h2 className="section-heading text-2xl md:text-3xl font-black tracking-tight">
              عکس و فیلم
            </h2>
          </div>
          <a
            href="/category/reports"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 font-bold transition-colors group"
          >
            گالری کامل
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Top grid: featured photo + photo stack + video & photo stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Featured photo */}
          {featured && (
            <a
              href={featured.href ?? "#"}
              className="lg:col-span-6 block relative overflow-hidden rounded-xl group aspect-[4/3] bg-zinc-200"
            >
              <SmartImage
                src={featured.imageUrl}
                alt={featured.imageAlt}
                ratio="auto"
                category="reports"
                className="!w-full !h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3 h-3" />
                گزارش تصویری
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-5 text-white">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-snug group-hover:text-blue-300 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1.5">
                  {subtitle(featured)}
                </p>
              </div>
            </a>
          )}

          {/* Two stacked photos */}
          {(p2 || p3) && (
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-1 lg:grid-rows-2 gap-4">
              {[p2, p3].filter(Boolean).map((p) => (
                <a
                  key={p!.id}
                  href={p!.href ?? "#"}
                  className="block relative overflow-hidden rounded-xl group aspect-[4/3] md:aspect-auto bg-zinc-200"
                >
                  <SmartImage
                    src={p!.imageUrl}
                    alt={p!.imageAlt}
                    ratio="auto"
                    category="reports"
                    className="!w-full !h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-3 text-white">
                    <h4 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                      {p!.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Video tile + photo */}
          {(videoTile || p4) && (
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-1 lg:grid-rows-2 gap-4">
              {videoTile && (
                <a
                  href={videoTile.href ?? "#"}
                  className="block relative overflow-hidden rounded-xl group aspect-[4/3] md:aspect-auto bg-zinc-900"
                >
                  {videoTile.isUploadedVideo && videoTile.videoUrl ? (
                    <VideoPreview
                      src={videoTile.videoUrl}
                      start={4}
                      segment={8}
                      className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <SmartImage
                      src={videoTile.imageUrl}
                      alt={videoTile.imageAlt}
                      ratio="auto"
                      category="video"
                      className="!w-full !h-full"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-blue-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                    <Film className="w-2.5 h-2.5" />
                    فیلم
                  </div>
                  {videoTile.isUploadedVideo && (
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white p-1 rounded-full">
                      <VolumeX className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 left-0 p-3 text-white">
                    <h4 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                      {videoTile.title}
                    </h4>
                  </div>
                </a>
              )}
              {p4 && (
                <a
                  href={p4.href ?? "#"}
                  className="block relative overflow-hidden rounded-xl group aspect-[4/3] md:aspect-auto bg-zinc-200"
                >
                  <SmartImage
                    src={p4.imageUrl}
                    alt={p4.imageAlt}
                    ratio="auto"
                    category="reports"
                    className="!w-full !h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-3 text-white">
                    <h4 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                      {p4.title}
                    </h4>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Bottom row: two wide photos */}
        {wide.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {wide.map((p) => (
              <a
                key={p.id}
                href={p.href ?? "#"}
                className="block relative overflow-hidden rounded-xl group aspect-[16/7] bg-zinc-200"
              >
                <SmartImage
                  src={p.imageUrl}
                  alt={p.imageAlt}
                  ratio="auto"
                  category="reports"
                  className="!w-full !h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-4 text-white">
                  <h4 className="text-sm sm:text-base font-bold leading-snug group-hover:text-blue-300 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-300 mt-1">
                    {subtitle(p)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
