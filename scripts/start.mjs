#!/usr/bin/env node
// Liara Docker entrypoint - migrate DB then start Next.js
import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

try {
  console.log(">> prisma migrate deploy...");
  await run("npx", ["prisma", "migrate", "deploy"]).catch(() => console.log("migrate deploy skipped"));
  console.log(">> prisma db push...");
  await run("npx", ["prisma", "db", "push", "--accept-data-loss"]).catch(() => {});
} catch {}

console.log(">> starting Next.js (standalone)...");
await run("node", ["server.js"]);
