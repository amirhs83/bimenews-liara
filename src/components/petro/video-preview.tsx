"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface VideoPreviewProps {
  src: string;
  /** segment start in seconds */
  start?: number;
  /** segment length in seconds (only this part plays, like YouTube hover preview) */
  segment?: number;
  poster?: string;
  className?: string;
}

/**
 * VideoPreview — optimized muted autoplaying video that loops only a short segment
 * of the full video. Defer-loads media stream to protect LCP / Initial Load bandwidth.
 */
export default function VideoPreview({
  src,
  start = 0,
  segment = 8,
  poster,
  className = "",
}: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Defer video loading until element is near viewport and after initial render
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Slight deferral to let critical LCP images and text paint first
            timer = setTimeout(() => {
              setShouldLoad(true);
            }, 600);
          } else {
            if (timer) clearTimeout(timer);
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        });
      },
      { rootMargin: "50px" }
    );

    observer.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Video looping and segment playback logic
  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;

    const seekToStart = () => {
      if (v.duration && start < v.duration) {
        v.currentTime = start;
      }
    };
    const clampToSegment = () => {
      if (start < v.duration && v.currentTime >= start + segment) {
        v.currentTime = start;
      }
    };
    const handleEnded = () => {
      v.currentTime = start < v.duration ? start : 0;
      v.play().catch(() => {});
    };

    v.addEventListener("loadedmetadata", seekToStart);
    v.addEventListener("timeupdate", clampToSegment);
    v.addEventListener("ended", handleEnded);

    v.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        /* autoplay blocked or delayed */
      });

    return () => {
      v.removeEventListener("loadedmetadata", seekToStart);
      v.removeEventListener("timeupdate", clampToSegment);
      v.removeEventListener("ended", handleEnded);
    };
  }, [shouldLoad, start, segment]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShouldLoad(true)}
      onTouchStart={() => setShouldLoad(true)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Optimized poster image via next/image */}
      {poster && (
        <Image
          src={poster}
          alt="پیش‌نمایش ویدیو"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 680px"
          quality={80}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
          style={{ opacity: isPlaying ? 0 : 1 }}
        />
      )}

      {/* Video element - only buffers when in viewport / hovered */}
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          onPlaying={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
          style={{ opacity: isPlaying ? 1 : 0 }}
        />
      )}
    </div>
  );
}
