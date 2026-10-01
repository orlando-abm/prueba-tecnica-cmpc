-- Enable unaccent extension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── Books: slug ─────────────────────────────────────────────────────────────
ALTER TABLE "books" ADD COLUMN "slug" TEXT;

WITH src AS (
  SELECT
    id,
    created_at,
    lower(trim(both '-' FROM regexp_replace(unaccent(title), '[^a-zA-Z0-9]+', '-', 'g'))) AS base
  FROM "books"
),
ranked AS (
  SELECT id, base, row_number() OVER (PARTITION BY base ORDER BY created_at, id) AS rn
  FROM src
)
UPDATE "books" b
SET "slug" = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || (r.rn - 1)::text END
FROM ranked r
WHERE b.id = r.id;

ALTER TABLE "books" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "books_slug_key" ON "books"("slug");

-- ─── Genres: slug ────────────────────────────────────────────────────────────
ALTER TABLE "genres" ADD COLUMN "slug" TEXT;

WITH src AS (
  SELECT
    id,
    created_at,
    lower(trim(both '-' FROM regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g'))) AS base
  FROM "genres"
),
ranked AS (
  SELECT id, base, row_number() OVER (PARTITION BY base ORDER BY created_at, id) AS rn
  FROM src
)
UPDATE "genres" g
SET "slug" = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || (r.rn - 1)::text END
FROM ranked r
WHERE g.id = r.id;

ALTER TABLE "genres" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");

-- ─── Authors: slug ───────────────────────────────────────────────────────────
ALTER TABLE "authors" ADD COLUMN "slug" TEXT;

WITH src AS (
  SELECT
    id,
    created_at,
    lower(trim(both '-' FROM regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g'))) AS base
  FROM "authors"
),
ranked AS (
  SELECT id, base, row_number() OVER (PARTITION BY base ORDER BY created_at, id) AS rn
  FROM src
)
UPDATE "authors" a
SET "slug" = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || (r.rn - 1)::text END
FROM ranked r
WHERE a.id = r.id;

ALTER TABLE "authors" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "authors_slug_key" ON "authors"("slug");

-- ─── Publishers: slug ────────────────────────────────────────────────────────
ALTER TABLE "publishers" ADD COLUMN "slug" TEXT;

WITH src AS (
  SELECT
    id,
    created_at,
    lower(trim(both '-' FROM regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g'))) AS base
  FROM "publishers"
),
ranked AS (
  SELECT id, base, row_number() OVER (PARTITION BY base ORDER BY created_at, id) AS rn
  FROM src
)
UPDATE "publishers" p
SET "slug" = CASE WHEN r.rn = 1 THEN r.base ELSE r.base || '-' || (r.rn - 1)::text END
FROM ranked r
WHERE p.id = r.id;

ALTER TABLE "publishers" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "publishers_slug_key" ON "publishers"("slug");
