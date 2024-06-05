import { HumanloopStream } from '@/lib/humanloop-stream';
import { StreamingTextResponse } from 'ai'
import { Humanloop } from 'humanloop'
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'

const HUMANLOOP_API_KEY = process.env.HUMANLOOP_API_KEY

const humanloop = new Humanloop({
  useFetch: true, // useFetch must be "true" for humanloop to work in Next.js edge runtime,
  openaiApiKey: process.env.OPENAI_API_KEY,
  apiKey: HUMANLOOP_API_KEY as string,
})

export const POST = async (req: NextRequest, res: NextResponse) => {
  if (!HUMANLOOP_API_KEY) {
    throw new Error('HUMANLOOP_API_KEY is not set')
  }

  const { messages } = await req.json()

  try {
    const chatResponse = await humanloop.chatStream({
      project: 'crypto-bot',
      messages,
      model_config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      }
    })

    console.log("calling")
    
    return new StreamingTextResponse(HumanloopStream(chatResponse.data))
  //   return new NextResponse(result, {
  //     status: 200,
  //     headers: { 'Content-Type': 'text/plain' },
  // });
  } catch (error) {
    console.log("Error:", error); 
    return new NextResponse(JSON.stringify({ error: "Failed to get completion from humanloop", details: error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}