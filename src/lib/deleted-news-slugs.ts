// Slugs of news posts that were permanently deleted from the site.
// Google may still hold indexed copies; requests for these slugs are
// answered with HTTP 410 Gone (instead of 404) by src/middleware.ts,
// which tells crawlers to drop them from the index faster.
//
// To add a slug: copy it exactly as it appears in the old URL
//   e.g. for https://bimenews.com/news/بیمه-مرکزی-ابلاغ-کرد
//   add "بیمه-مرکزی-ابلاغ-کرد" to the array below.
export const deletedNewsSlugs = new Set<string>([]);
