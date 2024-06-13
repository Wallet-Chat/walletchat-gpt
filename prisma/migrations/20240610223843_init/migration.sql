-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "threadID" TEXT NOT NULL,
    "conversation" JSONB NOT NULL,
    "threadbywallet" JSONB NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_threadID_key" ON "Conversation"("threadID");
