#!/usr/bin/env node
// Liara Docker entrypoint - start Next.js only.
// Database migrations must be performed separately with explicit authorization.
import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true });
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

console.log(">> starting Next.js (standalone)...");
await run("node", ["server.js"]);
