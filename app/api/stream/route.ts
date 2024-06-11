"use server";

// import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

interface Chat {
  conversation: any | null;
  threadID: string;
}

export const POST = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
    });
  }
  const { conversation, threadId } = await req.json();

  console.log({ conversation, threadId });

  if (!conversation || !threadId) {
    return new Response(JSON.stringify({ message: "Error missing input" }), {
      status: 400,
    });
  }
  try {
    const recentMessages = await prisma.conversation.findMany({
      where: { threadID: threadId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    console.log(recentMessages);

    const prompt =
      recentMessages
        .map((m: Chat) => JSON.stringify(m.conversation) || "")
        .join("\n") +
      "\n" +
      JSON.stringify(conversation);

    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };
    console.log(prompt);

    const data = {
      model: "gpt-4.0",
      messages: [{ role: "user", content: prompt }],
    };

    const response = await axios.post(
      `${
        process.env.OPENAI_API_ENDPOINT ||
        "https://api.openai.com/v1/chat/completions"
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

    return new Response(JSON.stringify({ message: "aiText" }), { status: 200 });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your message" }),
      { status: 500 }
    );
  }
};
