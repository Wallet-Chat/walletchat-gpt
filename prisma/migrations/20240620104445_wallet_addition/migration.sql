/*
  Warnings:

  - Added the required column `wallet` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "wallet" TEXT NOT NULL;
