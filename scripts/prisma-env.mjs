/**
 * Prisma schema requires both DATABASE_URL and DATABASE_URL_UNPOOLED.
 * Vercel often has the first set and the second missing or empty, which
 * makes `prisma generate` fail with P1012 before the app builds.
 *
 * Copy the pooled URL when the unpooled one is absent so generate works.
 * Production migrations still require a real direct URL and should skip
 * when this fallback is used.
 */
export function applyPrismaEnv() {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim() ?? "";

  if (unpooled) {
    return { usedFallback: false };
  }

  if (!databaseUrl) {
    return { usedFallback: false, missingDatabaseUrl: true };
  }

  process.env.DATABASE_URL_UNPOOLED = databaseUrl;
  process.env.CUEBOX_PRISMA_UNPOOLED_FALLBACK = "1";
  console.log(
    "DATABASE_URL_UNPOOLED is empty; using DATABASE_URL so Prisma can generate.",
  );
  return { usedFallback: true };
}
