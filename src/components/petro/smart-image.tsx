"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

type Ratio = "16x9" | "4x3" | "1x1" | "auto";

interface SmartImageProps {
  src?: string;
  alt: string;
  ratio?: Ratio;
  category?: string;
  className?: string;
  priority?: boolean;
  eager?: boolean; // force eager loading even if not priority
  sizes?: string;
}

const ratioClasses: Record<Ratio, string> = {
  "16x9": "aspect-[16/9]",
  "4x3": "aspect-[4/3]",
  "1x1": "aspect-square",
  auto: "",
};

const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 680px";

/**
 * SmartImage - resilient image with multi-tier fallback (next/image optimized)
 * 1. Try the provided src (remote)
 * 2. Fall back to picsum.photos with a category-specific seed (always works)
 * 3. Final fallback to local branded SVG placeholder
 */
function ImageWithFallback({
  src,
  alt,
  priority,
  eager,
  sizes,
  picsumUrl,
  svgFallback,
  onLoad,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  eager?: boolean;
  sizes: string;
  picsumUrl: string;
  svgFallback: string;
  onLoad: () => void;
}) {
  const [stage, setStage] = useState(0);
  const currentSrc = stage === 0 ? src : stage === 1 ? picsumUrl : svgFallback;

  const handleError = () => {
    setStage((s) => Math.min(s + 1, 2));
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority || eager}
      onLoad={onLoad}
      onError={handleError}
      className="w-full h-full object-contain transition-transform duration-300"
    />
  );
}

export default function SmartImage({
  src,
  alt,
  ratio = "16x9",
  category = "oil",
  className = "",
  priority = false,
  eager = false,
  sizes = DEFAULT_SIZES,
}: SmartImageProps) {
  const seed = useMemo(
    () => `${category}-${(alt || "").length}-${(src || "").length}`,
    [category, alt, src]
  );
  const picsumUrl = useMemo(
    () => `https://picsum.photos/seed/${seed}/800/450`,
    [seed]
  );
  const svgFallback = `/placeholders/${category}-16x9.svg`;
  const initialSrc = src || picsumUrl;

  const [loaded, setLoaded] = useState(priority);

  // Use src as key so the inner component remounts when src changes
  return (
    <div
      className={`relative overflow-hidden bg-zinc-100 ${ratioClasses[ratio]} ${className}`}
    >
      {!loaded && !priority && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 animate-pulse" />
      )}
      <div
        className={`w-full h-full transition-opacity duration-300 ${
          loaded || priority ? "opacity-100" : "opacity-0"
        }`}
      >
        <ImageWithFallback
          key={initialSrc}
          src={initialSrc}
          alt={alt}
          priority={priority}
          eager={eager}
          sizes={sizes}
          picsumUrl={picsumUrl}
          svgFallback={svgFallback}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
