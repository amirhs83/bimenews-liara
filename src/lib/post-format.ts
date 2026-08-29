// Display formatting helpers for posts on the public site (server-side).

export function faDigits(s: string | number): string {
  return String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export function faDate(d: Date): string {
  return d.toLocaleDateString("fa-IR");
}

export function faTime(d: Date): string {
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

export function faDateLong(d: Date): string {
  return d.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function faViews(n: number): string {
  return n.toLocaleString("fa-IR");
}

/** seconds -> "m:ss" in Persian digits */
export function faDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return faDigits(`${m}:${String(s).padStart(2, "0")}`);
}
