/*
  Warnings:

  - Added the required column `user_id` to the `pending_checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "pending_checkouts_org_id_created_at_idx";

-- Clear stale rows so the NOT NULL column can be added safely
DELETE FROM "pending_checkouts";

-- AlterTable
ALTER TABLE "pending_checkouts" ADD COLUMN "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "pending_checkouts_org_id_user_id_created_at_idx" ON "pending_checkouts"("org_id", "user_id", "created_at");

-- AddForeignKey
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
