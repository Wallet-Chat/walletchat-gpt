import { notFound, redirect } from 'next/navigation'

import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { useAccount } from 'wagmi'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
    // const { address, isConnected } = useAccount();
    const address = await fetch(process.env.URL + '/api/connectWallet');
    const connectedWallet = await address.json();

//   const session = (await auth()) as Session
    // const missingKeys = await getMissingKeys()

//   if (!session?.user) {
//     redirect(`/login?next=/chat/${params.id}`)
//   }

//   const userId = session.user.id as string
  const chat = await getChat(params.id, connectedWallet)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== connectedWallet) {
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