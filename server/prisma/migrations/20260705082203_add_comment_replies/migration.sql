-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "PostComment_parentId_createdAt_idx" ON "PostComment"("parentId", "createdAt");

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
