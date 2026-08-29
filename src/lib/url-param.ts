/**
 * Repair URL params that arrive mis-decoded.
 * In some dev setups (Turbopack) page params for non-ASCII paths can arrive
 * still percent-encoded or latin1-mojibake; route handlers decode correctly.
 * Safe no-op for properly decoded values (incl. Persian text).
 */
export function decodeParam(value: string): string {
  let v = value;
  if (v.includes("%")) {
    try {
      v = decodeURIComponent(v);
    } catch {
      // keep as-is
    }
  }
  // latin1-mojibake repair: UTF-8 bytes shown as Latin-1 (e.g. "Ø§Ø¬...")
  if (/[\u0080-\u00ff]/.test(v)) {
    try {
      const repaired = Buffer.from(v, "latin1").toString("utf8");
      if (!repaired.includes("\uFFFD")) v = repaired;
    } catch {
      // keep as-is
    }
  }
  return v;
}
