/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Conversation_walletAddress_key" ON "Conversation"("walletAddress");
