-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Collection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");
CREATE INDEX "Collection_parentId_idx" ON "Collection"("parentId");
CREATE TABLE "new_LibraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "messages" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "models" TEXT NOT NULL DEFAULT '[]',
    "variableDefs" TEXT NOT NULL DEFAULT '[]',
    "variants" TEXT NOT NULL DEFAULT '[]',
    "activeVariantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LibraryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LibraryItem" ("body", "collectionId", "createdAt", "favorite", "id", "kind", "messages", "tags", "title", "updatedAt", "userId") SELECT "body", "collectionId", "createdAt", "favorite", "id", "kind", "messages", "tags", "title", "updatedAt", "userId" FROM "LibraryItem";
DROP TABLE "LibraryItem";
ALTER TABLE "new_LibraryItem" RENAME TO "LibraryItem";
CREATE INDEX "LibraryItem_userId_idx" ON "LibraryItem"("userId");
CREATE INDEX "LibraryItem_collectionId_idx" ON "LibraryItem"("collectionId");
CREATE INDEX "LibraryItem_userId_kind_idx" ON "LibraryItem"("userId", "kind");
CREATE INDEX "LibraryItem_userId_archived_idx" ON "LibraryItem"("userId", "archived");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
