/*
  Warnings:

  - The values [friends] on the enum `ThoughtVisibility` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ThoughtVisibility_new" AS ENUM ('public', 'private');
ALTER TABLE "public"."Thought" ALTER COLUMN "visibility" DROP DEFAULT;
ALTER TABLE "Thought" ALTER COLUMN "visibility" TYPE "ThoughtVisibility_new" USING ("visibility"::text::"ThoughtVisibility_new");
ALTER TYPE "ThoughtVisibility" RENAME TO "ThoughtVisibility_old";
ALTER TYPE "ThoughtVisibility_new" RENAME TO "ThoughtVisibility";
DROP TYPE "public"."ThoughtVisibility_old";
ALTER TABLE "Thought" ALTER COLUMN "visibility" SET DEFAULT 'public';
COMMIT;
