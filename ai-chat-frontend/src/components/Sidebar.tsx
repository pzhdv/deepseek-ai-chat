import React, { memo, useMemo } from 'react'
import { FiTrash2, FiX } from 'react-icons/fi'
import type { ChatsState } from '@/types'

interface SidebarProps {
  isOpen: boolean
  chats: ChatsState
  currentChatId: string
  onClose: () => void
  onChatSelect: (chatId: string) => void
  onRemoveChat: (chatId: string) => void
}

const Sidebar: React.FC<SidebarProps> = memo(
  ({ isOpen, onClose, chats, currentChatId, onChatSelect, onRemoveChat }) => {
    // 按创建时间排序聊天列表
    const sortedChats = useMemo(() => {
      return Object.entries(chats).sort(
        ([, a], [, b]) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }, [chats])

    return (
      <div
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-[#2D2D2D] transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold">Chat History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#3D3D3D]"
              aria-label="Close sidebar"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedChats.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No chat history yet
              </div>
            ) : (
              sortedChats.map(([chatId, chat]) => (
                <div
                  key={chatId}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => onChatSelect(chatId)}
                    className={`flex-1 text-left text-gray-300 hover:bg-[#3D3D3D] p-2 rounded truncate ${
                      currentChatId === chatId ? 'bg-[#3D3D3D]' : ''
                    }`}
                    title={chat.name || `Chat ${chatId.slice(0, 8)}`}
                  >
                    {chat.name ||
                      `${new Date(chat.createdAt).toLocaleDateString()} - Chat ${chatId.slice(0, 8)}`}
                  </button>
                  <button
                    onClick={() => onRemoveChat(chatId)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded hover:bg-[#3D3D3D] flex-shrink-0"
                    aria-label="Remove chat"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  },
)

Sidebar.displayName = 'Sidebar'

export default Sidebar
