# BimeNews DB Backups

## 2026-08-28
- `bimenews_local_2026-08-28_16-03.dump` — لوکال petrotimes_dev (pg_dump custom, PG16, 38KB)
- `bimenews_production_2026-08-28_15-12.json` — پروداکشن Neon (Prisma JSON, 42 posts, 120 media, 158KB)
- `bimenews_production_2026-08-28_15-12.sql` — پروداکشن Neon (SQL INSERTs, 151KB)
- `bimenews_production_latest.*` — symlink کپی از آخرین بکاپ

## Restore روی Liara (دیتابیس جدید)
1. متغیر `DATABASE_URL` لیارا را ست کن (پنل لیارا -> دیتابیس -> Connection String)
2. شمای دیتابیس را بساز:
   ```
   DATABASE_URL="..." npx prisma db push --accept-data-loss
   # یا
   DATABASE_URL="..." npx prisma migrate deploy
   ```
3. دیتای بکاپ را بریز:
   ```
   DATABASE_URL="..." node scripts/restore-to-liara.mjs
   # یا مستقیم SQL:
   psql "$DATABASE_URL" < db/backups/bimenews_production_latest.sql
   ```
4. فایل‌های استوریج لوکال (اگر از local provider استفاده میکنی):
   ```
   storage/uploads/*  (6 فایل) -> باید روی دیسک لیارا کپی شود یا به Liara Object Storage منتقل شود
   ```
   اگر از Vercel Blob استفاده میکنی، نیازی به کپی نیست (URLها absolute هستند).

## نکته
- بکاپ پروداکشن Neon با pg_dump 16 به‌خاطر mismatch نسخه PG18 انجام نشد؛ به‌جاش Prisma JSON/SQL logical dump گرفته شد که برای لیارا (PG16/17) سازگار است.
- برای بکاپ بعدی از Neon: یا pg_dump 18 را نصب کن یا همین اسکریپت `.zscripts/backup-prod.mjs` را اجرا کن.
