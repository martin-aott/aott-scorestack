-- CreateTable
CREATE TABLE "pending_checkouts" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "ls_checkout_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "plan" "Plan",
    "credits" INTEGER,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_checkouts_ls_checkout_id_key" ON "pending_checkouts"("ls_checkout_id");

-- CreateIndex
CREATE INDEX "pending_checkouts_org_id_created_at_idx" ON "pending_checkouts"("org_id", "created_at");

-- AddForeignKey
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
