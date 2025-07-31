import express from "express"
import { chatWithDeepseek, chatWithStreamDeepseek, healthCheck } from "@/controller/aiController"
import { asyncHandler } from "@/middleware/errorMiddleware"

const aiRouter = express.Router()

// ========== AI聊天接口 ==========
aiRouter.post("/chat-deepseek", asyncHandler(chatWithDeepseek))
aiRouter.post("/chat-stream-deepseek", asyncHandler(chatWithStreamDeepseek))

// ========== 健康检查接口 ==========
aiRouter.get("/health", asyncHandler(healthCheck))

export default aiRouter
