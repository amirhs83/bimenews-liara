// Migrates local-disk media (storage/uploads) to Vercel Blob and updates
// the Media records in the PRODUCTION database.
//
// Usage (PowerShell):
//   $env:DATABASE_URL="postgresql://...cloud..."; $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."; npx tsx scripts/migrate-media-to-blob.ts

import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
const prisma = new PrismaClient();

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is required");
  const masked = (process.env.DATABASE_URL ?? "").replace(/:[^:@]+@/, ":***@");
  console.log("DATABASE_URL points to:", masked);
  if (process.env.DATABASE_URL?.includes("localhost")) {
    console.warn("WARNING: DATABASE_URL is localhost — set it to the PRODUCTION database before migrating!");
  }

  const items = await prisma.media.findMany({ where: { provider: "local" } });
  console.log(`${items.length} local media file(s) to migrate`);

  let migrated = 0;
  for (const m of items) {
    const filePath = path.join(UPLOAD_DIR, m.key);
    try {
      const data = await fs.readFile(filePath);
      const blob = await put(m.key, data, {
        access: "public",
        contentType: m.mimeType,
        token,
        addRandomSuffix: false,
      });
      await prisma.media.update({
        where: { id: m.id },
        data: { url: blob.url, provider: "blob" },
      });
      migrated++;
      console.log(`OK  ${m.key} -> ${blob.url}`);
    } catch (e) {
      console.error(`SKIP ${m.key}: ${e instanceof Error ? e.message : e}`);
    }
  }
  console.log(`done — ${migrated}/${items.length} migrated`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
