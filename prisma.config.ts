import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile(".env");
} catch {
  // .env not present (e.g. CI with real env vars already set)
}

export default defineConfig({
  schema: "prisma/schema",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
});
