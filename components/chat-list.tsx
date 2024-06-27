
import { Separator } from '@/components/ui/separator'
import { UIState } from '@/lib/chat/actions'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useAccount } from 'wagmi'
import { SpinnerMessage } from './crypto/message'
export interface ChatList {
  messages: UIState[]
}

export function ChatList({ messages }: ChatList) {
  const { isConnected } = useAccount()
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isConnected && (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/" className="underline">
                  connect your wallet {' '}
                </Link>
                to save and revisit your chat history!
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      )}

      {messages.map((message: any, index) => (
        <div key={message.id}>
          {message.display}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}

      {messages.length === 1 && (
        <div className="mt-10">
          <SpinnerMessage />
        </div>
      )}
    </div>
  )
}