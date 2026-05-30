-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('friends', 'private');

-- CreateEnum
CREATE TYPE "ThoughtVisibility" AS ENUM ('public', 'friends', 'private');

-- CreateEnum
CREATE TYPE "TypeOfThought" AS ENUM ('thoughts', 'recommendations', 'ideas', 'discussions');

-- CreateEnum
CREATE TYPE "PostReactionType" AS ENUM ('heart', 'clap', 'laugh');

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'friends',

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_photos" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "post_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "type" "PostReactionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thought" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "type" "TypeOfThought" NOT NULL DEFAULT 'thoughts',
    "visibility" "ThoughtVisibility" NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thought_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThoughtSupport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThoughtSupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThoughtComment" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThoughtComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedThought" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedThought_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "thoughtId" TEXT NOT NULL,
    "reason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thought_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_authorId_createdAt_idx" ON "posts"("authorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "post_photos_postId_position_key" ON "post_photos"("postId", "position");

-- CreateIndex
CREATE INDEX "post_reactions_postId_idx" ON "post_reactions"("postId");

-- CreateIndex
CREATE INDEX "post_reactions_userId_idx" ON "post_reactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_userId_postId_key" ON "post_reactions"("userId", "postId");

-- CreateIndex
CREATE INDEX "Thought_authorId_createdAt_idx" ON "Thought"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Thought_visibility_createdAt_idx" ON "Thought"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "ThoughtSupport_userId_idx" ON "ThoughtSupport"("userId");

-- CreateIndex
CREATE INDEX "ThoughtSupport_thoughtId_idx" ON "ThoughtSupport"("thoughtId");

-- CreateIndex
CREATE UNIQUE INDEX "ThoughtSupport_userId_thoughtId_key" ON "ThoughtSupport"("userId", "thoughtId");

-- CreateIndex
CREATE INDEX "PostComment_authorId_createdAt_idx" ON "PostComment"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "ThoughtComment_authorId_createdAt_idx" ON "ThoughtComment"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "ThoughtComment_thoughtId_createdAt_idx" ON "ThoughtComment"("thoughtId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedThought_userId_idx" ON "SavedThought"("userId");

-- CreateIndex
CREATE INDEX "SavedThought_thoughtId_idx" ON "SavedThought"("thoughtId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedThought_userId_thoughtId_key" ON "SavedThought"("userId", "thoughtId");

-- CreateIndex
CREATE INDEX "thought_reports_thoughtId_createdAt_idx" ON "thought_reports"("thoughtId", "createdAt");

-- CreateIndex
CREATE INDEX "thought_reports_reporterId_createdAt_idx" ON "thought_reports"("reporterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "thought_reports_reporterId_thoughtId_key" ON "thought_reports"("reporterId", "thoughtId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_photos" ADD CONSTRAINT "post_photos_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThoughtSupport" ADD CONSTRAINT "ThoughtSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThoughtSupport" ADD CONSTRAINT "ThoughtSupport_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThoughtComment" ADD CONSTRAINT "ThoughtComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThoughtComment" ADD CONSTRAINT "ThoughtComment_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedThought" ADD CONSTRAINT "SavedThought_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedThought" ADD CONSTRAINT "SavedThought_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_reports" ADD CONSTRAINT "thought_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_reports" ADD CONSTRAINT "thought_reports_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;
