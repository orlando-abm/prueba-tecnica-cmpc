-- Replace partial unique indexes with standard ones
DROP INDEX IF EXISTS "books_isbn_key";
DROP INDEX IF EXISTS "books_sku_key";

CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");
CREATE UNIQUE INDEX "books_sku_key"  ON "books"("sku");

-- Prisma manages updatedAt via ORM, remove DB-level defaults
ALTER TABLE "genres"     ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "authors"    ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "publishers" ALTER COLUMN "updated_at" DROP DEFAULT;
