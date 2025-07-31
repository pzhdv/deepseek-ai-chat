export type Message = {
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

export type Chat = {
  messages: Message[]
  createdAt: string
  name: string
  systemRole: string
}

export type ChatsState = Record<string, Chat>
