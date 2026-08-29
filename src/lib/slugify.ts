/** Persian-friendly slug: keeps Persian letters, converts ZWNJ and separators to dashes.
 *  Pure function — safe to import from client components. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200d]/g, "-") // ZWNJ / ZWJ
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}
