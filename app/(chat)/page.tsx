import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'

export const metadata = {
  title: 'WalletChat AI'
}

export const maxDuration = 300

export default function IndexPage() {
  const id = nanoid()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} />
    </AI>
  )
}
