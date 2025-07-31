import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
  type FormEvent,
} from 'react'
import { FiSend, FiMenu, FiSquare } from 'react-icons/fi'
import { FaRegPlusSquare } from 'react-icons/fa'

// 组件导入
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import MessageItem from '@/components/MessageItem'

// Hooks 导入
import { useChatManager, useDeepSeekAPI } from '@/hooks'

/**
 * 聊天界面主组件
 *
 * 功能包括：
 * 1. 聊天消息的显示和管理
 * 2. 用户输入和AI响应处理
 * 3. 智能滚动控制（切换会话、AI响应期间、响应完成后）
 * 4. 侧边栏和设置管理
 * 5. 响应式设计支持
 */

export default function AIChatPage() {
  // 系统角色
  const SYSTEM_ROLE =
    import.meta.env.VITE_SYSTEM_ROLE || 'You are a helpful assistant.'

  // ========== 自定义 Hooks ==========

  /**
   * 聊天管理 Hook
   * 提供聊天会话的创建、删除、切换和消息管理功能
   */
  const {
    chats, // 所有聊天会话
    currentChatId, // 当前活跃的聊天ID
    setCurrentChatId, // 切换聊天会话
    createNewChat, // 创建新的聊天会话
    removeChat, // 删除聊天会话
    addMessage, // 添加新消息
    updateLastMessage, // 更新最后一条消息（用于AI流式响应）
    truncateMessagesTo, // 截断消息到指定位置（用于重新生成）
    currentChat, // 当前活跃的聊天会话对象
  } = useChatManager()

  /**
   * 滚动相关状态和引用
   * 用于实现智能滚动控制
   */
  const messagesEndRef = useRef<HTMLDivElement>(null) // 消息列表底部的引用元素
  const messagesContainerRef = useRef<HTMLDivElement>(null) // 消息容器的引用
  const [, startTransition] = useTransition() // React 18 并发特性，用于优化滚动更新

  /**
   * 滚动到底部函数
   * @param force - 是否强制立即滚动（true: 立即滚动, false: 平滑滚动）
   */
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? 'auto' : 'smooth', // 滚动行为：立即或平滑
        block: 'end', // 滚动到元素底部
      })
    }
  }, [])

  /**
   * DeepSeek API 调用 Hook
   * 处理与AI的通信
   */
  const { isLoading, callAPI, stopGeneration } = useDeepSeekAPI()

  // ========== 本地状态管理 ==========
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // 侧边栏开关状态
  const [input, setInput] = useState('') // 用户输入内容

  // ========== 智能滚动控制逻辑 ==========

  /**
   * 1. 用户切换历史会话及用户进入界面时的滚动处理
   *
   * 触发时机：
   * - 用户点击侧边栏切换到其他会话
   * - 用户首次进入界面加载默认会话
   *
   * 行为：立即滚动到消息列表底部，显示最新消息
   */
  useEffect(() => {
    if (currentChatId) {
      // 使用 useTransition 优化滚动更新，避免阻塞用户交互
      // React 会在合适的时机执行滚动操作，确保消息已经渲染完成
      startTransition(() => {
        scrollToBottom(true) // 强制立即滚动，不使用平滑动画
      })
    }
  }, [currentChatId, scrollToBottom])

  /**
   * 2. AI响应期间的实时滚动处理
   *
   * 触发时机：
   * - AI正在生成回复时（isLoading = true）
   * - AI消息内容发生变化时（流式响应）
   *
   * 行为：实时滚动到底部，确保用户能看到最新生成的内容
   */
  useEffect(() => {
    if (isLoading && currentChat?.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        // AI响应期间实时滚动到底部，使用立即滚动避免延迟
        scrollToBottom(true)
      }
    }
  }, [
    currentChat?.messages?.[currentChat?.messages?.length - 1]?.content, // 监听最后一条消息的内容变化
    isLoading, // 监听加载状态
    scrollToBottom,
  ])

  /**
   * 3. 新消息添加时的滚动处理
   *
   * 触发时机：
   * - 用户发送新消息
   * - AI开始回复（添加空消息）
   * - 消息重新生成
   *
   * 行为：平滑滚动到底部，提供良好的视觉体验
   */
  useEffect(() => {
    if (currentChat?.messages.length) {
      // 使用 useTransition 优化滚动更新，提供更好的用户体验
      startTransition(() => {
        scrollToBottom() // 使用平滑滚动动画
      })
    }
  }, [currentChat?.messages.length, scrollToBottom])

  // ========== 用户交互事件处理函数 ==========

  /**
   * 用户消息提交处理函数
   *
   * 功能流程：
   * 1. 验证输入内容和API配置
   * 2. 添加用户消息到聊天记录
   * 3. 创建AI响应占位消息
   * 4. 调用AI API获取回复
   * 5. 处理错误情况
   *
   * @param e - 表单提交事件
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      // 防止重复提交：检查输入内容和加载状态
      if (!input.trim() || isLoading) return

      const userInput = input
      setInput('') // 立即清空输入框，提供即时反馈

      // 重置输入框高度到默认状态
      setTimeout(() => {
        const textarea = document.querySelector(
          'textarea[aria-label="消息输入框"]',
        ) as HTMLTextAreaElement
        if (textarea) {
          textarea.style.height = '48px'
        }
      }, 0)

      // 添加用户消息到聊天记录
      addMessage({
        type: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
      })

      // 添加AI空消息作为响应占位符
      // 这样用户可以立即看到AI开始响应的视觉反馈
      addMessage({
        type: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
      })

      // 发送消息后立即滚动到底部，确保用户看到新消息
      startTransition(() => {
        scrollToBottom(true) // 使用强制滚动，立即显示
      })

      try {
        // 调用AI API获取回复
        await callAPI(
          userInput, // 用户输入内容
          currentChat?.messages || [], // 当前会话的历史消息
          SYSTEM_ROLE, // 系统角色设定 使用默认
          updateLastMessage, // 更新最后一条消息的回调函数
        )
      } catch (error) {
        // 错误处理：记录错误并向用户显示友好的错误信息
        console.error('API调用失败:', error)
        updateLastMessage(
          '抱歉，处理您的请求时出错了。请检查网络连接和API设置。',
        )
      }
    },
    [
      input, // 用户输入内容
      isLoading, // API调用状态
      addMessage, // 添加消息函数
      callAPI, // API调用函数
      currentChat, // 当前聊天会话
      updateLastMessage, // 更新消息函数
      scrollToBottom, // 滚动函数
    ],
  )

  /**
   * 重新生成指定消息处理函数
   *
   * 功能流程：
   * 1. 验证当前会话和消息索引
   * 2. 截断消息历史到指定位置
   * 3. 创建新的AI响应占位消息
   * 4. 重新调用AI API生成回复
   * 5. 处理错误情况
   *
   * @param messageIndex - 要重新生成的消息索引（通常是用户消息的索引）
   */
  const handleRegenerate = useCallback(
    async (messageIndex: number) => {
      // 验证当前会话是否存在
      if (!currentChat) return

      // 获取要重新生成的用户消息
      const userMessage = currentChat.messages[messageIndex]
      if (!userMessage) return

      // 截断消息历史到指定位置，移除之后的所有消息
      // 这样可以重新生成从该位置开始的AI回复
      truncateMessagesTo(messageIndex)

      // 添加AI空消息作为新的响应占位符
      addMessage({
        type: 'ai',
        content: '',
        timestamp: new Date().toISOString(),
      })

      try {
        // 重新调用AI API生成回复
        await callAPI(
          userMessage.content, // 原始用户消息内容
          currentChat.messages.slice(0, messageIndex), // 截断后的消息历史
          SYSTEM_ROLE, // 系统角色设定 使用默认
          updateLastMessage, // 更新消息回调
        )
      } catch (error) {
        // 错误处理：记录错误并显示用户友好的错误信息
        console.error('重新生成失败:', error)
        updateLastMessage('重新生成失败，请稍后重试。')
      }
    },
    [
      currentChat, // 当前聊天会话
      truncateMessagesTo, // 截断消息函数
      addMessage, // 添加消息函数
      callAPI, // API调用函数
      updateLastMessage, // 更新消息函数
    ],
  )

  // ========== 主渲染 ==========
  return (
    <div className="flex h-screen w-full transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 侧边栏组件 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={chatId => {
          setCurrentChatId(chatId)
          setIsSidebarOpen(false)
        }}
        onRemoveChat={removeChat}
      />

      {/* 侧边栏遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 transition-all duration-300 bg-white/80  dark:bg-gray-900/80"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 主内容区域 */}
      <div className="flex flex-col w-full h-full">
        {/* 顶部导航栏 */}
        <div className="border-b border-gray-200/80 dark:border-gray-700/80  bg-white/80 dark:bg-gray-900/80 px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
              aria-label="打开侧边栏"
            >
              <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button
              onClick={() => createNewChat(SYSTEM_ROLE)}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 font-medium"
            >
              New Chat
            </button>
            <button
              onClick={() => createNewChat(SYSTEM_ROLE)}
              className="sm:hidden p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              aria-label="新建对话"
            >
              <FaRegPlusSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 消息列表 */}
        <div
          ref={messagesContainerRef}
          className="flex-1 px-2 sm:px-4 py-3 sm:py-4 bg-transparent w-full mx-auto max-w-5xl overflow-hidden"
          role="log"
          aria-label="聊天历史"
        >
          <div className="h-full overflow-y-auto">
            {currentChat?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-[95%] text-gray-500 dark:text-gray-400 overflow-hidden">
                <div className="text-center px-4">
                  <div className="text-4xl sm:text-5xl mb-4 animate-bounce">
                    👋
                  </div>
                  <div className="text-lg sm:text-xl font-medium mb-2">
                    开始新的对话吧！
                  </div>
                  <div className="text-sm sm:text-base text-gray-400 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
                    <div className="hidden sm:block">
                      下方输入框输入内容 开始聊天
                    </div>
                    <div className="sm:hidden">点击下方输入框开始聊天</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {currentChat?.messages.map((message, index) => (
                  <MessageItem
                    key={`${currentChatId}-${index}`}
                    message={message}
                    index={index}
                    isLoading={isLoading}
                    chats={chats}
                    currentChatId={currentChatId}
                    handleRegenerate={handleRegenerate}
                  />
                ))}
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200/80 dark:border-gray-700/80 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 p-3 sm:p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim() && !isLoading) {
                        handleSubmit(e as any)
                      }
                    }
                  }}
                  placeholder="在此输入消息..."
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-700 border border-gray-200 dark:border-gray-600 resize-none min-h-[48px] max-h-32 transition-all duration-200 shadow-sm hover:shadow-md text-base"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '48px',
                    overflow: 'hidden',
                  }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height =
                      Math.min(target.scrollHeight, 128) + 'px'
                  }}
                  aria-label="消息输入框"
                />
                {input.trim() && (
                  <div className="absolute right-3 bottom-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {input.length}
                  </div>
                )}
              </div>
              {isLoading ? (
                <button
                  onClick={stopGeneration}
                  type="button"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-3 sm:px-4 py-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 font-medium min-w-[48px] flex items-center justify-center"
                  aria-label="停止生成"
                >
                  <FiSquare className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl px-3 sm:px-4 py-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed font-medium min-w-[48px] flex items-center justify-center"
                  disabled={!input.trim() || isLoading}
                  aria-label="发送消息"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
