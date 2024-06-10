"use server";

// import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const prisma = new PrismaClient();

interface Chat {
  conversation: any | null;
  threadID: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { conversation, threadId } = req.body;

  if (!conversation || !threadId) {
    return res.status(400).json({ error: "Missing text or sessionId" });
  }
  try {
    const recentMessages = await prisma.conversation.findMany({
      where: { threadID: threadId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const prompt =
      recentMessages.map((m: Chat) => m.conversation || "").join("\n") +
      "\n" +
      conversation;

    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };
    const data = {
      model: "gpt-4.0",
      messages: [{ role: "user", content: prompt }],
    };

    const response = await axios.post(
      `${
        process.env.OPENAI_API_ENDPOINT ||
        "https://api.openai.com/v1/assistants"
      }`,
      data,
      { headers }
    );
    const aiText = response.data.choices[0].message.content;

    // Save the new message and response
    await prisma.conversation.create({
      data: { conversation, threadID: threadId, threadbywallet: "test" },
    });
    await prisma.conversation.create({
      data: {
        conversation: aiText,
        threadID: threadId,
        threadbywallet: "test",
      },
    });

    res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to process your message" });
  }
}
