-- CreateIndex
CREATE INDEX "FriendshipInteraction_friendId_idx" ON "FriendshipInteraction"("friendId");

-- CreateIndex
CREATE INDEX "FriendshipInteraction_userId_score_idx" ON "FriendshipInteraction"("userId", "score" DESC);

-- AddForeignKey
ALTER TABLE "FriendshipInteraction" ADD CONSTRAINT "FriendshipInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendshipInteraction" ADD CONSTRAINT "FriendshipInteraction_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
