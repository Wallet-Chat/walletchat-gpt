// "use client"
import { Sidebar } from '@/components/sidebar'

import { ChatHistory } from '@/components/chat-history'
import { nanoid } from 'nanoid'
import { useAccount } from 'wagmi';
import { getWalletAddress } from '@/lib/walletstate';

export async function SidebarDesktop() {
  const address = await fetch(process.env.URL + '/api/connectWallet');
  const connectedWallet = await address.json();


  console.log("add", connectedWallet)
  // if (!session?.user?.id) {
  //   return null
  // }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={connectedWallet} />
    </Sidebar>
  )
}