import { defineConfig } from "prisma/config";

// Prisma skips auto .env loading when a config file exists — load it here
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional in CI/production (env vars provided externally)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
