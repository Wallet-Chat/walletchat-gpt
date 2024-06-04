import { type UseChatHelpers } from 'ai/react'

import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { PromptForm } from '@/components/prompt-form'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from './footer'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import type { AI } from '@/lib/chat/actions'
import { nanoid } from 'nanoid'
import { UserMessage } from './stocks/message'

// export interface ChatPanelProps
//   extends Pick<
//     UseChatHelpers,
//     | 'append'
//     | 'isLoading'
//     | 'reload'
//     | 'messages'
//     | 'stop'
//     | 'input'
//     | 'setInput'
//   > {
//   id?: string
// }

export interface ChatPanelProps {
  id?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  // isLoading,
  // stop,
  // append,
  // reload,
  input,
  setInput,
  // messages
  title,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  // const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()
  const exampleMessages = [
    {
      heading: 'What are the',
      subheading: 'trending memecoins today?',
      message: `What are the trending memecoins today?`
    },
    {
      heading: 'What is the price of',
      subheading: '$DOGE right now?',
      message: 'What is the price of $DOGE right now?'
    },
    {
      heading: 'I would like to buy',
      subheading: '42 $DOGE',
      message: `I would like to buy 42 $DOGE`
    },
    {
      heading: 'What are some',
      subheading: `recent events about $DOGE?`,
      message: `What are some recent events about $DOGE?`
    }
  ]

  return (
    <div className="absolute items-center inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50%">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
      <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ])

                  const responseMessage = await submitUserMessage(
                    example.message
                  )

                  setMessages(currentMessages => [
                    ...currentMessages,
                    responseMessage
                  ])
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>

        {/* <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div> */}
        <div className="space-y-4 border-t px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          {/* <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value,
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          /> */}
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}