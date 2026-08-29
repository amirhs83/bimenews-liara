import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { postInputSchema, type PostInput } from "@/lib/validators";

export function badRequest(error: string, issues?: unknown) {
  return NextResponse.json({ ok: false, error, issues }, { status: 400 });
}

/** Shared validation for post create/update. */
export async function validatePostPayload(
  req: Request
): Promise<
  { response: NextResponse; input?: never } | { input: PostInput; response?: never }
> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: badRequest("بدنه درخواست نامعتبر است") };
  }
  const parsed = postInputSchema.safeParse(body);
  if (!parsed.success) {
    return {
      response: badRequest(
        parsed.error.issues[0]?.message ?? "ورودی نامعتبر است",
        parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }))
      ),
    };
  }

  const input = parsed.data;

  // main category must exist
  const category = await db.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });
  if (!category) return { response: badRequest("دسته‌بندی اصلی نامعتبر است") };

  // additional categories must exist; main is always included in the set
  const categoryIds = [...new Set([input.categoryId, ...input.categories])];
  if (categoryIds.length > 1) {
    const found = await db.category.count({
      where: { id: { in: categoryIds } },
    });
    if (found !== categoryIds.length) {
      return { response: badRequest("یکی از دسته‌بندی‌های انتخاب‌شده نامعتبر است") };
    }
  }
  input.categories = categoryIds;

  const imageIds = [
    input.homeImageId,
    input.innerImageId,
    input.ogImageId,
  ].filter((x): x is string => Boolean(x));
  const uniqueImageIds = [...new Set(imageIds)];
  const mediaCount = await db.media.count({
    where: { id: { in: uniqueImageIds } },
  });
  if (mediaCount !== uniqueImageIds.length) {
    return { response: badRequest("رسانه انتخاب‌شده نامعتبر است") };
  }

  return { input };
}

/** Maps validated input to Prisma post data (without tags/placements). */
export function postDataFromInput(
  input: PostInput,
  slug: string,
  cleanBody: string,
  forUpdate = false
): Prisma.PostCreateInput {
  return {
    slug,
    kicker: input.kicker?.trim() || null,
    title: input.title,
    lead: input.lead,
    body: cleanBody,
    hasOwnPage: input.hasOwnPage,
    status: input.status,
    publishedAt: new Date(input.publishedAt),
    category: { connect: { id: input.categoryId } },
    homeImage: { connect: { id: input.homeImageId } },
    homeImageAlt: input.homeImageAlt,
    ...(input.innerImageId
      ? { innerImage: { connect: { id: input.innerImageId } } }
      : forUpdate
        ? { innerImage: { disconnect: true } }
        : {}),
    innerImageAlt: input.innerImageAlt,
    videoType: input.videoType,
    videoUrl: input.videoType === "NONE" ? null : input.videoUrl || null,
    videoDuration:
      input.videoType === "NONE" ? null : input.videoDuration ?? null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    metaKeywords: input.metaKeywords || null,
    ...(input.ogImageId
      ? { ogImage: { connect: { id: input.ogImageId } } }
      : forUpdate
        ? { ogImage: { disconnect: true } }
        : {}),
    canonicalUrl: input.canonicalUrl || null,
  };
}
