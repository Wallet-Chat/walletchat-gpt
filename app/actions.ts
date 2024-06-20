'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'
import { User, type Chat } from '@/lib/types'
import axios from 'axios'

export async function getUser(email: string) {
  const user = await kv.hgetall<User>(`user:${email}`)
  return user
}

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  // const session = await auth()
  try {
    const address = await axios.get('/api/connectWallet');

    if (!address.data) {
      return {
        error: 'Unauthorized'
      }
    }
    //Convert uid to string for consistent comparison with session.user.id
    const uid = String(await kv.hget(`chat:${id}`, 'userId'))
  
    if (uid !== address.data) {
      return {
        error: 'Unauthorized'
      }
    }
  
    await kv.del(`chat:${id}`)
    await kv.zrem(`user:chat:${address.data}`, `chat:${id}`)
  
    revalidatePath('/')
    return revalidatePath(path)
    
  } catch (error) {
    console.log(error)
  }
}

export async function clearChats() {
  // const session = await auth()

  try {
    const address = await axios.get('/api/connectWallet');

    if (!address.data) {
      return {
        error: 'Unauthorized'
      }
    }
  
    const chats: string[] = await kv.zrange(`user:chat:${address.data}`, 0, -1)
    if (!chats.length) {
      return redirect('/')
    }
    const pipeline = kv.pipeline()
  
    for (const chat of chats) {
      pipeline.del(chat)
      pipeline.zrem(`user:chat:${address.data}`, chat)
    }
  
    await pipeline.exec()
  
    revalidatePath('/')
    return redirect('/')
  } catch (error) {
    console.log(error)
  }
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  // const session = await auth()

  try {
    const address = await axios.get('/api/connectWallet');

    if (!address) {
      return {
        error: 'Unauthorized'
      }
    }
  
    const chat = await kv.hgetall<Chat>(`chat:${id}`)
  
    if (!chat || chat.userId !== address.data) {
      return {
        error: 'Something went wrong'
      }
    }
  
    const payload = {
      ...chat,
      sharePath: `/share/${chat.id}`
    }
  
    await kv.hmset(`chat:${chat.id}`, payload)
  
    return payload
  } catch (error) {
    console.log(error)
  }
}

export async function saveChat(chat: Chat) {
  // const session = await auth()

  try {
    const address = await axios.get('/api/connectWallet');

    if (address.data && address.data) {
      const pipeline = kv.pipeline()
      pipeline.hmset(`chat:${chat.id}`, chat)
      pipeline.zadd(`user:chat:${chat.userId}`, {
        score: Date.now(),
        member: `chat:${chat.id}`
      })
      await pipeline.exec()
    } else {
      return
    }
  } catch (error) {
    
  }

}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}