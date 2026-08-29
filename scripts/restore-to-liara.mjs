#!/usr/bin/env node
// Restore BimeNews production JSON backup to a new Liara Postgres DB
// Usage: DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/restore-to-liara.mjs [backup.json]
// Default backup: db/backups/bimenews_production_latest.json

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const backupPath = process.argv[2] || "db/backups/bimenews_production_latest.json";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL env is required (Liara DB URL)");
  process.exit(1);
}
console.log(`Backup file: ${backupPath}`);
console.log(`Target DB: ${url.replace(/:[^:@]+@/, ":****@").slice(0,80)}...`);

const raw = readFileSync(backupPath, "utf8");
const data = JSON.parse(raw);
console.log(`Backup meta: ${data.meta?.createdAt} | ${data.meta?.source}`);
console.log(`Counts: AdminUser=${data.adminUsers.length} Category=${data.categories.length} Tag=${data.tags.length} Media=${data.media.length} Post=${data.posts.length}`);

const db = new PrismaClient();
async function restore() {
  console.log("\nPushing schema (prisma db push) should be done before this script.");
  // Insert in FK-safe order, skip existing
  const order = [
    ["AdminUser", data.adminUsers],
    ["Category", data.categories],
    ["Tag", data.tags],
    ["Media", data.media],
    ["HomeSection", data.homeSections],
    ["Post", data.posts],
    ["PostTag", data.postTags],
    ["PostCategory", data.postCategories],
    ["SectionPlacement", data.sectionPlacements],
  ];
  for (const [model, rows] of order) {
    if (!rows?.length) { console.log(` - ${model}: 0 rows, skip`); continue; }
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        // Convert date strings back to Date for Prisma
        for (const k of ["createdAt","updatedAt","publishedAt"]) if (row[k]) row[k] = new Date(row[k]);
        await db[model.charAt(0).toLowerCase() + model.slice(1)].create({ data: row });
        ok++;
      } catch (e) {
        if (e.code === "P2002") ok++; // unique conflict = already exists, treat as ok
        else { fail++; if (fail < 5) console.warn(`  ${model} fail:`, e.message?.slice(0,120)); }
      }
    }
    console.log(` - ${model}: ${ok} inserted, ${fail} failed`);
  }
  await db.$disconnect();
  console.log("\nRestore done. Verify: npx prisma studio or check site.");
}
restore().catch(e => { console.error(e); process.exit(1); });
