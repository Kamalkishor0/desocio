ALTER TABLE "users" ADD COLUMN "referralCode" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");