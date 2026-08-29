// Storage abstraction layer.
//
// Priority:
// 1. Parspack S3 (if PARSPACK_* env set) -> https://c267562.parspack.net/<bucket>/<key>
// 2. Vercel Blob (if BLOB_READ_WRITE_TOKEN set)
// 3. Local (fallback) -> storage/uploads + /api/media/<key>

import path from "path";
import fs from "fs/promises";

export type StorageProvider = "local" | "blob" | "s3";

export interface StoredFile {
  key: string;
  url: string;
  provider: StorageProvider;
}

function getParspackConfig() {
  const endpoint = process.env.PARSPACK_ENDPOINT;
  const accessKey = process.env.PARSPACK_ACCESS_KEY;
  const secretKey = process.env.PARSPACK_SECRET_KEY;
  const bucket = process.env.PARSPACK_BUCKET;
  if (endpoint && accessKey && secretKey && bucket) {
    return { endpoint, accessKey, secretKey, bucket };
  }
  return null;
}

export function getStorageProvider(): StorageProvider {
  if (getParspackConfig()) return "s3";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export function localFilePath(key: string): string {
  return path.join(LOCAL_UPLOAD_DIR, key);
}

function normalizeEndpoint(ep: string): string {
  let e = ep.trim();
  if (!e.startsWith("http://") && !e.startsWith("https://")) e = `https://${e}`;
  return e.replace(/\/+$/, "");
}

async function getS3Client() {
  const cfg = getParspackConfig();
  if (!cfg) throw new Error("Parspack config missing");
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: process.env.PARSPACK_REGION || "us-east-1",
    endpoint: normalizeEndpoint(cfg.endpoint),
    credentials: {
      accessKeyId: cfg.accessKey,
      secretAccessKey: cfg.secretKey,
    },
    forcePathStyle: true,
  });
}

export async function uploadToStorage(
  key: string,
  data: Buffer,
  contentType: string
): Promise<StoredFile> {
  const provider = getStorageProvider();

  if (provider === "s3") {
    const cfg = getParspackConfig()!;
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );
    const base = normalizeEndpoint(cfg.endpoint);
    // Parspack endpoint is per-bucket (https://c267562.parspack.net), so object URL is base + "/" + key
    const url = `${base}/${key}`;
    return { key, url, provider };
  }

  if (provider === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, data, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return { key, url: blob.url, provider };
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(localFilePath(key), data);
  return { key, url: `/api/media/${key}`, provider };
}

export async function deleteFromStorage(
  key: string,
  provider: string,
  url: string
): Promise<void> {
  if (provider === "s3") {
    const cfg = getParspackConfig();
    if (!cfg) return;
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client();
    await client
      .send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }))
      .catch(() => {});
    return;
  }
  if (provider === "blob") {
    const { del } = await import("@vercel/blob");
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }
  await fs.unlink(localFilePath(key)).catch(() => {
    // already gone — nothing to do
  });
}
