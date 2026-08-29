// Persian news data for BimeNews redesign
// Image strategy: local images under /images/news/ mapped per-post
// SmartImage component adds local SVG fallback on top

export interface NewsItem {
  id: number;
  title: string;
  excerpt?: string;
  category: string;
  categoryKey: string; // key for placeholder mapping
  date: string;
  time: string;
  source?: string;
  imageUrl?: string;
}

export interface VideoItem {
  id: number;
  title: string;
  duration: string;
  date: string;
  time: string;
  views: string;
  imageUrl?: string;
  videoUrl?: string; // local video file for muted preview
  previewStart?: number; // seconds — which part of the video the preview shows
  categoryKey: string;
}

export interface MagazineItem {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  categoryKey: string;
  date: string;
  author: string;
}

export interface CommodityPrice {
  symbol: string;
  name: string;
  nameFa: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  icon: string; // SVG icon key in /icons/commodities/
}

// آخرین معامله نمادهای بیمه‌ای بورس (ریال)
export const commodityPrices: CommodityPrice[] = [
  {
    symbol: "ASIA",
    name: "آسیا",
    nameFa: "بیمه آسیا",
    price: "3245",
    change: "+41.00",
    changePercent: "+1.28%",
    up: true,
    icon: "asia",
  },
  {
    symbol: "AMIN",
    name: "اتکایی",
    nameFa: "بیمه اتکایی امین",
    price: "4512",
    change: "+68.00",
    changePercent: "+1.53%",
    up: true,
    icon: "amin",
  },
  {
    symbol: "ALBORZ",
    name: "البرز",
    nameFa: "بیمه البرز",
    price: "2187",
    change: "-12.00",
    changePercent: "-0.55%",
    up: false,
    icon: "alborz",
  },
  {
    symbol: "PARSIAN",
    name: "پارسیان",
    nameFa: "بیمه پارسیان",
    price: "5634",
    change: "+94.00",
    changePercent: "+1.70%",
    up: true,
    icon: "parsian",
  },
  {
    symbol: "DANA",
    name: "دانا",
    nameFa: "بیمه دانا",
    price: "1923",
    change: "-8.00",
    changePercent: "-0.41%",
    up: false,
    icon: "dana",
  },
  {
    symbol: "MELLAT",
    name: "ملت",
    nameFa: "بیمه ملت",
    price: "1458",
    change: "+11.00",
    changePercent: "+0.76%",
    up: true,
    icon: "mellat",
  },
  {
    symbol: "KARAFARIN",
    name: "کارآفرین",
    nameFa: "بیمه کارآفرین",
    price: "2316",
    change: "-19.00",
    changePercent: "-0.81%",
    up: false,
    icon: "karafarin",
  },
  {
    symbol: "ATKA",
    name: "اتکا",
    nameFa: "بیمه اتکایی ایرانیان",
    price: "6289",
    change: "+102.00",
    changePercent: "+1.65%",
    up: true,
    icon: "atka",
  },
  {
    symbol: "PASARGAD",
    name: "پاسارگاد",
    nameFa: "بیمه پاسارگاد",
    price: "2954",
    change: "-26.00",
    changePercent: "-0.87%",
    up: false,
    icon: "pasargad",
  },
  {
    symbol: "KHAVAR",
    name: "خاورمیانه",
    nameFa: "بیمه زندگی خاورمیانه",
    price: "3518",
    change: "+37.00",
    changePercent: "+1.06%",
    up: true,
    icon: "khavar",
  },
  {
    symbol: "SAMAN",
    name: "سامان",
    nameFa: "بیمه سامان",
    price: "4126",
    change: "+52.00",
    changePercent: "+1.28%",
    up: true,
    icon: "saman",
  },
  {
    symbol: "TEJARATNO",
    name: "تجارت‌نو",
    nameFa: "بیمه تجارت نو",
    price: "1784",
    change: "-9.00",
    changePercent: "-0.50%",
    up: false,
    icon: "tejaratno",
  },
  {
    symbol: "KOWSAR",
    name: "کوثر",
    nameFa: "بیمه کوثر",
    price: "2091",
    change: "+18.00",
    changePercent: "+0.87%",
    up: true,
    icon: "kowsar",
  },
  {
    symbol: "IRANMOEIN",
    name: "ایران‌معین",
    nameFa: "بیمه ایران معین",
    price: "2437",
    change: "+29.00",
    changePercent: "+1.20%",
    up: true,
    icon: "iranmoein",
  },
  {
    symbol: "MIHAN",
    name: "میهن",
    nameFa: "بیمه میهن",
    price: "1965",
    change: "-14.00",
    changePercent: "-0.71%",
    up: false,
    icon: "mihan",
  },
  {
    symbol: "NOVIN",
    name: "نوین",
    nameFa: "بیمه نوین",
    price: "2652",
    change: "+31.00",
    changePercent: "+1.18%",
    up: true,
    icon: "novin",
  },
  {
    symbol: "TAAVON",
    name: "تعاون",
    nameFa: "بیمه تعاون",
    price: "1539",
    change: "+7.00",
    changePercent: "+0.46%",
    up: true,
    icon: "taavon",
  },
  {
    symbol: "DAY",
    name: "دی",
    nameFa: "بیمه دی",
    price: "1812",
    change: "-11.00",
    changePercent: "-0.60%",
    up: false,
    icon: "day",
  },
  {
    symbol: "MOALLEM",
    name: "معلم",
    nameFa: "بیمه معلم",
    price: "2208",
    change: "+16.00",
    changePercent: "+0.73%",
    up: true,
    icon: "moallem",
  },
];

export const breakingNews: NewsItem[] = [
  {
    id: 1,
    title: "بیمه مرکزی: آیین‌نامه جدید نرخ‌گذاری بیمه شخص ثالث ابلاغ شد",
    excerpt: "آیین‌نامه جدید بر مبنای ریسک راننده و سابقه خسارت تدوین شده است",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳/۰۹/۲۴",
    time: "۱۲:۳۱",
    imageUrl: "/images/news/third-party-rule.jpg",
  },
  {
    id: 2,
    title: "افزایش ۲۰ درصدی حق بیمه‌های عمر در نیمه نخست امسال",
    excerpt: "صنعت بیمه رشد چشمگیر فروش بیمه‌های زندگی را ثبت کرد",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳/۰۹/۲۴",
    time: "۱۲:۳۱",
    imageUrl: "/images/news/life-insurance-growth.jpg",
  },
  {
    id: 3,
    title: "استارتاپ اینشورتک ایرانی موفق به جذب سرمایه ۵۰ میلیارد تومانی شد",
    excerpt: "این سرمایه‌گذاری برای توسعه پلتفرم فروش آنلاین بیمه‌نامه انجام شد",
    category: "اینشورتک",
    categoryKey: "insurtech",
    date: "۱۴۰۳/۰۹/۲۴",
    time: "۱۲:۳۱",
    imageUrl: "/images/news/insurtech-funding.jpg",
  },
];

export const featuredBreaking: NewsItem = {
  id: 0,
  title: "بیمه مرکزی: سهم صنعت بیمه از تولید ناخالص داخلی باید به ۵ درصد برسد",
  excerpt:
    "رئیس کل بیمه مرکزی در نشست هم‌اندیشی مدیران صنعت بیمه از تدوین سند توسعه صنعت بیمه خبر داد و گفت: بر اساس این سند، ضریب نفوذ بیمه و سهم صنعت از تولید ناخالص داخلی تا پایان برنامه هفتم به ۵ درصد می‌رسد.",
  category: "تنظیم‌گری",
  categoryKey: "regulation",
  date: "۱۴۰۳/۰۹/۲۴",
  time: "۱۳:۴۵",
  source: "بیمه نیوز",
  imageUrl: "/images/news/central-insurance-iran.jpg",
};

export const magazineArticles: MagazineItem[] = [
  {
    id: 1,
    title: "تحلیل جامع بازار بیمه‌های عمر در نیمه دوم سال ۱۴۰۳",
    excerpt: "بررسی روند فروش، سهم بازار شرکت‌ها و چشم‌انداز بیمه‌های زندگی و سرمایه‌گذاری",
    category: "ماهنامه",
    categoryKey: "magazine",
    date: "۲۴ تیر ۱۴۰۳",
    author: "محمد رضایی",
  },
  {
    id: 2,
    title: "آینده اینشورتک در ایران؛ از پلتفرم‌های فروش تا بیمه‌های خرد",
    excerpt: "نقش فناوری در تحول صنعت بیمه و فرصت‌های پیش‌روی استارتاپ‌های بیمه‌ای",
    category: "ماهنامه",
    categoryKey: "insurtech",
    date: "۲۲ تیر ۱۴۰۳",
    author: "سارا احمدی",
  },
  {
    id: 3,
    title: "بیمه‌های اتکایی و چالش پذیرش ریسک در بازارهای بین‌المللی",
    excerpt: "ظرفیت اتکایی صنعت بیمه ایران و راهکارهای توسعه همکاری‌های خارجی",
    category: "ماهنامه",
    categoryKey: "world",
    date: "۲۰ تیر ۱۴۰۳",
    author: "علی کریمی",
  },
];

export const videos: VideoItem[] = [
  {
    id: 1,
    title: "گفت‌وگوی اختصاصی با رئیس کل بیمه مرکزی درباره سند توسعه صنعت بیمه",
    duration: "۱۲:۳۴",
    date: "۲۵ اسفند ۱۴۰۱",
    time: "۱۲:۲۶",
    views: "۱۲٬۴۵۳",
    imageUrl: "/images/news/cii-interview.jpg",
    categoryKey: "video",
  },
  {
    id: 2,
    title: "بررسی تغییرات جدید بیمه شخص ثالث در گفت‌وگو با کارشناسان",
    duration: "۸:۲۱",
    date: "۲۳ اسفند ۱۴۰۱",
    time: "۱۴:۱۵",
    views: "۸٬۹۲۰",
    imageUrl: "/images/news/third-party-talk.jpg",
    categoryKey: "video",
  },
  {
    id: 3,
    title: "اینشورتک چیست و چگونه صنعت بیمه را دگرگون می‌کند؟",
    duration: "۱۵:۴۸",
    date: "۲۰ اسفند ۱۴۰۱",
    time: "۱۰:۳۰",
    views: "۱۵٬۲۳۱",
    imageUrl: "/images/news/insurtech-explainer.jpg",
    categoryKey: "video",
  },
  {
    id: 4,
    title: "گزارش تصویری از همایش سالانه صنعت بیمه تهران",
    duration: "۱۰:۱۲",
    date: "۱۸ اسفند ۱۴۰۱",
    time: "۱۶:۴۵",
    views: "۶٬۷۸۹",
    imageUrl: "/images/news/insurance-conference.jpg",
    categoryKey: "video",
  },
  {
    id: 5,
    title: "مستند کوتاه: تاریخچه صنعت بیمه در ایران",
    duration: "۲۵:۱۲",
    date: "۱۵ اسفند ۱۴۰۱",
    time: "۱۹:۰۰",
    views: "۲۳٬۵۶۷",
    imageUrl: "/images/news/insurance-history-doc.jpg",
    categoryKey: "video",
  },
];

export const economyNews: NewsItem[] = [
  {
    id: 101,
    title:
      "رئیس کل بیمه مرکزی: صدور بیمه‌نامه‌های جدید مسئولیت مدنی در دستور کار قرار گرفت",
    excerpt:
      "رئیس کل بیمه مرکزی در حاشیه نشست شورای هماهنگی صنعت بیمه از نهایی شدن دستورالعمل بیمه‌های مسئولیت جدید خبر داد.",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳-۱۱-۱۹",
    time: "۱۹:۴۵",
  },
  {
    id: 102,
    title:
      "سهم بیمه‌های شخص ثالث از پرتفوی صنعت بیمه به ۳۵ درصد رسید",
    excerpt:
      "آمار تازه بیمه مرکزی نشان می‌دهد بیمه‌های اجباری خودرو همچنان بزرگ‌ترین رشته صنعت بیمه است.",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳-۱۱-۱۹",
    time: "۱۷:۲۰",
  },
  {
    id: 103,
    title:
      "افزایش ۱۸ درصدی حق بیمه‌های تولیدی صنعت در نیمه اول امسال نسبت به مدت مشابه سال قبل",
    excerpt:
      "گزارش جدید بیمه مرکزی نشان می‌دهد حق بیمه تولیدی صنعت در شش ماه نخست امسال از ۱۱۰ هزار میلیارد تومان گذشت.",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳-۱۱-۱۸",
    time: "۱۴:۱۰",
  },
  {
    id: 104,
    title:
      "بورس بیمه‌ها سبزپوش شد؛ نمادهای بیمه‌ای در صدر برترین‌های بازار",
    excerpt:
      "گروه بیمه‌ای بورس امروز با افزایش تقاضا روبه‌رو شد و بیشتر نمادهای بیمه‌ای صف خرید ثبت کردند.",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳-۱۱-۱۸",
    time: "۱۱:۳۰",
  },
  {
    id: 105,
    title:
      "سندیکای بیمه‌گران: نرخ‌گذاری ریسک‌محور از ابتدای سال آینده اجرایی می‌شود",
    excerpt:
      "دبیرکل سندیکای بیمه‌گران ایران از آماده شدن زیرساخت‌های نرخ‌گذاری ریسک‌محور در رشته‌های اصلی خبر داد.",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳-۱۱-۱۷",
    time: "۰۹:۱۵",
  },
  {
    id: 106,
    title:
      "افزایش سرمایه یک شرکت بیمه بزرگ با مصوبه مجمع عمومی تصویب شد",
    excerpt:
      "مجمع عمومی عادی سالانه افزایش سرمایه این شرکت بیمه را به میزان ۲ هزار میلیارد تومان از محل سود انباشته تصویب کرد.",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۴۰۳-۱۱-۱۶",
    time: "۱۶:۴۵",
  },
];

export const latestArticles: NewsItem[] = [
  {
    id: 201,
    title: "آغاز پذیره‌نویسی صندوق سرمایه‌گذاری بیمه‌ای در فرابورس",
    excerpt: "نخستین صندوق تخصصی سرمایه‌گذاری صنعت بیمه به بازار سرمایه می‌آید",
    category: "بازار بیمه",
    categoryKey: "insurance-market",
    date: "۱۰ فروردین ۱۴۰۳",
    time: "۱۷:۲۰",
    imageUrl: "/images/news/insurance-fund-ipo.jpg",
  },
  {
    id: 202,
    title: "راه‌اندازی سامانه یکپارچه صدور بیمه‌نامه‌های الکترونیکی",
    excerpt: "همه بیمه‌نامه‌ها تا پایان سال به‌صورت تمام‌الکترونیکی صادر می‌شوند",
    category: "اینشورتک",
    categoryKey: "insurtech",
    date: "۸ فروردین ۱۴۰۳",
    time: "۱۵:۴۵",
    imageUrl: "/images/news/epolicy-platform.jpg",
  },
  {
    id: 203,
    title: "بیمه مرکزی مجوز فعالیت دو پلتفرم اینشورتک جدید را صادر کرد",
    excerpt: "تعداد پلتفرم‌های دارای مجوز فروش آنلاین بیمه به ۱۴ شرکت رسید",
    category: "اینشورتک",
    categoryKey: "insurtech",
    date: "۵ فروردین ۱۴۰۳",
    time: "۱۱:۳۰",
    imageUrl: "/images/news/insurtech-license.jpg",
  },
  {
    id: 204,
    title: "توسعه همکاری‌های بیمه‌ای ایران با شرکت‌های اتکایی آسیایی",
    excerpt: "امضای ۳ تفاهم‌نامه برای پذیرش اتکایی ریسک‌های انرژی و حمل‌ونقل",
    category: "جهان بیمه",
    categoryKey: "world",
    date: "۲ فروردین ۱۴۰۳",
    time: "۰۹:۱۵",
    imageUrl: "/images/news/reinsurance-asia.jpg",
  },
];

export const energyNews: NewsItem[] = [
  {
    id: 301,
    title: "آیین‌نامه اجرایی قانون تأمین مالی صنعت بیمه اصلاح شد",
    excerpt: "اصلاحیه جدید الزام‌های توانگری مالی شرکت‌های بیمه را به‌روزرسانی می‌کند",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳/۰۷/۱۲",
    time: "۱۰:۳۰",
  },
  {
    id: 302,
    title: "بیمه مرکزی دستورالعمل نظارت بر نمایندگان بیمه را بازنگری کرد",
    excerpt: "نمایندگان بیمه ملزم به ثبت‌نام در سامانه جدید رتبه‌بندی شدند",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳/۰۷/۱۰",
    time: "۱۴:۲۰",
  },
  {
    id: 303,
    title: "شیوه‌نامه جدید ارزیابی خسارت بیمه‌نامه‌های آتش‌سوزی ابلاغ شد",
    excerpt: "ارزیابان خسارت باید آزمون صلاحیت حرفه‌ای بیمه مرکزی را بگذرانند",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳/۰۷/۰۸",
    time: "۱۶:۴۵",
  },
  {
    id: 304,
    title: "شورای عالی بیمه مصوبه توسعه بیمه‌های زلزله را تصویب کرد",
    excerpt: "پوشش بیمه زلزله برای واحدهای مسکونی شهرهای بزرگ گسترش می‌یابد",
    category: "تنظیم‌گری",
    categoryKey: "regulation",
    date: "۱۴۰۳/۰۷/۰۵",
    time: "۱۲:۰۰",
  },
];

export const navLinks = [
  { label: "صفحه اصلی", href: "/", hot: true },
  { label: "بازار بیمه", href: "/category/insurance-market" },
  { label: "تنظیم‌گری", href: "/category/regulation" },
  { label: "رشته‌های بیمه", href: "/category/insurance-lines" },
  { label: "اینشورتک", href: "/category/insurtech" },
  { label: "جهان بیمه", href: "/category/world" },
  { label: "آرشیو ماهنامه", href: "/category/magazine" },
  { label: "ویدئو", href: "/category/video" },
];

export const utilityLinks = [
  { label: "Magazine", href: "/category/magazine", fa: false },
  { label: "Advertise", href: "/contact", fa: false },
  { label: "ماهنامه", href: "/category/magazine", fa: true },
  { label: "تبلیغات", href: "/contact", fa: true },
  { label: "پایگاه خبری", href: "/", fa: true },
  { label: "آرشیو", href: "/category/magazine", fa: true },
  { label: "تماس", href: "/contact", fa: true },
];

export const socialLinks = [
  {
    name: "Twitter",
    nameFa: "توییتر",
    color: "#000000",
    bg: "#000000",
    icon: "twitter",
    handle: "@bimenews",
    url: "https://twitter.com/bimenews",
  },
  {
    name: "Facebook",
    nameFa: "فیسبوک",
    color: "#FFFFFF",
    bg: "#1877F2",
    icon: "facebook",
    handle: "/bimenews",
    url: "https://www.facebook.com/bimenews",
  },
  {
    name: "Telegram",
    nameFa: "تلگرام",
    color: "#FFFFFF",
    bg: "#0088CC",
    icon: "telegram",
    handle: "@bimenews",
    url: "https://t.me/bimenews",
  },
  {
    name: "YouTube",
    nameFa: "یوتیوب",
    color: "#FFFFFF",
    bg: "#FF0000",
    icon: "youtube",
    handle: "/bimenews",
    url: "https://www.youtube.com/bimenews",
  },
  {
    name: "LinkedIn",
    nameFa: "لینکدین",
    color: "#FFFFFF",
    bg: "#0A66C2",
    icon: "linkedin",
    handle: "/bimenews",
    url: "https://www.linkedin.com/company/bimenews",
  },
  {
    name: "Instagram",
    nameFa: "اینستاگرام",
    color: "#FFFFFF",
    bg: "linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
    icon: "instagram",
    handle: "@bimenews",
    url: "https://www.instagram.com/bimenews",
  },
];

export const footerCategories = [
  "بازار بیمه",
  "تنظیم‌گری",
  "رشته‌های بیمه",
  "اینشورتک",
  "جهان بیمه",
  "آرشیو ماهنامه",
  "ویدئو",
];

export const footerPopularTags = [
  "بیمه شخص ثالث",
  "بیمه عمر",
  "بیمه مرکزی",
  "اینشورتک",
  "بیمه اتکایی",
  "بیمه آتش‌سوزی",
  "بیمه مسئولیت",
  "خسارت",
  "بیمه سلامت",
  "بیمه زلزله",
  "نرخ‌گذاری",
  "صنعت بیمه",
];
