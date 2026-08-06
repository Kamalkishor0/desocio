-- AlterTable
ALTER TABLE "thought_comments" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "thought_comments_parentId_createdAt_idx" ON "thought_comments"("parentId", "createdAt");

-- AddForeignKey
ALTER TABLE "thought_comments" ADD CONSTRAINT "thought_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "thought_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
