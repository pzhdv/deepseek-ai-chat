# 基于 TypeScript + Express + DeepSeek API 的 AI 聊天后端服务

## 🚀 项目简介

这是一个现代化的 AI 聊天后端服务，集成了 DeepSeek API，提供文本聊天和流式聊天功能。项目采用 TypeScript 开发，具有完整的错误处理、日志记录和类型安全保障。

## ✨ 主要特性

- 🤖 **DeepSeek API 集成** - 支持最新的 DeepSeek 模型
- 💬 **双模式聊天** - 支持普通文本聊天和实时流式聊天
- 🔒 **类型安全** - 完整的 TypeScript 类型定义
- 🛡️ **错误处理** - 统一的错误处理机制和自定义错误类型
- 📝 **请求日志** - 详细的请求追踪和日志记录
- 🌐 **CORS 支持** - 完整的跨域资源共享配置
- 🎯 **参数验证** - 严格的输入验证和参数检查
- 📊 **健康检查** - 服务健康状态监控
- 🎨 **演示页面** - 内置的聊天演示界面

## 🏗️ 项目结构

```
src/
├── config/          # 配置文件
│   └── env.ts       # 环境变量配置
├── controller/      # 控制器层
│   └── aiController.ts
├── middleware/      # 中间件
│   └── errorMiddleware.ts
├── routes/          # 路由定义
│   ├── index.ts
│   └── aiRouter.ts
├── services/        # 服务层
│   └── deepseekService.ts
├── types/           # 类型定义
│   └── index.ts
├── utils/           # 工具函数
│   └── errorHandler.ts
├── app.ts           # Express 应用配置
└── index.ts         # 应用入口
```

## 🛠️ 技术栈

- **运行时**: Node.js
- **语言**: TypeScript
- **框架**: Express.js
- **AI API**: DeepSeek API (OpenAI 兼容)
- **构建工具**: Babel
- **开发工具**: Nodemon, ts-node

## 📦 安装依赖

```bash
npm install
```

## ⚙️ 环境变量配置

### 必需变量

| 变量名             | 描述                  | 示例值                     | 必需 |
| ------------------ | --------------------- | -------------------------- | ---- |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥     | `sk-xxx...`                | ✅    |
| `DEEPSEEK_API_URL` | DeepSeek API 基础 URL | `https://api.deepseek.com` | ✅    |
| `DEEPSEEK_MODEL`   | 使用的模型名称        | `deepseek-chat`            | ✅    |

### 可选变量

| 变量名        | 描述           | 默认值 | 示例值                  |
| ------------- | -------------- | ------ | ----------------------- |
| `SERVER_PORT` | 服务器端口     | `4000` | `3000`                  |
| `CORS_ORIGIN` | 允许的跨域源   | `*`    | `http://localhost:3000` |
| `BODY_LIMIT`  | 请求体大小限制 | `10mb` | `5mb`                   |

创建环境配置文件：

### `.env.example` (示例配置)
```env
# ========== DeepSeek API 配置 ==========
# 必需配置 - 从 DeepSeek 官网获取
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# ========== 服务器配置 ==========
# 服务器端口（可选，默认为3000）
SERVER_PORT=4000

# ========== CORS 配置 ==========
# 允许的跨域源（可选，默认为 *），生产环境建议设置具体域名
CORS_ORIGIN=*
# 多个域名示例: CORS_ORIGIN=http://localhost:3000,https://yourdomain.com

# ========== 请求配置 ==========
# 请求体大小限制（可选，默认为 10mb）
BODY_LIMIT=10mb
```

### `.env.development` (开发环境)
```env
# 开发环境配置
```

### `.env.production` (生产环境)
```env
# 生产环境配置
```

## 🚀 启动服务

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm run prod
```

### 构建项目
```bash
npm run build
npm start
```

## 📡 API 接口

### 基础路径
- 开发环境: `http://localhost:4000`
- 生产环境: `http://localhost:3000`

### 接口列表

#### 1. 健康检查 (根路径)
```http
GET /health
```

**描述**: 检查服务整体健康状态

**请求参数**: 无

**响应示例:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "DeepSeek Chat API",
  "version": "1.0.0"
}
```

#### 2. 健康检查 (API路径)
```http
GET /api/ai/health
```

**描述**: 检查 AI 服务健康状态

**请求参数**: 无

**响应示例:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "req_1704067200000_abc123"
}
```

#### 3. 文本聊天
```http
POST /api/ai/chat-deepseek
```

**描述**: 发送消息给 DeepSeek AI，获取完整回复

**请求头:**
```http
Content-Type: application/json
```

**请求体:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是一个有用的AI助手"
    },
    {
      "role": "user", 
      "content": "你好，请介绍一下自己"
    },
    {
      "role": "assistant",
      "content": "你好！我是DeepSeek..."
    },
    {
      "role": "user",
      "content": "你能帮我做什么？"
    }
  ],
  "options": {
    "maxTokens": 3000,
    "temperature": 0.7
  }
}
```

**请求参数说明:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| messages | Array | ✅ | 对话消息数组 |
| messages[].role | String | ✅ | 消息角色: `system`/`user`/`assistant` |
| messages[].content | String | ✅ | 消息内容，不能为空，最大32000字符 |
| options | Object | ❌ | 可选配置参数 |
| options.maxTokens | Number | ❌ | 最大生成令牌数，默认3000，范围1-4000 |
| options.temperature | Number | ❌ | 温度参数，默认0.7，范围0.0-2.0 |

**成功响应 (200):**
```json
{
  "success": true,
  "data": "你好！我是DeepSeek，一个AI助手。我可以帮助你回答问题、提供信息、协助思考问题等。有什么我可以为你做的吗？",
  "requestId": "req_1704067200000_abc123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**错误响应示例:**
```json
{
  "success": false,
  "error": "参数验证失败",
  "code": "VALIDATION_ERROR",
  "message": "messages数组不能为空",
  "requestId": "req_1704067200000_abc123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 4. 流式聊天
```http
POST /api/ai/chat-stream-deepseek
```

**描述**: 发送消息给 DeepSeek AI，获取实时流式回复

**请求头:**
```http
Content-Type: application/json
Accept: text/event-stream
```

**请求体:** (与文本聊天相同)
```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是一个有用的AI助手"
    },
    {
      "role": "user",
      "content": "请写一首关于春天的诗"
    }
  ],
  "options": {
    "maxTokens": 2000,
    "temperature": 0.8
  }
}
```

**响应格式:** Server-Sent Events (SSE)

**响应头:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**响应流示例:**
```
data: {"content": "春"}

data: {"content": "风"}

data: {"content": "轻"}

data: {"content": "抚"}

data: {"content": "柳"}

data: {"content": "絮"}

data: {"content": "飞"}

data: {"content": "，"}

data: {"content": "\n"}

data: {"content": "桃"}

data: {"content": "花"}

data: {"content": "朵"}

data: {"content": "朵"}

data: {"content": "笑"}

data: {"content": "春"}

data: {"content": "晖"}

data: {"content": "。"}

data: [DONE]
```

**流式错误响应:**
```
data: {"error": "API调用失败", "code": "DEEPSEEK_API_ERROR"}
```

### 消息格式

#### ChatMessage
```typescript
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

#### ChatOptions
```typescript
interface ChatOptions {
  maxTokens?: number;    // 最大令牌数，默认 3000
  temperature?: number;  // 温度参数，默认 0.7
}
```

## 🎨 演示页面

项目内置了演示页面，启动服务后访问：

- **主页**: `http://localhost:4000/`
- **文本聊天演示**: `http://localhost:4000/基于文本.html`
- **流式聊天演示**: `http://localhost:4000/基于流.html`

## 🙏 致谢

感谢以下开源项目和贡献者：

- [DeepSeek](https://www.deepseek.com/) - 提供强大的AI模型服务
- [OpenAI SDK](https://github.com/openai/openai-node) - 优秀的API客户端
- [Express.js](https://expressjs.com/) - 快速、极简的Web框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- 所有为本项目做出贡献的开发者

## 🔗 相关链接

- [DeepSeek 官网](https://www.deepseek.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [Express.js 文档](https://expressjs.com/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Node.js 文档](https://nodejs.org/docs/)

---

如果这个项目对您有帮助，请给个 ⭐️ 支持一下！
