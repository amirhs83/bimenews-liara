// Unit test for server-side sanitizePostBody (phase 4 requirement: stored-XSS defense)
// Run: npx tsx scripts/test-sanitize.ts

import { sanitizePostBody } from "../src/lib/sanitize";

let passed = 0;
let failed = 0;

function check(name: string, input: string, mustContain: string[], mustNotContain: string[]) {
  const out = sanitizePostBody(input);
  const missing = mustContain.filter((s) => !out.includes(s));
  const leaked = mustNotContain.filter((s) => out.includes(s));
  if (missing.length === 0 && leaked.length === 0) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`);
    if (missing.length) console.log(`      missing: ${JSON.stringify(missing)}`);
    if (leaked.length) console.log(`      leaked:  ${JSON.stringify(leaked)}`);
    console.log(`      output:  ${out}`);
  }
}

check(
  "script tag is stripped",
  '<p>سلام</p><script>alert("xss")</script>',
  ["<p>سلام</p>"],
  ["<script", "alert"]
);

check(
  "event handlers are stripped",
  '<p onclick="steal()">متن</p><img src="/api/media/x.png" onerror="hack()">',
  ['<img src="/api/media/x.png"'],
  ["onclick", "onerror", "steal", "hack"]
);

check(
  "javascript: URLs are stripped",
  '<a href="javascript:alert(1)">کلیک</a>',
  [">کلیک</a>"],
  ["javascript:"]
);

check(
  "foreign iframe is rejected",
  '<iframe src="https://evil.com/x"></iframe>',
  [""],
  ["evil.com", "<iframe"]
);

check(
  "aparat embed is kept",
  '<iframe src="https://www.aparat.com/video/video/embed/videohash/abc12/vtFrame" data-video-embed="true" allowfullscreen></iframe>',
  ["aparat.com", "data-video-embed"],
  []
);

check(
  "youtube embed is kept",
  '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" data-video-embed="true"></iframe>',
  ["youtube.com/embed/dQw4w9WgXcQ"],
  []
);

check(
  "relative media URLs are kept",
  '<img src="/api/media/abc.png" alt="تست"><video src="/api/media/v.webm"></video>',
  ["/api/media/abc.png", "/api/media/v.webm", 'controls="controls"'],
  []
);

check(
  "protocol-relative URLs are rejected",
  '<img src="//evil.com/x.png">',
  [],
  ["evil.com", "<img"]
);

check(
  "target=_blank gets noopener",
  '<a href="https://example.com" target="_blank">لینک</a>',
  ['rel="noopener noreferrer"', 'target="_blank"'],
  []
);

check(
  "basic formatting survives",
  '<h2 dir="rtl">تیتر</h2><p>متن <strong>بولد</strong> و <em>ایتالیک</em></p><ul><li>آیتم</li></ul><blockquote>نقل</blockquote>',
  ["<h2 dir=\"rtl\">", "<strong>بولد</strong>", "<em>ایتالیک</em>", "<ul><li>آیتم</li></ul>", "<blockquote>نقل</blockquote>"],
  []
);

check(
  "style attribute is stripped",
  '<p style="position:fixed;top:0">متن</p>',
  ["<p>متن</p>"],
  ["style="]
);

check(
  "data: URI images are rejected",
  '<img src="data:image/svg+xml;base64,PHN2Zz4=">',
  [],
  ["data:image", "<img"]
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
