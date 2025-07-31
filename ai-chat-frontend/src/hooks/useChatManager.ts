import { useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { ChatsState, Chat, Message } from '@/types'

/**
 * 聊天管理 Hook
 */
export function useChatManager() {
  const SYSTEM_ROLE =
    import.meta.env.VITE_SYSTEM_ROLE || 'You are a helpful assistant.'

  const MAX_CHAT_NAME_LENGTH = 30 // 最大聊天名称长度
  const STORAGE_CHAT_KEY = 'chats-key' // 本地存储键名
  const [chats, setChats] = useLocalStorage<ChatsState>(STORAGE_CHAT_KEY, {})

  // 当前聊天ID
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    try {
      const isChat = (obj: any): obj is Chat => {
        return (
          obj &&
          typeof obj.createdAt === 'string' &&
          Array.isArray(obj.messages)
        )
      }

      const savedChats: unknown = JSON.parse(
        localStorage.getItem(STORAGE_CHAT_KEY) || '{}',
      )

      if (typeof savedChats === 'object' && savedChats !== null) {
        const chatEntries = Object.entries(savedChats).filter(([, chat]) =>
          isChat(chat),
        ) as Array<[string, Chat]>

        if (chatEntries.length > 0) {
          return chatEntries.sort(
            (a, b) =>
              new Date(b[1].createdAt).getTime() -
              new Date(a[1].createdAt).getTime(),
          )[0][0]
        }
      }
    } catch (e) {
      console.error('初始化currentChatId失败', e)
    }

    return Date.now().toString()
  })

  // 创建新聊天
  const createNewChat = useCallback(
    (systemRole?: string) => {
      const newChatId = Date.now().toString()
      const newChat: Chat = {
        messages: [],
        createdAt: new Date().toISOString(),
        name: '未命名会话',
        systemRole: systemRole || SYSTEM_ROLE,
      }

      setChats(prev => ({
        ...prev,
        [newChatId]: newChat,
      }))
      setCurrentChatId(newChatId)
      return newChatId
    },
    [SYSTEM_ROLE, setChats],
  )

  // 删除聊天
  const removeChat = useCallback(
    (chatId: string) => {
      setChats(prev => {
        const newChats = { ...prev }
        delete newChats[chatId]
        return newChats
      })

      if (chatId === currentChatId) {
        const remainingChats = Object.keys(chats).filter(id => id !== chatId)
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0])
        } else {
          createNewChat()
        }
      }
    },
    [chats, currentChatId, setChats, createNewChat],
  )

  // 添加消息
  const addMessage = useCallback(
    (message: Message) => {
      setChats(prev => {
        const currentChat = prev[currentChatId]
        if (!currentChat) return prev

        const updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, message],
          name:
            currentChat.messages.length === 0
              ? message.content.slice(0, MAX_CHAT_NAME_LENGTH)
              : currentChat.name,
        }

        return {
          ...prev,
          [currentChatId]: updatedChat,
        }
      })
    },
    [currentChatId, setChats],
  )

  // 更新最后一条消息
  const updateLastMessage = useCallback(
    (content: string) => {
      setChats(prev => {
        const currentChat = prev[currentChatId]
        if (!currentChat || currentChat.messages.length === 0) return prev

        const lastIndex = currentChat.messages.length - 1
        const updatedMessages = currentChat.messages.map((msg, idx) =>
          idx === lastIndex ? { ...msg, content } : msg,
        )

        return {
          ...prev,
          [currentChatId]: {
            ...currentChat,
            messages: updatedMessages,
          },
        }
      })
    },
    [currentChatId, setChats],
  )

  // 截断消息到指定位置
  const truncateMessagesTo = useCallback(
    (messageIndex: number) => {
      setChats(prev => {
        const currentChat = prev[currentChatId]
        if (!currentChat) return prev

        return {
          ...prev,
          [currentChatId]: {
            ...currentChat,
            messages: currentChat.messages.slice(0, messageIndex + 1),
          },
        }
      })
    },
    [currentChatId, setChats],
  )

  // 如果没有聊天会话，创建一个新的
  useEffect(() => {
    if (Object.keys(chats).length === 0) {
      createNewChat()
    }
  }, [chats, createNewChat])

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    removeChat,
    addMessage,
    updateLastMessage,
    truncateMessagesTo,
    currentChat: chats[currentChatId],
  }
}
