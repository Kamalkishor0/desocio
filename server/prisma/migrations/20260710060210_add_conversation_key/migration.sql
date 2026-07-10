/*
  Warnings:

  - A unique constraint covering the columns `[conversation_key]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversation_key` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "conversation_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_conversation_key_key" ON "conversations"("conversation_key");
