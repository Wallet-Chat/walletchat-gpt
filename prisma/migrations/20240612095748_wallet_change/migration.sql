/*
  Warnings:

  - You are about to drop the column `threadbywallet` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `walletAddress` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "threadbywallet",
ADD COLUMN     "walletAddress" JSONB NOT NULL;
