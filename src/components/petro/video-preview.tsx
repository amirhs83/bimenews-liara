"use client";

import { useEffect, useRef } from "react";

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
 * VideoPreview — muted autoplaying video that loops only a short segment
 * of the full video (YouTube-style preview), never the whole clip.
 */
export default function VideoPreview({
  src,
  start = 0,
  segment = 8,
  poster,
  className = "",
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // React quirk: make sure muted is set as a property too (autoplay policies)
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

    v.play().catch(() => {
      /* autoplay blocked — stays on poster */
    });

    return () => {
      v.removeEventListener("loadedmetadata", seekToStart);
      v.removeEventListener("timeupdate", clampToSegment);
      v.removeEventListener("ended", handleEnded);
    };
  }, [start, segment]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      autoPlay
      preload="metadata"
      disablePictureInPicture
      className={className}
    />
  );
}
