import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { nanoid } from 'nanoid'

export async function SidebarDesktop() {
  // const session = await auth()
  const id = nanoid()


  // if (!session?.user?.id) {
  //   return null
  // }

  return (
    <Sidebar className="peer inset-y-0 z-30 hidden -translate-x-full border-r duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={id} />
    </Sidebar>
  )
}