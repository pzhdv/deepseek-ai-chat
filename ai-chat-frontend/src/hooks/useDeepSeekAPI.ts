import { useState, useCallback } from 'react'
import type { Message } from '@/types'

/**
 * DeepSeek API Hook
 */
export function useDeepSeekAPI() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
  const SYSTEM_ROLE =
    import.meta.env.VITE_SYSTEM_ROLE || 'You are a helpful assistant.'

  const [isLoading, setIsLoading] = useState(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }, [abortController])

  // 调用 API
  const callAPI = useCallback(
    async (
      userMessage: string,
      chatHistory: Message[],
      systemRole: string | undefined,
      onPartialResponse: (response: string) => void,
    ) => {
      setIsLoading(true)
      const controller = new AbortController()
      setAbortController(controller)
      let fullResponse = ''

      try {
        const response = await fetch(
          `${API_BASE_URL}/ai/chat-stream-deepseek `,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: systemRole || SYSTEM_ROLE,
                },
                ...chatHistory.map(msg => ({
                  role: msg.type === 'user' ? 'user' : 'assistant',
                  content: msg.content,
                })),
                { role: 'user', content: userMessage },
              ],
            }),
            signal: controller.signal,
          },
        )

        // ========== HTTP状态码异常处理 ==========
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`,
          )
        }

        // ========== 流读取异常处理 ==========
        if (!response.body) {
          throw new Error('响应体为空，无法读取流数据')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          // 持续读取流数据
          while (true) {
            const { done, value } = await reader.read() // 读取数据块
            if (done) break // 流结束时退出循环

            // ========== 数据解码异常处理 ==========
            let chunk
            try {
              chunk = decoder.decode(value)
            } catch (decodeError) {
              console.error('数据解码失败:', decodeError)
              continue // 跳过当前数据块，继续处理下一个
            }

            const lines = chunk.split('\n').filter(l => l.trim())

            // 处理每一行数据
            for (const line of lines) {
              const message = line.replace(/^data: /, '') // 移除SSE格式前缀
              if (message === '[DONE]') break // 检查结束标志

              // ========== JSON解析异常处理 ==========
              try {
                const data = JSON.parse(message)

                // ========== 数据格式验证 ==========
                if (!data || typeof data.content === 'undefined') {
                  console.warn('数据格式异常:', data)
                  continue // 跳过格式异常的数据
                }

                fullResponse += data.content // 累加完整响应内容
                // 调用回调函数处理部分响应
                onPartialResponse(fullResponse)
              } catch (parseError) {
                console.error('JSON解析错误:', parseError, '原始数据:', message)
                // 继续处理下一行数据，不中断整个流程
              }
            }
          }
          return fullResponse
        } finally {
          // 确保释放流读取器资源
          reader.releaseLock()
        }
      } catch (error: any) {
        // ========== 统一异常处理 ==========
        console.error('流式请求异常:', error)

        // 排除用户主动中断的情况
        if (error.name === 'AbortError') {
          console.log('用户取消了请求')
          return
        }

        let errorMessage = '流式请求失败'

        // 网络连接异常
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络连接'
        }
        // HTTP状态码异常
        else if (error.message.includes('HTTP')) {
          errorMessage = `服务器错误: ${error.message}`
        }
        // 流读取异常
        else if (error.message.includes('响应体为空')) {
          errorMessage = '服务器未返回流数据'
        }
        // 数据完整性异常
        else if (error.message.includes('未收到有效的响应数据')) {
          errorMessage = '服务器响应数据为空'
        }
        // 其他未知异常
        else {
          errorMessage = `流处理错误: ${error.message}`
        }
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
        setAbortController(null)
      }
    },
    [abortController],
  )

  return {
    isLoading,
    callAPI,
    stopGeneration,
  }
}
