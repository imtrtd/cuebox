import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

/**
 * Prisma over driver adapters so the same code runs on Node (next dev/start)
 * and Cloudflare Workers (OpenNext).
 *
 * - Neon URLs use @prisma/adapter-neon (WebSocket/HTTPS on 443; works from
 *   Workers and from networks that block 5432).
 * - Any other Postgres (local docker) uses @prisma/adapter-pg.
 *
 * Workers forbid sharing I/O objects (sockets) between requests, so there we
 * build a client per request (deduped within a render by React `cache`).
 * On Node a single global client is reused as before.
 */

function connectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function createClient(): PrismaClient {
  const url = connectionString();
  const adapter = /\.neon\.tech(?::\d+)?\//.test(url)
    ? new PrismaNeon({ connectionString: url })
    : new PrismaPg({ connectionString: url, maxUses: 1 });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const isWorkerd =
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const getRequestClient = cache(createClient);

export function getDb(): PrismaClient {
  if (isWorkerd) return getRequestClient();
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

/** Back-compat export: forwards every access to the right client. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
