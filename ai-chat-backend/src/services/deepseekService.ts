import { OpenAI } from "openai"
import { ErrorParser, ErrorFactory, CustomError, ErrorCode } from "@/utils/errorHandler"
import { ChatMessage, ChatOptions } from "@/types"

// ========== 配置验证 ==========
const validateConfig = () => {
  if (!process.env.DEEPSEEK_API_URL) {
    throw ErrorFactory.createMissingFieldError("DEEPSEEK_API_URL")
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    throw ErrorFactory.createApiKeyError()
  }
  if (!process.env.DEEPSEEK_MODEL) {
    throw ErrorFactory.createMissingFieldError("DEEPSEEK_MODEL")
  }
}

// 验证配置
validateConfig()

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
  timeout: 30000, // 30秒超时
})

/**
 * 验证消息格式
 */
const validateMessages = (messages: ChatMessage[]): void => {
  if (!messages || !Array.isArray(messages)) {
    throw ErrorFactory.createValidationError("消息必须是数组格式")
  }

  if (messages.length === 0) {
    throw ErrorFactory.createValidationError("消息数组不能为空")
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (!message.role || !message.content) {
      throw ErrorFactory.createValidationError(`消息格式错误，第${i + 1}条消息缺少必要字段`, {
        messageIndex: i,
        message,
      })
    }

    if (!["system", "user", "assistant"].includes(message.role)) {
      throw ErrorFactory.createValidationError(`消息角色无效: ${message.role}`, {
        messageIndex: i,
        invalidRole: message.role,
      })
    }

    if (typeof message.content !== "string" || message.content.trim().length === 0) {
      throw ErrorFactory.createValidationError(`消息内容不能为空，第${i + 1}条消息`, {
        messageIndex: i,
      })
    }

    // 检查内容长度限制
    if (message.content.length > 32000) {
      throw ErrorFactory.createTokenLimitError(32000)
    }
  }
}

/**
 * 创建文本补全
 */
export const createCompletion = async (
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<string> => {
  try {
    // ========== 输入验证 ==========
    validateMessages(messages)

    console.log(`[DeepSeek] 开始文本补全请求，消息数量: ${messages.length}`)

    // ========== API调用 ==========
    const completion = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL as string,
      messages: messages,
      max_tokens: options?.maxTokens || 3000,
      temperature: options?.temperature || 0.7,
    })

    // ========== 响应验证 ==========
    if (!completion) {
      throw ErrorFactory.createEmptyResponseError()
    }

    if (!completion.choices || completion.choices.length === 0) {
      throw new CustomError(
        "DeepSeek返回空的选择列表",
        ErrorCode.DEEPSEEK_COMPLETION_FAILED,
        502,
        true,
        { completion },
      )
    }

    const choice = completion.choices[0]
    if (!choice.message || !choice.message.content) {
      throw new CustomError("DeepSeek返回空内容", ErrorCode.RESPONSE_EMPTY, 502, true, { choice })
    }

    console.log(`[DeepSeek] 文本补全成功，返回内容长度: ${choice.message.content.length}`)
    return choice.message.content
  } catch (error: any) {
    // ========== 异常处理 ==========
    console.error("[DeepSeek] 文本补全失败:", error)

    // 如果已经是CustomError，直接抛出
    if (error instanceof CustomError) {
      throw error
    }

    // 解析并转换错误
    const customError = ErrorParser.parseError(error)
    throw customError
  }
}

/**
 * 创建流式补全
 */
export const createStreamingCompletion = async (messages: ChatMessage[], options?: ChatOptions) => {
  try {
    // ========== 输入验证 ==========
    validateMessages(messages)

    console.log(`[DeepSeek] 开始流式补全请求，消息数量: ${messages.length}`)

    // ========== API调用 ==========
    const stream = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL as string,
      messages: messages,
      stream: true,
      max_tokens: options?.maxTokens || 3000,
      temperature: options?.temperature || 0.7,
    })

    // ========== 流验证 ==========
    if (!stream) {
      throw ErrorFactory.createEmptyResponseError()
    }

    console.log("[DeepSeek] 流式补全连接建立成功")
    return stream
  } catch (error: any) {
    // ========== 异常处理 ==========
    console.error("[DeepSeek] 流式补全失败:", error)

    // 如果已经是CustomError，直接抛出
    if (error instanceof CustomError) {
      throw error
    }

    // 解析并转换错误
    const customError = ErrorParser.parseError(error)
    throw customError
  }
}

/**
 * 健康检查 - 测试DeepSeek服务连接
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const testMessages: ChatMessage[] = [{ role: "user", content: "Hello" }]

    const completion = await openai.chat.completions.create({
      messages: testMessages,
      model: process.env.DEEPSEEK_MODEL as string,
      max_tokens: 10,
    })

    return !!(completion && completion.choices && completion.choices.length > 0)
  } catch (error) {
    console.error("[DeepSeek] 健康检查失败:", error)
    return false
  }
}
