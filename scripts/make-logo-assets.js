const sharp = require("sharp");
const path = require("path");

const pub = "C:/Users/amirhs/Desktop/petro/public";
const src = path.join(pub, "bimenews-logo-white.png");

(async () => {
  const meta = await sharp(src).metadata();
  console.log("original:", meta.width, "x", meta.height);

  // 1. optimized header logo (retina-safe height 160, transparent PNG)
  await sharp(src)
    .resize({ height: 160 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, "bimenews-logo-white-header.png"));
  const h = await sharp(path.join(pub, "bimenews-logo-white-header.png")).metadata();
  console.log("header logo:", h.width, "x", h.height);

  // 2. OG default banner 1200x630 (dark bg + white logo centered)
  const logoBuf = await sharp(src)
    .resize({ width: 620 })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 10, b: 11, alpha: 1 },
    },
  })
    .composite([{ input: logoBuf, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, "og-default.png"));
  console.log("og-default.png created");
})();
