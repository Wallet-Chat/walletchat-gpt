/*
  Warnings:

  - You are about to drop the column `conversation` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `threadID` on the `Conversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[threadId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversations` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threadId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Conversation_threadID_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "conversation",
DROP COLUMN "threadID",
ADD COLUMN     "conversations" JSONB NOT NULL,
ADD COLUMN     "threadId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_threadId_key" ON "Conversation"("threadId");
