-- AlterTable
ALTER TABLE "Collection" ADD COLUMN "slug" TEXT;
ALTER TABLE "Collection" ADD COLUMN "externalUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_slug_key" ON "Collection"("userId", "slug");
