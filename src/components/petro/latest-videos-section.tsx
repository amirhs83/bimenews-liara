import { ArrowLeft, Clock, Eye, VolumeX, Play } from "lucide-react";
import VideoPreview from "./video-preview";
import SmartImage from "./smart-image";
import type { HomePost } from "@/lib/home-data";

function VideoVisual({ post, segment }: { post: HomePost; segment: number }) {
  if (post.isUploadedVideo && post.videoUrl) {
    return (
      <VideoPreview
        src={post.videoUrl}
        start={4}
        segment={segment}
        poster={post.imageUrl}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return (
    <SmartImage
      src={post.imageUrl}
      alt={post.imageAlt}
      ratio="auto"
      category={post.categoryKey}
      className="!w-full !h-full absolute inset-0"
    />
  );
}

export default function LatestVideosSection({ videos }: { videos: HomePost[] }) {
  if (videos.length === 0) return null;
  const [featured, ...rest] = videos;

  return (
    <section className="relative bg-petro-black text-white border-y border-zinc-800 overflow-hidden">
      {/* Decorative background — multiple glow sources */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-petro-black to-zinc-950 pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-900/25 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-6 py-8 sm:py-12">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 border-b border-zinc-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-8 sm:h-12 bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-none bg-gradient-to-l from-white to-zinc-400 bg-clip-text text-transparent">
                ویدئو
              </h2>
              <span className="text-[10px] sm:text-xs mt-1 sm:mt-1.5 block flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-red-400">
                  <span className="live-dot"></span>
                  پخش زنده
                </span>
              </span>
            </div>
          </div>
          <a
            href="/category/video"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-900/60 backdrop-blur-sm hover:bg-zinc-800 border border-zinc-800 hover:border-blue-700/50 rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all"
          >
            <span className="hidden sm:inline">همه ویدئوها</span>
            <span className="sm:hidden">همه</span>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Featured video (large, right) — muted autoplaying preview segment */}
          <div className="lg:col-span-7">
            <a
              href={featured.href ?? "#"}
              className="block relative overflow-hidden rounded-2xl bg-zinc-900 aspect-video group ring-1 ring-zinc-800 hover:ring-blue-600/50 transition-all shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_80px_-10px_rgba(59,130,246,0.5)]"
            >
              <VideoVisual post={featured} segment={10} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>

              {/* Top accent line on hover */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>

              {/* Muted preview badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full">
                {featured.isUploadedVideo ? (
                  <>
                    <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    پیش‌نمایش بدون صدا
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ویدئو
                  </>
                )}
              </div>

              <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-6">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-[11px] text-zinc-300 flex-wrap">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 font-bold rounded text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    جدیدترین
                  </span>
                  {featured.videoDuration && (
                    <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {featured.videoDuration}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    <Eye className="w-3 h-3" />
                    {featured.views}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 sm:mt-2 tabular-nums">
                  {featured.date} - {featured.time}
                </p>
              </div>
            </a>
          </div>

          {/* Video list (left) — each thumbnail plays a muted preview segment */}
          <div className="lg:col-span-5">
            <div className="space-y-2 sm:space-y-3">
              {rest.map((video) => (
                <a
                  key={video.id}
                  href={video.href ?? "#"}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/60 hover:border-blue-700/40 transition-all group"
                >
                  <div className="flex-1 min-w-0 text-right">
                    <h4 className="font-semibold text-[13px] sm:text-sm text-zinc-100 group-hover:text-blue-300 transition-colors line-clamp-2 leading-relaxed mb-1.5 sm:mb-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-500">
                      {video.videoDuration && (
                        <span className="inline-flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" />
                          {video.videoDuration}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" />
                        {video.views}
                      </span>
                      <span className="tabular-nums text-[9px] sm:text-[10px] hidden sm:inline">
                        {video.date}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800 group-hover:ring-blue-600/50 transition-all">
                    <VideoVisual post={video} segment={6} />
                    <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm text-white p-0.5 rounded">
                      {video.isUploadedVideo ? (
                        <VolumeX className="w-2.5 h-2.5" />
                      ) : (
                        <Play className="w-2.5 h-2.5" />
                      )}
                    </div>
                    {video.videoDuration && (
                      <div className="absolute bottom-1 left-1 bg-black/80 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                        {video.videoDuration}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
