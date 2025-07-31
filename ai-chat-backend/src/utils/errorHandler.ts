// ========== 自定义错误类型和状态码 ==========

/**
 * 自定义错误状态码枚举
 */
export enum ErrorCode {
  // 通用错误 (1000-1999)
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  MISSING_REQUIRED_FIELD = 1002,
  INVALID_REQUEST_FORMAT = 1003,
  
  // 网络和连接错误 (2000-2999)
  NETWORK_ERROR = 2000,
  CONNECTION_TIMEOUT = 2001,
  CONNECTION_REFUSED = 2002,
  DNS_RESOLUTION_FAILED = 2003,
  
  // API服务错误 (3000-3999)
  API_KEY_INVALID = 3000,
  API_KEY_MISSING = 3001,
  API_QUOTA_EXCEEDED = 3002,
  API_RATE_LIMITED = 3003,
  API_SERVICE_UNAVAILABLE = 3004,
  API_RESPONSE_INVALID = 3005,
  
  // DeepSeek特定错误 (4000-4999)
  DEEPSEEK_MODEL_ERROR = 4000,
  DEEPSEEK_TOKEN_LIMIT_EXCEEDED = 4001,
  DEEPSEEK_STREAM_ERROR = 4002,
  DEEPSEEK_COMPLETION_FAILED = 4003,
  
  // 数据处理错误 (5000-5999)
  JSON_PARSE_ERROR = 5000,
  DATA_FORMAT_ERROR = 5001,
  RESPONSE_EMPTY = 5002,
  STREAM_READ_ERROR = 5003,
  
  // 系统错误 (6000-6999)
  INTERNAL_SERVER_ERROR = 6000,
  SERVICE_UNAVAILABLE = 6001,
  RESOURCE_NOT_FOUND = 6002,
}

/**
 * 自定义异常类
 */
export class CustomError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly details?: any;

  constructor(
    message: string,
    code: ErrorCode,
    httpStatus: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 错误工厂函数 - 创建特定类型的错误
 */
export class ErrorFactory {
  // ========== 验证错误 ==========
  static createValidationError(message: string, details?: any): CustomError {
    return new CustomError(message, ErrorCode.VALIDATION_ERROR, 400, true, details);
  }

  static createMissingFieldError(fieldName: string): CustomError {
    return new CustomError(
      `必填字段缺失: ${fieldName}`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      400,
      true,
      { field: fieldName }
    );
  }

  // ========== 网络错误 ==========
  static createNetworkError(message: string, details?: any): CustomError {
    return new CustomError(message, ErrorCode.NETWORK_ERROR, 503, true, details);
  }

  static createTimeoutError(timeout: number): CustomError {
    return new CustomError(
      `请求超时 (${timeout}ms)`,
      ErrorCode.CONNECTION_TIMEOUT,
      408,
      true,
      { timeout }
    );
  }

  // ========== API错误 ==========
  static createApiKeyError(): CustomError {
    return new CustomError(
      'API密钥无效或缺失',
      ErrorCode.API_KEY_INVALID,
      401,
      true
    );
  }

  static createQuotaExceededError(): CustomError {
    return new CustomError(
      'API配额已用完',
      ErrorCode.API_QUOTA_EXCEEDED,
      429,
      true
    );
  }

  static createRateLimitError(retryAfter?: number): CustomError {
    return new CustomError(
      '请求频率过高，请稍后重试',
      ErrorCode.API_RATE_LIMITED,
      429,
      true,
      { retryAfter }
    );
  }

  // ========== DeepSeek特定错误 ==========
  static createDeepSeekModelError(modelName: string): CustomError {
    return new CustomError(
      `DeepSeek模型错误: ${modelName}`,
      ErrorCode.DEEPSEEK_MODEL_ERROR,
      400,
      true,
      { model: modelName }
    );
  }

  static createTokenLimitError(limit: number): CustomError {
    return new CustomError(
      `输入内容超过令牌限制 (${limit})`,
      ErrorCode.DEEPSEEK_TOKEN_LIMIT_EXCEEDED,
      400,
      true,
      { limit }
    );
  }

  static createStreamError(message: string): CustomError {
    return new CustomError(
      `流处理错误: ${message}`,
      ErrorCode.DEEPSEEK_STREAM_ERROR,
      500,
      true
    );
  }

  // ========== 数据处理错误 ==========
  static createJsonParseError(data: string): CustomError {
    return new CustomError(
      'JSON数据解析失败',
      ErrorCode.JSON_PARSE_ERROR,
      400,
      true,
      { data: data.substring(0, 100) } // 只保留前100个字符
    );
  }

  static createEmptyResponseError(): CustomError {
    return new CustomError(
      '服务器返回空响应',
      ErrorCode.RESPONSE_EMPTY,
      502,
      true
    );
  }

  // ========== 系统错误 ==========
  static createInternalError(message: string, details?: any): CustomError {
    return new CustomError(
      message,
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      false,
      details
    );
  }
}

/**
 * 错误解析器 - 将各种错误转换为CustomError
 */
export class ErrorParser {
  /**
   * 解析OpenAI/DeepSeek API错误
   */
  static parseOpenAIError(error: any): CustomError {
    const status = error.status || error.response?.status;
    const message = error.message || error.response?.data?.error?.message || '未知API错误';
    const errorType = error.response?.data?.error?.type;

    // 根据HTTP状态码和错误类型判断
    switch (status) {
      case 400:
        if (errorType === 'invalid_request_error') {
          return ErrorFactory.createValidationError(message, { originalError: error });
        }
        return ErrorFactory.createDeepSeekModelError(message);
      
      case 401:
        return ErrorFactory.createApiKeyError();
      
      case 429:
        const retryAfter = error.response?.headers?.['retry-after'];
        return ErrorFactory.createRateLimitError(retryAfter);
      
      case 502:
      case 503:
      case 504:
        return new CustomError(
          'DeepSeek服务暂时不可用',
          ErrorCode.API_SERVICE_UNAVAILABLE,
          status,
          true,
          { originalError: error }
        );
      
      default:
        return ErrorFactory.createInternalError(message, { originalError: error });
    }
  }

  /**
   * 解析网络错误
   */
  static parseNetworkError(error: any): CustomError {
    const code = error.code;
    const message = error.message;

    switch (code) {
      case 'ECONNREFUSED':
        return new CustomError(
          '连接被拒绝，服务器可能不可用',
          ErrorCode.CONNECTION_REFUSED,
          503,
          true,
          { originalError: error }
        );
      
      case 'ENOTFOUND':
        return new CustomError(
          'DNS解析失败，请检查网络连接',
          ErrorCode.DNS_RESOLUTION_FAILED,
          503,
          true,
          { originalError: error }
        );
      
      case 'ETIMEDOUT':
        return ErrorFactory.createTimeoutError(error.timeout || 30000);
      
      default:
        return ErrorFactory.createNetworkError(`网络错误: ${message}`, { originalError: error });
    }
  }

  /**
   * 通用错误解析器
   */
  static parseError(error: any): CustomError {
    // 如果已经是CustomError，直接返回
    if (error instanceof CustomError) {
      return error;
    }

    // 解析OpenAI相关错误
    if (error.response || error.status) {
      return this.parseOpenAIError(error);
    }

    // 解析网络错误
    if (error.code && typeof error.code === 'string') {
      return this.parseNetworkError(error);
    }

    // 解析JSON错误
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return ErrorFactory.createJsonParseError(error.message);
    }

    // 默认内部错误
    return ErrorFactory.createInternalError(
      error.message || '未知系统错误',
      { originalError: error }
    );
  }
}

/**
 * 错误响应格式化器
 */
export class ErrorFormatter {
  /**
   * 格式化错误响应
   */
  static formatErrorResponse(error: CustomError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        ...(error.details && { details: error.details })
      }
    };
  }

  /**
   * 格式化用于日志的错误信息
   */
  static formatErrorForLog(error: CustomError, requestId?: string) {
    return {
      requestId,
      errorCode: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      timestamp: error.timestamp,
      stack: error.stack,
      details: error.details,
      isOperational: error.isOperational
    };
  }
}