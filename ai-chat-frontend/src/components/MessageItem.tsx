import React, { useState, memo } from 'react'
import { BiBot } from 'react-icons/bi'
import { FaUser } from 'react-icons/fa'
import MarkdownRenderer from './MarkdownRenderer'
import MessageActions from './MessageActions'
import type { ChatsState, Message } from '@/types'

interface MessageItemProps {
  message: Message
  index: number
  isLoading: boolean
  chats: ChatsState
  currentChatId: string
  handleRegenerate: (index: number) => void
}

/**
 * 消息项组件
 */
const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message, index, isLoading, chats, currentChatId, handleRegenerate }) => {
    const isAI = message.type === 'ai'
    const [isExpanded, setIsExpanded] = useState(true)
    const isLongMessage = message.content.split('\n').length > 3
    const isLastMessage = index === chats[currentChatId]?.messages.length - 1

    return (
      <div
        className={`flex w-full max-w-full ${
          isAI
            ? 'bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50'
            : 'bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50'
        } p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
      >
        <div className="flex-shrink-0 mr-3 sm:mr-4">
          {isAI ? (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <BiBot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-grow text-gray-800 dark:text-gray-50 overflow-hidden min-w-0">
          <div
            className={`prose dark:prose-invert max-w-none w-full ${
              isLongMessage && !isExpanded ? 'max-h-24 overflow-hidden' : ''
            }`}
          >
            {isAI ? (
              <div className="w-full">
                <MarkdownRenderer content={message.content} />
                {/* 当AI正在响应时显示加载动画 */}
                {isLoading && isLastMessage && (
                  <div className="flex items-center space-x-2 mt-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {!message.content ? '正在思考...' : '正在输入...'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words w-full">
                {message.content}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex justify-between items-center flex-wrap gap-2">
            {new Date(message.timestamp).toLocaleTimeString()}
            <MessageActions
              onRegenerate={() => handleRegenerate(index - 1)}
              isLongMessage={isLongMessage}
              isExpanded={isExpanded}
              toggleExpand={() => setIsExpanded(!isExpanded)}
              isLoading={isLoading}
              isAI={isAI}
              isLastMessage={isLastMessage}
            />
          </div>
        </div>
      </div>
    )
  },
)

MessageItem.displayName = 'MessageItem'

export default MessageItem
