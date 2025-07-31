import express, { Application } from "express"
import bodyParser from "body-parser" // 表单解析
import cors from "cors" // 跨域
import appRouter from "@/routes"
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  payloadTooLargeHandler,
  jsonParseErrorHandler,
} from "@/middleware/errorMiddleware"

const app: Application = express() // app实例

// ========== 请求日志中间件 ==========
app.use(requestLogger)

// ========== 静态文件服务 ==========
app.use(express.static("./public")) // 设置静态目录

// ========== CORS配置 ==========
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // 允许的源
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // 允许携带凭证
  }),
)

// ========== 请求体解析配置 ==========
// 配置请求体大小限制
const bodyLimit = process.env.BODY_LIMIT || "10mb"

app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: bodyLimit,
  }),
) // 解析 post 表单数据的中间件

app.use(
  bodyParser.json({
    limit: bodyLimit,
  }),
) // 解析 application/json

// ========== JSON解析错误处理 ==========
app.use(jsonParseErrorHandler)

// ========== 请求体过大错误处理 ==========
app.use(payloadTooLargeHandler)

// ========== API路由 ==========
app.use("/api", appRouter)

// ========== 健康检查根路由 ==========
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "DeepSeek Chat API",
    version: process.env.npm_package_version || "1.0.0",
  })
})

// ========== 404错误处理 ==========
app.use(notFoundHandler)

// ========== 全局错误处理中间件 ==========
app.use(errorHandler)

export default app
