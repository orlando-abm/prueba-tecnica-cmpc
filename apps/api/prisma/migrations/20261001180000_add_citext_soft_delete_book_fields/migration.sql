-- Enable citext extension
CREATE EXTENSION IF NOT EXISTS citext;

-- ─── Genre: citext + createdAt + updatedAt ───────────────────────────────────
ALTER TABLE "genres" ALTER COLUMN "name" TYPE citext USING "name"::citext;
ALTER TABLE "genres" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "genres" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- ─── Author: citext + createdAt + updatedAt + deletedAt ─────────────────────
ALTER TABLE "authors" ALTER COLUMN "name" TYPE citext USING "name"::citext;
ALTER TABLE "authors" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "authors" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "authors" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "authors_deleted_at_idx" ON "authors"("deleted_at");

-- ─── Publisher: citext + createdAt + updatedAt + deletedAt ──────────────────
ALTER TABLE "publishers" ALTER COLUMN "name" TYPE citext USING "name"::citext;
ALTER TABLE "publishers" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "publishers" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "publishers" ADD COLUMN "deleted_at" TIMESTAMP(3);
CREATE INDEX "publishers_deleted_at_idx" ON "publishers"("deleted_at");

-- ─── User: email citext ──────────────────────────────────────────────────────
ALTER TABLE "users" ALTER COLUMN "email" TYPE citext USING "email"::citext;

-- ─── Book: citext title + new fields ────────────────────────────────────────
ALTER TABLE "books" ALTER COLUMN "title" TYPE citext USING "title"::citext;
ALTER TABLE "books" ADD COLUMN "isbn"     TEXT;
ALTER TABLE "books" ADD COLUMN "sku"      TEXT;
ALTER TABLE "books" ADD COLUMN "synopsis" TEXT;
ALTER TABLE "books" ADD COLUMN "language" TEXT;
ALTER TABLE "books" ADD COLUMN "pages"    INTEGER;
ALTER TABLE "books" ADD COLUMN "year"     INTEGER;

CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn") WHERE "isbn" IS NOT NULL;
CREATE UNIQUE INDEX "books_sku_key"  ON "books"("sku")  WHERE "sku"  IS NOT NULL;

-- ─── AuditLog: index on userId ───────────────────────────────────────────────
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
