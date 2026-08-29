// Liara deploy from GitHub Actions (direct API - no CLI arg-parser issues)
// Uses repo devDependencies: tar, ignore, fs-extra, form-data
import fs from "fs-extra";
import path from "node:path";
import { create } from "tar";
import ignore from "ignore";
import got from "got";
import { execSync } from "node:child_process";

const TOKEN = process.env.LIARA_TOKEN;
const NEON_URL = process.env.NEON_DATABASE_URL || "";
const APP = process.env.LIARA_APP || "bimenews";
const PORT = Number(process.env.LIARA_PORT || 3000);
const PLATFORM = process.env.LIARA_PLATFORM || "docker";

if (!TOKEN) {
  console.error("LIARA_TOKEN env is required");
  process.exit(1);
}

const projectPath = process.cwd();
const sourcePath = path.join("/tmp", "liara-source.tar.gz");

console.log("== Creating archive...");
const ig = ignore();
const ignoreFiles = [".liaraignore", ".dockerignore", ".gitignore"];
for (const f of ignoreFiles) {
  const p = path.join(projectPath, f);
  if (fs.existsSync(p)) {
    const patterns = fs.readFileSync(p).toString().split("\n")
      .map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    ig.add(patterns);
  }
}
ig.add([
  ".git", ".idea", ".vscode", ".next", ".dockerignore", "*.*~",
  "liara.json", "node_modules", "bower_components", ".DS_Store",
  ".env", ".env.*", "storage", "db/backups", "*.log"
]);

await create({
  gzip: true,
  file: sourcePath,
  cwd: projectPath,
  filter: (p) => {
    const rel = path.relative(projectPath, p).replace(/\\/g, "/");
    if (!rel) return true;
    return !ig.ignores(rel);
  }
}, ["."]);

const sizeMB = (fs.statSync(sourcePath).size / 1024 / 1024).toFixed(1);
console.log(`Archive created: ${sizeMB} MB`);

console.log("== Uploading source...");
const sourceBuf = fs.readFileSync(sourcePath);
const form = new FormData();
form.append("file", new Blob([sourceBuf], { type: "application/gzip" }), "source.tar.gz");
const uploadJson = await got.post(`https://api.liara.ir/v2/projects/${APP}/sources`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
  body: form,
  throwHttpErrors: false
}).json();
if (!uploadJson || !uploadJson.sourceID) {
  console.error("Upload failed", JSON.stringify(uploadJson).slice(0, 500));
  process.exit(1);
}
const sourceID = uploadJson.sourceID;
console.log("Uploaded, sourceID:", sourceID);

console.log("== Creating release...");
const build = { cache: true, dockerfile: "Dockerfile" };
if (NEON_URL) build.args = { DATABASE_URL: NEON_URL };
const body = {
  type: PLATFORM,
  port: PORT,
  sourceID,
  build,
  message: "deploy via GitHub Actions (direct API)"
};
const relJson = await got.post(`https://api.liara.ir/v2/projects/${APP}/releases`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
  json: body,
  throwHttpErrors: false
}).json();
const releaseID = relJson.releaseID || relJson.release?.id || relJson.id;
console.log("Release created:", releaseID);

console.log("== Streaming build logs...");
let since = 0;
let lastState = "";
for (let i = 0; i < 400; i++) {
  await new Promise(r => setTimeout(r, 5000));
  let j2 = {};
  try {
    j2 = await got.get(`https://api.liara.ir/v2/releases/${releaseID}/build-logs?since=${since}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      throwHttpErrors: false
    }).json();
  } catch (e) {
    console.log("log poll error:", e.message);
    continue;
  }
  const batch = j2.buildOutput || [];
  for (const o of batch) {
    const l = o.line;
    if (l.trim()) process.stdout.write(l.endsWith("\n") ? l : l + "\n");
  }
  if (batch.length) since = batch[batch.length - 1]._id;
  const state = j2.release?.state;
  if (state && state !== lastState) {
    lastState = state;
    console.log(`[release state: ${state}]`);
  }
  if (state === "READY") {
    console.log("DEPLOY SUCCESS");
    process.exit(0);
  }
  if (state === "FAILED" || state === "TIMEDOUT" || state === "CANCELED") {
    console.error(`DEPLOY FAILED: ${state}`);
    process.exit(1);
  }
}
console.error("Polling finished without final state");
process.exit(1);
