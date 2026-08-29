// Demo content seed — mirrors the original hardcoded homepage so the site
// looks identical, but everything is served from the database.
// Safe to re-run: it wipes demo posts/placements and recreates them.
// Run: npx tsx prisma/seed-demo.ts

import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slugify";

const prisma = new PrismaClient();
const usedSlugs = new Set<string>();

function uniqSlug(title: string): string {
  const root = slugify(title) || "post";
  let candidate = root;
  for (let i = 2; usedSlugs.has(candidate); i++) candidate = `${root}-${i}`;
  usedSlugs.add(candidate);
  return candidate;
}

async function extImage(url: string, alt: string): Promise<string> {
  const existing = await prisma.media.findFirst({ where: { key: url } });
  if (existing) return existing.id;
  const m = await prisma.media.create({
    data: {
      key: url,
      url,
      provider: "external",
      kind: "image",
      mimeType: "image/jpeg",
      size: 0,
      alt,
    },
  });
  return m.id;
}

interface DemoPost {
  title: string;
  lead: string;
  categorySlug: string;
  image: string;
  kicker?: string;
  videoUrl?: string;
  videoDuration?: number;
  views?: number;
  publishedAt: Date;
  placement?: { section: string; position: number };
}

async function makePost(p: DemoPost, catMap: Map<string, string>) {
  const categoryId = catMap.get(p.categorySlug);
  if (!categoryId) throw new Error(`category not found: ${p.categorySlug}`);
  const imageId = await extImage(p.image, p.title);
  const post = await prisma.post.create({
    data: {
      slug: uniqSlug(p.title),
      kicker: p.kicker ?? null,
      title: p.title,
      lead: p.lead,
      body: `<p>${p.lead}</p><p>گزارش کامل این خبر را در ادامه می‌خوانید. این متن برای نمایش نمونه‌ای بدنه خبر در نسخه آزمایشی تولید شده است و توسط تحریریه بیمه نیوز جایگزین خواهد شد.</p>`,
      status: "PUBLISHED",
      publishedAt: p.publishedAt,
      hasOwnPage: true,
      views: p.views ?? 0,
      categoryId,
      homeImageId: imageId,
      homeImageAlt: p.title,
      videoType: p.videoUrl ? "UPLOAD" : "NONE",
      videoUrl: p.videoUrl ?? null,
      videoDuration: p.videoDuration ?? null,
      metaTitle: p.title,
      metaDescription: p.lead,
    },
  });
  if (p.placement) {
    const section = await prisma.homeSection.findUnique({
      where: { key: p.placement.section },
    });
    if (section) {
      await prisma.sectionPlacement.create({
        data: {
          sectionId: section.id,
          postId: post.id,
          position: p.placement.position,
        },
      });
    }
  }
  return post;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const daysAgo = (d: number) => hoursAgo(d * 24);

async function main() {
  // wipe existing demo content (posts + their relations; media library is kept)
  await prisma.sectionPlacement.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  console.log("cleared old posts");

  const cats = await prisma.category.findMany();
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));

  const posts: DemoPost[] = [
    // ---------- اخبار فوری ----------
    {
      title: "بیمه مرکزی: آیین‌نامه جدید نرخ‌گذاری بیمه شخص ثالث ابلاغ شد",
      lead: "آیین‌نامه جدید بر مبنای ریسک راننده و سابقه خسارت تدوین شده است",
      categorySlug: "regulation",
      image: "/images/news/third-party-rule.jpg",
      publishedAt: hoursAgo(1),
      placement: { section: "breaking", position: 1 },
    },
    {
      title: "افزایش ۲۰ درصدی حق بیمه‌های عمر در نیمه نخست امسال",
      lead: "صنعت بیمه رشد چشمگیر فروش بیمه‌های زندگی را ثبت کرد",
      categorySlug: "insurance-market",
      image: "/images/news/life-insurance-growth.jpg",
      publishedAt: hoursAgo(2),
      placement: { section: "breaking", position: 2 },
    },
    {
      title: "استارتاپ اینشورتک ایرانی موفق به جذب سرمایه ۵۰ میلیارد تومانی شد",
      lead: "این سرمایه‌گذاری برای توسعه پلتفرم فروش آنلاین بیمه‌نامه انجام شد",
      categorySlug: "insurtech",
      image: "/images/news/insurtech-funding.jpg",
      publishedAt: hoursAgo(3),
      placement: { section: "breaking", position: 3 },
    },
    // ---------- هیرو ----------
    {
      title: "بیمه مرکزی: سهم صنعت بیمه از تولید ناخالص داخلی باید به ۵ درصد برسد",
      lead: "رئیس کل بیمه مرکزی در نشست هم‌اندیشی مدیران صنعت بیمه از تدوین سند توسعه صنعت بیمه خبر داد و گفت: بر اساس این سند، ضریب نفوذ بیمه و سهم صنعت از تولید ناخالص داخلی تا پایان برنامه هفتم به ۵ درصد می‌رسد.",
      categorySlug: "regulation",
      image: "/images/news/central-insurance-iran.jpg",
      views: 18234,
      publishedAt: hoursAgo(0.5),
      placement: { section: "hero", position: 1 },
    },
    // ---------- ویدئو ----------
    {
      title: "گفت‌وگوی اختصاصی با رئیس کل بیمه مرکزی درباره سند توسعه صنعت بیمه",
      lead: "تشریح اهداف سند توسعه و نقشه راه صنعت بیمه تا پایان برنامه هفتم",
      categorySlug: "video",
      image: "/images/news/cii-interview.jpg",
      views: 12453,
      publishedAt: daysAgo(1),
      placement: { section: "videos", position: 1 },
    },
    {
      title: "بررسی تغییرات جدید بیمه شخص ثالث در گفت‌وگو با کارشناسان",
      lead: "تحلیل آیین‌نامه نرخ‌گذاری ریسک‌محور و اثر آن بر حق بیمه رانندگان",
      categorySlug: "video",
      image: "/images/news/third-party-talk.jpg",
      views: 8920,
      publishedAt: daysAgo(2),
      placement: { section: "videos", position: 2 },
    },
    {
      title: "اینشورتک چیست و چگونه صنعت بیمه را دگرگون می‌کند؟",
      lead: "مروری بر فناوری‌های نوین بیمه‌ای و تجربه استارتاپ‌های ایرانی",
      categorySlug: "video",
      image: "/images/news/insurtech-explainer.jpg",
      views: 15231,
      publishedAt: daysAgo(3),
      placement: { section: "videos", position: 3 },
    },
    {
      title: "گزارش تصویری از همایش سالانه صنعت بیمه تهران",
      lead: "حضور مدیران شرکت‌های بیمه و کارشناسان بین‌المللی در همایش امسال",
      categorySlug: "video",
      image: "/images/news/insurance-conference.jpg",
      views: 6789,
      publishedAt: daysAgo(4),
      placement: { section: "videos", position: 4 },
    },
    {
      title: "مستند کوتاه: تاریخچه صنعت بیمه در ایران",
      lead: "روایت شکل‌گیری صنعت بیمه ایران از آغاز تا امروز",
      categorySlug: "video",
      image: "/images/news/insurance-history-doc.jpg",
      views: 23567,
      publishedAt: daysAgo(5),
      placement: { section: "videos", position: 5 },
    },
    // ---------- تنظیم‌گری ----------
    {
      title: "آیین‌نامه اجرایی قانون تأمین مالی صنعت بیمه اصلاح شد",
      lead: "اصلاحیه جدید الزام‌های توانگری مالی شرکت‌های بیمه را به‌روزرسانی می‌کند",
      categorySlug: "regulation",
      image: "/images/news/reg-1.jpg",
      publishedAt: daysAgo(1.2),
      placement: { section: "energy", position: 1 },
    },
    {
      title: "بیمه مرکزی دستورالعمل نظارت بر نمایندگان بیمه را بازنگری کرد",
      lead: "نمایندگان بیمه ملزم به ثبت‌نام در سامانه جدید رتبه‌بندی شدند",
      categorySlug: "regulation",
      image: "/images/news/reg-2.jpg",
      publishedAt: daysAgo(1.5),
      placement: { section: "energy", position: 2 },
    },
    {
      title: "شیوه‌نامه جدید ارزیابی خسارت بیمه‌نامه‌های آتش‌سوزی ابلاغ شد",
      lead: "ارزیابان خسارت باید آزمون صلاحیت حرفه‌ای بیمه مرکزی را بگذرانند",
      categorySlug: "regulation",
      image: "/images/news/reg-3.jpg",
      publishedAt: daysAgo(2.2),
      placement: { section: "energy", position: 3 },
    },
    {
      title: "شورای عالی بیمه مصوبه توسعه بیمه‌های زلزله را تصویب کرد",
      lead: "پوشش بیمه زلزله برای واحدهای مسکونی شهرهای بزرگ گسترش می‌یابد",
      categorySlug: "regulation",
      image: "/images/news/reg-4.jpg",
      publishedAt: daysAgo(2.8),
      placement: { section: "energy", position: 4 },
    },
    // ---------- بازار بیمه ----------
    {
      title: "رئیس کل بیمه مرکزی: صدور بیمه‌نامه‌های جدید مسئولیت مدنی در دستور کار قرار گرفت",
      lead: "رئیس کل بیمه مرکزی در حاشیه نشست شورای هماهنگی صنعت بیمه از نهایی شدن دستورالعمل بیمه‌های مسئولیت جدید خبر داد.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-1.jpg",
      publishedAt: hoursAgo(4),
      placement: { section: "economy", position: 1 },
    },
    {
      title: "سهم بیمه‌های شخص ثالث از پرتفوی صنعت بیمه به ۳۵ درصد رسید",
      lead: "آمار تازه بیمه مرکزی نشان می‌دهد بیمه‌های اجباری خودرو همچنان بزرگ‌ترین رشته صنعت بیمه است.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-2.jpg",
      publishedAt: hoursAgo(6),
      placement: { section: "economy", position: 2 },
    },
    {
      title: "افزایش ۱۸ درصدی حق بیمه‌های تولیدی صنعت در نیمه اول امسال نسبت به مدت مشابه سال قبل",
      lead: "گزارش جدید بیمه مرکزی نشان می‌دهد حق بیمه تولیدی صنعت در شش ماه نخست امسال از ۱۱۰ هزار میلیارد تومان گذشت.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-3.jpg",
      publishedAt: daysAgo(1.1),
      placement: { section: "economy", position: 3 },
    },
    {
      title: "بورس بیمه‌ها سبزپوش شد؛ نمادهای بیمه‌ای در صدر برترین‌های بازار",
      lead: "گروه بیمه‌ای بورس امروز با افزایش تقاضا روبه‌رو شد و بیشتر نمادهای بیمه‌ای صف خرید ثبت کردند.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-4.jpg",
      publishedAt: daysAgo(1.3),
      placement: { section: "economy", position: 4 },
    },
    {
      title: "سندیکای بیمه‌گران: نرخ‌گذاری ریسک‌محور از ابتدای سال آینده اجرایی می‌شود",
      lead: "دبیرکل سندیکای بیمه‌گران ایران از آماده شدن زیرساخت‌های نرخ‌گذاری ریسک‌محور در رشته‌های اصلی خبر داد.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-5.jpg",
      publishedAt: daysAgo(2.1),
      placement: { section: "economy", position: 5 },
    },
    {
      title: "افزایش سرمایه یک شرکت بیمه بزرگ با مصوبه مجمع عمومی تصویب شد",
      lead: "مجمع عمومی عادی سالانه افزایش سرمایه این شرکت بیمه را به میزان ۲ هزار میلیارد تومان از محل سود انباشته تصویب کرد.",
      categorySlug: "insurance-market",
      image: "/images/news/mkt-6.jpg",
      publishedAt: daysAgo(3.1),
      placement: { section: "economy", position: 6 },
    },
    // ---------- ماهنامه ----------
    {
      title: "آیا بیمه‌های خرد آینده صنعت بیمه ایران هستند؟",
      lead: "تحلیل نقش بیمه‌های خرد در گسترش ضریب نفوذ بیمه میان اقشار کم‌درآمد",
      categorySlug: "magazine",
      image: "/images/news/mag-1.jpg",
      publishedAt: daysAgo(1.6),
      placement: { section: "magazine", position: 1 },
    },
    {
      title: "نبرد پلتفرم‌ها بر سر بیمه‌نامه آنلاین",
      lead: "آیا پلتفرم‌های اینشورتک می‌توانند جای نماینده سنتی بیمه را بگیرند؟",
      categorySlug: "magazine",
      image: "/images/news/mag-2.jpg",
      publishedAt: daysAgo(1.7),
      placement: { section: "magazine", position: 2 },
    },
    {
      title: "رئیس‌جمهور بیمه‌گران",
      lead: "او مدعی شد می‌تواند بازار بیمه را یک‌پارچه کند؛ اما حقیقت پیچیده‌تر بود",
      categorySlug: "magazine",
      image: "/images/news/mag-3.jpg",
      publishedAt: daysAgo(1.8),
      placement: { section: "magazine", position: 3 },
    },
    {
      title: "دلایلی برای خوش‌بینی به بیمه عمر",
      lead: "نسل جدیدی از بیمه‌نامه‌های زندگی که ایرانیان را به پس‌انداز تشویق می‌کند",
      categorySlug: "magazine",
      image: "/images/news/mag-4.jpg",
      publishedAt: daysAgo(1.9),
      placement: { section: "magazine", position: 4 },
    },
    {
      title: "خسارتِ اجباری",
      lead: "شرکت‌های بیمه میان تورم و تعهدات بلندمدت گرفتار آمده‌اند",
      categorySlug: "magazine",
      image: "/images/news/mag-5.jpg",
      publishedAt: daysAgo(2.0),
      placement: { section: "magazine", position: 5 },
    },
    // ---------- عکس و فیلم ----------
    {
      title: "همایش بین‌المللی بیمه و بازار سرمایه",
      lead: "گزارش تصویری از گردهمایی مدیران صنعت بیمه در تهران",
      categorySlug: "world",
      image: "/images/news/insurance-summit.jpg",
      kicker: "هتل اسپیناس، تهران",
      publishedAt: daysAgo(2.5),
      placement: { section: "gallery", position: 1 },
    },
    {
      title: "مراسم امضای تفاهم‌نامه اتکایی میان شرکت‌های بیمه",
      lead: "گزارش تصویری",
      categorySlug: "world",
      image: "/images/news/reinsurance-signing.jpg",
      publishedAt: daysAgo(2.6),
      placement: { section: "gallery", position: 2 },
    },
    {
      title: "کارگاه آموزشی ارزیابی خسارت بیمه‌نامه‌ها",
      lead: "گزارش تصویری",
      categorySlug: "insurance-lines",
      image: "/images/news/claims-workshop.jpg",
      publishedAt: daysAgo(2.7),
      placement: { section: "gallery", position: 3 },
    },
    {
      title: "رویداد اینشورتک و نوآوری بیمه‌ای",
      lead: "گزارش تصویری از معرفی استارتاپ‌های برتر بیمه‌ای سال",
      categorySlug: "insurtech",
      image: "/images/news/insurtech-event.jpg",
      publishedAt: daysAgo(2.9),
      placement: { section: "gallery", position: 4 },
    },
    {
      title: "نشست سالانه سندیکای بیمه‌گران ایران",
      lead: "گزارش تصویری",
      categorySlug: "insurance-market",
      image: "/images/news/syndicate-meeting.jpg",
      publishedAt: daysAgo(3.2),
      placement: { section: "gallery", position: 5 },
    },
    {
      title: "گردهمایی نمایندگان برتر بیمه عمر",
      lead: "گزارش تصویری",
      categorySlug: "insurance-lines",
      image: "/images/news/agents-gathering.jpg",
      publishedAt: daysAgo(3.3),
      placement: { section: "gallery", position: 6 },
    },
    {
      title: "افتتاح شعبه دیجیتال یک شرکت بیمه",
      lead: "گزارش تصویری",
      categorySlug: "insurtech",
      image: "/images/news/digital-branch.jpg",
      publishedAt: daysAgo(3.4),
      placement: { section: "gallery", position: 7 },
    },
    // ---------- پربازدیدترین (خودکار با views) ----------
    {
      title: "قیمت بیمه شخص ثالث سال آینده اعلام شد",
      lead: "نرخ‌های جدید بیمه اجباری خودرو با افزایش متوسط ۲۵ درصدی همراه است",
      categorySlug: "insurance-lines",
      image: "/images/news/pop-1.jpg",
      views: 23456,
      publishedAt: daysAgo(0.8),
    },
    {
      title: "گزارش کامل از سند توسعه صنعت بیمه",
      lead: "جزئیات سند توسعه و تعهدات هر یک از بازیگران صنعت بیمه",
      categorySlug: "regulation",
      image: "/images/news/pop-2.jpg",
      views: 18234,
      publishedAt: daysAgo(0.9),
    },
    {
      title: "خرید بیمه‌نامه با ارز دیجیتال؛ تجربه تازه یک اینشورتک",
      lead: "یک پلتفرم ایرانی پرداخت حق بیمه با رمزارز را آزمایشی آغاز کرد",
      categorySlug: "insurtech",
      image: "/images/news/pop-3.jpg",
      views: 15678,
      publishedAt: daysAgo(1.4),
    },
    {
      title: "تأثیر تورم بر ذخایر فنی شرکت‌های بیمه",
      lead: "کارشناسان پیامدهای تورم بر توانگری مالی بیمه‌گران را بررسی می‌کنند",
      categorySlug: "insurance-market",
      image: "/images/news/pop-4.jpg",
      views: 12890,
      publishedAt: daysAgo(1.6),
    },
    {
      title: "آغاز پوشش بیمه‌ای جدید برای رانندگان تاکسی آنلاین",
      lead: "بیمه مسئولیت رانندگان اسنپ و تپسی از این هفته عرضه شد",
      categorySlug: "insurance-lines",
      image: "/images/news/pop-5.jpg",
      views: 10234,
      publishedAt: daysAgo(1.9),
    },
    // ---------- آخرین مقالات (خودکار با تاریخ — جدیدترین publishedAt) ----------
    {
      title: "آغاز پذیره‌نویسی صندوق سرمایه‌گذاری بیمه‌ای در فرابورس",
      lead: "نخستین صندوق تخصصی سرمایه‌گذاری صنعت بیمه به بازار سرمایه می‌آید",
      categorySlug: "insurance-market",
      image: "/images/news/insurance-fund-ipo.jpg",
      publishedAt: hoursAgo(0.2),
    },
    {
      title: "راه‌اندازی سامانه یکپارچه صدور بیمه‌نامه‌های الکترونیکی",
      lead: "همه بیمه‌نامه‌ها تا پایان سال به‌صورت تمام‌الکترونیکی صادر می‌شوند",
      categorySlug: "insurtech",
      image: "/images/news/epolicy-platform.jpg",
      publishedAt: hoursAgo(0.3),
    },
    {
      title: "بیمه مرکزی مجوز فعالیت دو پلتفرم اینشورتک جدید را صادر کرد",
      lead: "تعداد پلتفرم‌های دارای مجوز فروش آنلاین بیمه به ۱۴ شرکت رسید",
      categorySlug: "insurtech",
      image: "/images/news/insurtech-license.jpg",
      publishedAt: hoursAgo(0.35),
    },
    {
      title: "توسعه همکاری‌های بیمه‌ای ایران با شرکت‌های اتکایی آسیایی",
      lead: "امضای ۳ تفاهم‌نامه برای پذیرش اتکایی ریسک‌های انرژی و حمل‌ونقل",
      categorySlug: "world",
      image: "/images/news/reinsurance-asia.jpg",
      publishedAt: hoursAgo(0.4),
    },
  ];

  let count = 0;
  for (const p of posts) {
    await makePost(p, catMap);
    count++;
  }
  console.log(`created ${count} demo posts with placements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
