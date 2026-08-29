// Generate branded SVG placeholders for news categories
// These serve as reliable fallbacks when remote images fail

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "public", "placeholders");
mkdirSync(outDir, { recursive: true });

const palettes: Record<string, [string, string, string]> = {
  "insurance-market": ["#0f172a", "#1e3a8a", "#0ea5e9"],
  regulation: ["#0f172a", "#334155", "#64748b"],
  "insurance-lines": ["#14532d", "#15803d", "#22c55e"],
  insurtech: ["#1e1b4b", "#3730a3", "#6366f1"],
  world: ["#0c4a6e", "#0e7490", "#22d3ee"],
  magazine: ["#1c1917", "#44403c", "#a8a29e"],
  video: ["#000000", "#1f2937", "#3b82f6"],
};

const categories = [
  "insurance-market",
  "regulation",
  "insurance-lines",
  "insurtech",
  "world",
  "magazine",
  "video",
];

const labels: Record<string, string> = {
  "insurance-market": "بازار بیمه",
  regulation: "تنظیم‌گری",
  "insurance-lines": "رشته‌های بیمه",
  insurtech: "اینشورتک",
  world: "جهان بیمه",
  magazine: "ماهنامه",
  video: "ویدئو",
};

const latinLabels: Record<string, string> = {
  "insurance-market": "INSURANCE MARKET",
  regulation: "REGULATION",
  "insurance-lines": "INSURANCE LINES",
  insurtech: "INSURTECH",
  world: "WORLD",
  magazine: "MAGAZINE",
  video: "VIDEO",
};

function makeSVG(category: string, w = 800, h = 600): string {
  const [c1, c2, c3] = palettes[category];
  const label = labels[category];
  // gradient + geometric shapes + label
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c3}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="white" opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
  <!-- abstract geometric accents -->
  <circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.18}" fill="${c3}" opacity="0.15"/>
  <circle cx="${w * 0.15}" cy="${h * 0.85}" r="${Math.min(w, h) * 0.25}" fill="${c3}" opacity="0.08"/>
  <rect x="0" y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="url(#accent)" opacity="0.5"/>
  <!-- top-right accent line -->
  <rect x="${w - 80}" y="40" width="40" height="2" fill="${c3}"/>
  <rect x="${w - 80}" y="48" width="20" height="2" fill="${c3}" opacity="0.5"/>
  <!-- BimeNews watermark -->
  <text x="${w - 24}" y="${h - 24}" text-anchor="end" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="white" opacity="0.3">BimeNews</text>
  <!-- category label -->
  <text x="40" y="${h - 40}" font-family="Vazirmatn, sans-serif" font-size="36" font-weight="bold" fill="white">${label}</text>
  <text x="40" y="${h - 18}" font-family="sans-serif" font-size="12" letter-spacing="2" fill="white" opacity="0.6">${latinLabels[category]}</text>
</svg>`;
}

for (const cat of categories) {
  // Generate at multiple sizes
  writeFileSync(join(outDir, `${cat}-16x9.svg`), makeSVG(cat, 800, 450));
  writeFileSync(join(outDir, `${cat}-4x3.svg`), makeSVG(cat, 800, 600));
  writeFileSync(join(outDir, `${cat}-1x1.svg`), makeSVG(cat, 600, 600));
}

console.log(`Generated ${categories.length * 3} SVG placeholders in ${outDir}`);
