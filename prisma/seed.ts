import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma CLI loads .env; also load .env.local for ADMIN_* vars (does not override existing)
try {
  (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile?.(
    ".env.local"
  );
} catch {
  // .env.local is optional
}

const prisma = new PrismaClient();

const categories = [
  { name: "بازار بیمه", slug: "insurance-market", order: 1 },
  { name: "تنظیم‌گری", slug: "regulation", order: 2 },
  { name: "رشته‌های بیمه", slug: "insurance-lines", order: 3 },
  { name: "اینشورتک", slug: "insurtech", order: 4 },
  { name: "جهان بیمه", slug: "world", order: 5 },
  { name: "آرشیو ماهنامه", slug: "magazine", order: 6 },
  { name: "ویدئو", slug: "video", order: 7 },
];

const homeSections = [
  { key: "breaking", name: "اخبار فوری", capacity: 5 },
  { key: "hero", name: "خبر ویژه (هیرو)", capacity: 3 },
  { key: "videos", name: "ویدئو", capacity: 5 },
  { key: "energy", name: "تنظیم‌گری", capacity: 4 },
  { key: "economy", name: "بازار بیمه", capacity: 6 },
  { key: "magazine", name: "ماهنامه", capacity: 5 },
  { key: "gallery", name: "عکس و فیلم", capacity: 7 },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
  }
  console.log(`Categories: ${categories.length} upserted`);

  for (const s of homeSections) {
    await prisma.homeSection.upsert({
      where: { key: s.key },
      update: { name: s.name, capacity: s.capacity },
      create: s,
    });
  }
  console.log(`Home sections: ${homeSections.length} upserted`);

  const email = process.env.ADMIN_EMAIL || "admin@bimenews.ir";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD env var is required to seed the initial admin user"
    );
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "مدیر سایت" },
  });
  console.log(`Admin user: ${email} upserted`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
