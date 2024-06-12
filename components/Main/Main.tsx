import { Chat } from '../chat';
import { nanoid } from '@/lib/utils'
import { AI } from "@/lib/chat/actions";

const Main = () => {
    const id = nanoid()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} />
    </AI>
  )
}

export default Main