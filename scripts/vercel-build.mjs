import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyPrismaEnv } from "./prisma-env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: isWindows,
    env: process.env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status) {
    process.exit(result.status);
  }
}

const { missingDatabaseUrl } = applyPrismaEnv();

if (missingDatabaseUrl) {
  console.error("DATABASE_URL is required for Vercel builds.");
  process.exit(1);
}

const nextBin = path.join(
  root,
  "node_modules",
  ".bin",
  isWindows ? "next.cmd" : "next",
);
const next = existsSync(nextBin) ? nextBin : "next";

run("npm", ["run", "build:mcp-widget"]);
run("node", ["scripts/prisma-generate.mjs"]);
run("node", ["scripts/vercel-migrate.mjs"]);
run(next, ["build"]);
