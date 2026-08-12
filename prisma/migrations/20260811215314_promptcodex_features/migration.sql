-- AlterTable: add parentId to Collection
ALTER TABLE "Collection" ADD COLUMN "parentId" TEXT;

-- AlterTable: add new columns to LibraryItem
ALTER TABLE "LibraryItem" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "LibraryItem" ADD COLUMN "copyCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LibraryItem" ADD COLUMN "lastUsedAt" TIMESTAMP(3);
ALTER TABLE "LibraryItem" ADD COLUMN "models" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "LibraryItem" ADD COLUMN "variableDefs" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "LibraryItem" ADD COLUMN "variants" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "LibraryItem" ADD COLUMN "activeVariantId" TEXT;

-- CreateIndex
CREATE INDEX "Collection_parentId_idx" ON "Collection"("parentId");

-- CreateIndex
CREATE INDEX "LibraryItem_userId_archived_idx" ON "LibraryItem"("userId", "archived");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
