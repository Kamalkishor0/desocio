ALTER TABLE "users"
ADD COLUMN "x_profile_url" TEXT,
ADD COLUMN "linkedin_url" TEXT,
ADD COLUMN "show_online_status" BOOLEAN NOT NULL DEFAULT true;
