import { Request, Response } from "express"
import { createCompletion, createStreamingCompletion } from "@/services/deepseekService"
import { CustomError, ErrorFactory, ErrorFormatter, ErrorParser } from "@/utils/errorHandler"

/**
 * 生成请求ID用于日志追踪
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 验证请求体中的messages字段
 */
const validateRequestMessages = (messages: any): void => {
  if (!messages) {
    throw ErrorFactory.createMissingFieldError("messages")
  }

  if (!Array.isArray(messages)) {
    throw ErrorFactory.createValidationError("messages必须是数组格式")
  }

  if (messages.length === 0) {
    throw ErrorFactory.createValidationError("messages数组不能为空")
  }
}

/**
 * 文本聊天接口
 */
export const chatWithDeepseek = async (req: Request, res: Response) => {
  const requestId = generateRequestId()

  try {
    console.log(`[${requestId}] 开始处理文本聊天请求`)

    // ========== 请求验证 ==========
    const { messages, options } = req.body
    validateRequestMessages(messages)

    console.log(`[${requestId}] 请求验证通过，消息数量: ${messages.length}`)
    console.log(`[${requestId}] 正在向DeepSeek发送请求...`)

    // ========== 调用服务 ==========
    const response = await createCompletion(messages, options)

    console.log(`[${requestId}] DeepSeek响应成功，内容长度: ${response.length}`)

    // ========== 成功响应 ==========
    return res.status(200).json({
      success: true,
      data: response,
      requestId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    // ========== 异常处理 ==========
    console.error(`[${requestId}] 文本聊天请求失败:`, error)

    let customError: CustomError

    // 如果已经是CustomError，直接使用
    if (error instanceof CustomError) {
      customError = error
    } else {
      // 解析其他类型的错误
      customError = ErrorParser.parseError(error)
    }

    // 记录详细错误日志
    const errorLog = ErrorFormatter.formatErrorForLog(customError, requestId)
    console.error(`[${requestId}] 错误详情:`, errorLog)

    // 返回格式化的错误响应
    const errorResponse = ErrorFormatter.formatErrorResponse(customError)
    return res.status(customError.httpStatus).json({
      ...errorResponse,
      requestId,
    })
  }
}

/**
 * 流式聊天接口
 */
export const chatWithStreamDeepseek = async (req: Request, res: Response) => {
  const requestId = generateRequestId()
  let streamStarted = false

  try {
    console.log(`[${requestId}] 开始处理流式聊天请求`)

    // ========== 请求验证 ==========
    const { messages, options } = req.body
    validateRequestMessages(messages)

    console.log(`[${requestId}] 请求验证通过，消息数量: ${messages.length}`)
    console.log(`[${requestId}] 正在向DeepSeek发送流式请求...`)

    // ========== 调用服务 ==========
    const stream = await createStreamingCompletion(messages, options)

    // ========== 设置流式响应头 ==========
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Cache-Control")

    streamStarted = true
    console.log(`[${requestId}] 流式连接建立成功，开始传输数据`)

    let chunkCount = 0
    let totalContent = ""

    // ========== 处理流式数据 ==========
    try {
      for await (const chunk of stream) {
        // 检查客户端是否断开连接
        if (res.destroyed) {
          console.log(`[${requestId}] 客户端断开连接，停止流传输`)
          break
        }

        const choice = chunk.choices[0]
        if (!choice) {
          console.warn(`[${requestId}] 收到空的choice，跳过此chunk`)
          continue
        }

        // 检查流是否结束
        if (choice.finish_reason) {
          console.log(`[${requestId}] 流结束，原因: ${choice.finish_reason}`)
          break
        }

        const content = choice.delta?.content || ""
        if (content) {
          totalContent += content
          chunkCount++

          // 发送数据块
          const data = JSON.stringify({ content })
          res.write(`data: ${data}\n\n`)
        }
      }

      // 发送结束标志
      res.write(`data: [DONE]\n\n`)
      res.end()

      console.log(
        `[${requestId}] 流式响应完成，总chunk数: ${chunkCount}，总内容长度: ${totalContent.length}`,
      )
    } catch (streamError: any) {
      // ========== 流处理异常 ==========
      console.error(`[${requestId}] 流处理过程中出错:`, streamError)

      if (!res.destroyed) {
        const customError = ErrorParser.parseError(streamError)
        const errorData = JSON.stringify({
          error: customError.message,
          code: customError.code,
        })
        res.write(`data: ${errorData}\n\n`)
        res.end()
      }
    }
  } catch (error: any) {
    // ========== 初始化异常处理 ==========
    console.error(`[${requestId}] 流式聊天初始化失败:`, error)

    let customError: CustomError

    // 如果已经是CustomError，直接使用
    if (error instanceof CustomError) {
      customError = error
    } else {
      // 解析其他类型的错误
      customError = ErrorParser.parseError(error)
    }

    // 记录详细错误日志
    const errorLog = ErrorFormatter.formatErrorForLog(customError, requestId)
    console.error(`[${requestId}] 错误详情:`, errorLog)

    // 如果流还没开始，返回JSON错误响应
    if (!streamStarted) {
      const errorResponse = ErrorFormatter.formatErrorResponse(customError)
      return res.status(customError.httpStatus).json({
        ...errorResponse,
        requestId,
      })
    } else {
      // 如果流已经开始，通过SSE发送错误
      if (!res.destroyed) {
        const errorData = JSON.stringify({
          error: customError.message,
          code: customError.code,
        })
        res.write(`data: ${errorData}\n\n`)
        res.end()
      }
    }
  }
}

/**
 * 健康检查接口
 */
export const healthCheck = async (_req: Request, res: Response) => {
  const requestId = generateRequestId()

  try {
    console.log(`[${requestId}] 开始健康检查`)

    // 这里可以添加更多的健康检查逻辑
    const isHealthy = true // 简单的健康检查

    if (isHealthy) {
      return res.status(200).json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        requestId,
      })
    } else {
      throw ErrorFactory.createInternalError("服务不健康")
    }
  } catch (error: any) {
    console.error(`[${requestId}] 健康检查失败:`, error)

    const customError = error instanceof CustomError ? error : ErrorParser.parseError(error)
    const errorResponse = ErrorFormatter.formatErrorResponse(customError)

    return res.status(customError.httpStatus).json({
      ...errorResponse,
      requestId,
    })
  }
}
