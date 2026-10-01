-- AlterTable
ALTER TABLE "genres" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "genres_deleted_at_idx" ON "genres"("deleted_at");
