"use client"
import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import { useAccount } from 'wagmi'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
    const { address, isConnected } = useAccount();

    if (!isConnected) {
      return {}
    }

    const chat = await getChat(params.id, address)
    return {
        title: chat?.title.toString().slice(0, 50) ?? 'Chat'
    }
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { address, isConnected } = useAccount();

//   const session = (await auth()) as Session
    // const missingKeys = await getMissingKeys()

//   if (!session?.user) {
//     redirect(`/login?next=/chat/${params.id}`)
//   }

//   const userId = session.user.id as string
  const chat = await getChat(params.id, address)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== address) {
    notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <Chat
        id={chat.id}
      />
    </AI>
  )
}