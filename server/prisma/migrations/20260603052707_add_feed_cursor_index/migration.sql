-- CreateIndex
CREATE INDEX "posts_authorId_visibility_createdAt_id_idx" ON "posts"("authorId", "visibility", "createdAt" DESC, "id" DESC);
