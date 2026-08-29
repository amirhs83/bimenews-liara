import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { slugify } from "./slugify";

export { slugify };

/** Ensures uniqueness by appending -2, -3, ... when needed. */
export async function uniqueSlug(
  base: string,
  excludePostId?: string
): Promise<string> {
  const root = slugify(base) || "post";
  let candidate = root;
  for (let i = 2; ; i++) {
    const existing = await db.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludePostId) return candidate;
    candidate = `${root}-${i}`;
  }
}

/** Unique slug for tags (works inside transactions too). */
export async function uniqueTagSlug(
  tx: Prisma.TransactionClient,
  name: string
): Promise<string> {
  const root = slugify(name) || "tag";
  let candidate = root;
  for (let i = 2; ; i++) {
    const existing = await tx.tag.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${i}`;
  }
}

/** Unique slug for categories. */
export async function uniqueCategorySlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const root = slugify(base) || "category";
  let candidate = root;
  for (let i = 2; ; i++) {
    const existing = await db.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
}
