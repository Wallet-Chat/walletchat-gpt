-- DropIndex
DROP INDEX "Conversation_threadId_key";

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "threadId" DROP NOT NULL,
ALTER COLUMN "walletAddress" SET DATA TYPE TEXT;
