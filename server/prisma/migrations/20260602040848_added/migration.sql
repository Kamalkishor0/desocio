-- CreateTable
CREATE TABLE "FriendshipInteraction" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendshipInteraction_userId_friendId_key" ON "FriendshipInteraction"("userId", "friendId");
