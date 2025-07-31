import { Request, Response, NextFunction } from 'express';
import { CustomError, ErrorFormatter, ErrorParser, ErrorFactory, ErrorCode } from '@/utils/errorHandler';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 生成请求ID用于错误追踪
  const requestId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  console.error(`[${requestId}] 全局错误处理器捕获异常:`, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    error: error
  });

  let customError: CustomError;

  // 如果已经是CustomError，直接使用
  if (error instanceof CustomError) {
    customError = error;
  } else {
    // 解析其他类型的错误
    customError = ErrorParser.parseError(error);
  }

  // 记录详细错误日志
  const errorLog = ErrorFormatter.formatErrorForLog(customError, requestId);
  console.error(`[${requestId}] 错误详情:`, errorLog);

  // 如果响应已经发送，则不能再发送响应
  if (res.headersSent) {
    console.error(`[${requestId}] 响应头已发送，无法发送错误响应`);
    return;
  }

  // 返回格式化的错误响应
  const errorResponse = ErrorFormatter.formatErrorResponse(customError);
  res.status(customError.httpStatus).json({
    ...errorResponse,
    requestId,
    path: req.path,
    method: req.method
  });
};

/**
 * 404错误处理中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = `404_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  console.warn(`[${requestId}] 404错误: ${req.method} ${req.path}`);
  
  const customError = new CustomError(
    `请求的路由不存在: ${req.method} ${req.path}`,
    ErrorCode.RESOURCE_NOT_FOUND,
    404,
    true,
    { path: req.path, method: req.method }
  );

  const errorResponse = ErrorFormatter.formatErrorResponse(customError);
  res.status(404).json({
    ...errorResponse,
    requestId,
    path: req.path,
    method: req.method
  });
};

/**
 * 异步错误包装器 - 用于包装异步路由处理器
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 请求日志中间件
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const startTime = Date.now();
  
  // 将requestId添加到请求对象中，供后续使用
  (req as any).requestId = requestId;
  
  console.log(`[${requestId}] ${req.method} ${req.path} - 开始处理请求`);
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * 请求体大小限制错误处理
 */
export const payloadTooLargeHandler = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.type === 'entity.too.large') {
    const customError = ErrorFactory.createValidationError(
      '请求体过大，请减少输入内容',
      { limit: error.limit, length: error.length }
    );
    
    const errorResponse = ErrorFormatter.formatErrorResponse(customError);
    res.status(413).json(errorResponse);
    return;
  }
  
  next(error);
};

/**
 * JSON解析错误处理
 */
export const jsonParseErrorHandler = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const customError = ErrorFactory.createJsonParseError(
      error.message || 'JSON数据格式错误'
    );
    
    const errorResponse = ErrorFormatter.formatErrorResponse(customError);
    res.status(400).json(errorResponse);
    return;
  }
  
  next(error);
};