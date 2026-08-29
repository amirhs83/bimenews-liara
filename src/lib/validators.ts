import { z } from "zod";

export const placementInputSchema = z.object({
  sectionKey: z.string().trim().min(1).max(50),
  position: z.number().int().min(1).max(99),
});

const optionalUrl = z
  .string()
  .trim()
  .refine((s) => s === "" || s.startsWith("/") || /^https?:\/\/.+/.test(s), {
    message: "آدرس نامعتبر است",
  })
  .optional()
  .nullable();

export const postInputSchema = z
  .object({
    kicker: z.string().trim().max(200).optional().nullable(),
    title: z.string().trim().min(1, "تیتر الزامی است").max(300),
    lead: z.string().trim().min(1, "لید الزامی است").max(1500),
    body: z.string().min(1, "بدنه خبر الزامی است"),
    slug: z.string().trim().max(220).optional().nullable(),
    hasOwnPage: z.boolean().default(true),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
    publishedAt: z
      .string()
      .refine((s) => !Number.isNaN(Date.parse(s)), "تاریخ انتشار نامعتبر است"),
    categoryId: z.string().min(1, "دسته‌بندی اصلی الزامی است"),
    categories: z
      .array(z.string().min(1))
      .max(20, "حداکثر ۲۰ دسته‌بندی")
      .default([]),
    tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
    homeImageId: z.string().min(1, "تصویر صفحه اصلی الزامی است"),
    homeImageAlt: z.string().trim().min(1, "متن جایگزین تصویر الزامی است").max(300),
    innerImageId: z.string().optional().nullable(),
    innerImageAlt: z.string().trim().max(300).default(""),
    videoType: z.enum(["NONE", "UPLOAD", "APARAT", "YOUTUBE"]).default("NONE"),
    videoUrl: optionalUrl,
    videoDuration: z.number().int().min(0).max(86400).optional().nullable(),
    metaTitle: z.string().trim().max(300).optional().nullable(),
    metaDescription: z.string().trim().max(500).optional().nullable(),
    metaKeywords: z.string().trim().max(500).optional().nullable(),
    ogImageId: z.string().optional().nullable(),
    canonicalUrl: optionalUrl,
    placements: z.array(placementInputSchema).max(30).default([]),
    // "strict": fail with 409 when a requested position is occupied
    // "force": evict occupants and take the positions
    placementsMode: z.enum(["strict", "force"]).default("strict"),
  })
  .superRefine((data, ctx) => {
    if (data.innerImageId && !data.innerImageAlt.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["innerImageAlt"],
        message: "متن جایگزین تصویر داخل خبر الزامی است",
      });
    }
    if (data.hasOwnPage === false && data.videoType === "NONE") {
      // posts without a page are usually listing-only items; allowed, no extra rule
    }
  });

export type PostInput = z.infer<typeof postInputSchema>;

export const sectionPlacementsSchema = z.object({
  placements: z
    .array(
      z.object({
        postId: z.string().min(1),
        position: z.number().int().min(1).max(99),
      })
    )
    .max(50),
});

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1, "نام برچسب الزامی است").max(60),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "نام دسته‌بندی الزامی است").max(100),
  slug: z.string().trim().max(120).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  slug: z.string().trim().max(120).optional(),
  order: z.number().int().min(0).max(999).optional(),
});
