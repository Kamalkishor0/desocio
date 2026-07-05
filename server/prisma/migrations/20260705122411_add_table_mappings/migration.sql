/*
  Warnings:

  - You are about to drop the `FriendshipInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedThought` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thought` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThoughtComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThoughtSupport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FriendshipInteraction" DROP CONSTRAINT "FriendshipInteraction_friendId_fkey";

-- DropForeignKey
ALTER TABLE "FriendshipInteraction" DROP CONSTRAINT "FriendshipInteraction_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "SavedThought" DROP CONSTRAINT "SavedThought_thoughtId_fkey";

-- DropForeignKey
ALTER TABLE "SavedThought" DROP CONSTRAINT "SavedThought_userId_fkey";

-- DropForeignKey
ALTER TABLE "Thought" DROP CONSTRAINT "Thought_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ThoughtComment" DROP CONSTRAINT "ThoughtComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ThoughtComment" DROP CONSTRAINT "ThoughtComment_thoughtId_fkey";

-- DropForeignKey
ALTER TABLE "ThoughtSupport" DROP CONSTRAINT "ThoughtSupport_thoughtId_fkey";

-- DropForeignKey
ALTER TABLE "ThoughtSupport" DROP CONSTRAINT "ThoughtSupport_userId_fkey";

-- DropForeignKey
ALTER TABLE "thought_reports" DROP CONSTRAINT "thought_reports_thoughtId_fkey";

-- DropTable
DROP TABLE "FriendshipInteraction";

-- DropTable
DROP TABLE "PostComment";

-- DropTable
DROP TABLE "SavedThought";

-- DropTable
DROP TABLE "Thought";

-- DropTable
DROP TABLE "ThoughtComment";

-- DropTable
DROP TABLE "ThoughtSupport";

-- CreateTable
CREATE TABLE "friendship_interactions" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "thoughts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "type" "TypeOfThought" NOT NULL DEFAULT 'thoughts',
    "visibility" "ThoughtVisibility" NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thoughts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_supports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thought_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_comments" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thought_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_thoughts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_thoughts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friendship_interactions_friendId_idx" ON "friendship_interactions"("friendId");

-- CreateIndex
CREATE INDEX "friendship_interactions_userId_score_idx" ON "friendship_interactions"("userId", "score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "friendship_interactions_userId_friendId_key" ON "friendship_interactions"("userId", "friendId");

-- CreateIndex
CREATE INDEX "thoughts_authorId_createdAt_idx" ON "thoughts"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "thoughts_visibility_createdAt_idx" ON "thoughts"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "thought_supports_userId_idx" ON "thought_supports"("userId");

-- CreateIndex
CREATE INDEX "thought_supports_thoughtId_idx" ON "thought_supports"("thoughtId");

-- CreateIndex
CREATE UNIQUE INDEX "thought_supports_userId_thoughtId_key" ON "thought_supports"("userId", "thoughtId");

-- CreateIndex
CREATE INDEX "post_comments_authorId_createdAt_idx" ON "post_comments"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comments_postId_createdAt_idx" ON "post_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comments_parentId_createdAt_idx" ON "post_comments"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "thought_comments_authorId_createdAt_idx" ON "thought_comments"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "thought_comments_thoughtId_createdAt_idx" ON "thought_comments"("thoughtId", "createdAt");

-- CreateIndex
CREATE INDEX "saved_thoughts_userId_idx" ON "saved_thoughts"("userId");

-- CreateIndex
CREATE INDEX "saved_thoughts_thoughtId_idx" ON "saved_thoughts"("thoughtId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_thoughts_userId_thoughtId_key" ON "saved_thoughts"("userId", "thoughtId");

-- AddForeignKey
ALTER TABLE "friendship_interactions" ADD CONSTRAINT "friendship_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship_interactions" ADD CONSTRAINT "friendship_interactions_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_supports" ADD CONSTRAINT "thought_supports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_supports" ADD CONSTRAINT "thought_supports_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_comments" ADD CONSTRAINT "thought_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_comments" ADD CONSTRAINT "thought_comments_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_thoughts" ADD CONSTRAINT "saved_thoughts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_thoughts" ADD CONSTRAINT "saved_thoughts_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_reports" ADD CONSTRAINT "thought_reports_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "thoughts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
