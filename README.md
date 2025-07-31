# AI聊天应用 🤖

一个基于 React + Express + DeepSeek API 构建的现代化AI聊天应用，支持多会话管理、流式响应和智能交互体验。

## ✨ 功能特性

- 🤖 **智能对话**：集成 DeepSeek API，提供高质量的AI对话体验
- 💬 **多会话管理**：支持创建、切换和删除多个聊天会话
- 🔄 **流式响应**：实时显示AI回复内容，提供流畅的交互体验
- 🎨 **主题切换**：支持深色/浅色主题，适应不同使用场景
- 📱 **响应式设计**：完美适配桌面端和移动端设备
- ✨ **Markdown支持**：消息内容支持Markdown格式和代码高亮
- 💾 **本地存储**：聊天记录自动保存在浏览器本地
- 🔄 **消息重新生成**：支持重新生成AI回复
- ⚡ **智能滚动**：自动滚动到最新消息，优化阅读体验

## 🏗️ 技术架构

### 技术栈

**前端技术栈：**
- **React 19** + **TypeScript** - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS 4** - 原子化CSS框架
- **react-markdown** - Markdown内容渲染
- **react-syntax-highlighter** - 代码语法高亮
- **react-icons** - 图标组件库

**后端技术栈：**
- **Express** + **TypeScript** - Node.js Web框架
- **OpenAI SDK** - 调用DeepSeek API
- **CORS** - 跨域资源共享
- **Babel** - JavaScript编译器

## 📁 项目结构

```
├── ai-chat-frontend/           # 前端项目
│   ├── src/
│   │   ├── components/         # React组件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── MessageActions.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── hooks/              # 自定义Hooks
│   │   │   ├── useChatManager.ts
│   │   │   ├── useDeepSeekAPI.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── context/            # React Context
│   │   ├── types/              # TypeScript类型定义
│   │   └── App.tsx             # 主应用组件
│   ├── package.json
│   └── vite.config.ts
│
├── ai-chat-backend/            # 后端项目
│   ├── src/
│   │   ├── config/             # 配置管理
│   │   ├── controller/         # 控制器层
│   │   ├── middleware/         # 中间件
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 服务层
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── app.ts              # Express应用配置
│   │   └── index.ts            # 应用入口
│   └── package.json
│
└── README.md                   # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- DeepSeek API Key

### 1. 克隆项目

```bash
git clone https://github.com/pzhdv/deepseek-ai-chat.git
cd ai-chat-app
```

### 2. 后端配置

```bash
# 进入后端目录
cd ai-chat-backend

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，配置必要参数
```

**后端环境配置 (.env)：**
```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 服务器配置
SERVER_PORT=4000

# CORS 配置
CORS_ORIGIN=*

# 请求配置
BODY_LIMIT=10mb
```

### 3. 前端配置

```bash
# 进入前端目录
cd ai-chat-frontend

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，配置API地址
```

**前端环境配置 (.env)：**
```env
# 系统配置
VITE_SYS_TITLE=AI交互
VITE_SYS_BASE=/AI/

# API配置
VITE_API_BASE_URL=http://localhost:4000/api

# 系统角色
VITE_SYSTEM_ROLE=You are a helpful assistant.
```

### 4. 启动应用

**启动后端服务：**
```bash
cd ai-chat-backend
npm run dev
```

**启动前端服务：**
```bash
cd ai-chat-frontend
npm run dev
```

访问 `http://localhost:3000` 开始使用！

## 📝 API文档

### 后端API接口

#### 1. 健康检查
```http
GET /health
```

#### 2. 普通聊天
```http
POST /api/ai/chat-deepseek
Content-Type: application/json

{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Hello!"
    }
  ],
  "options": {
    "maxTokens": 3000,
    "temperature": 0.7
  }
}
```

#### 3. 流式聊天
```http
POST /api/ai/chat-stream-deepseek
Content-Type: application/json

{
  "messages": [...],
  "options": {...}
}
```

响应格式（Server-Sent Events）：
```
data: {"content": "Hello"}
data: {"content": " there"}
data: [DONE]
```

## 🛠️ 开发指南

### 前端开发

**可用脚本：**
```bash
npm run dev          # 开发模式
npm run build:dev    # 开发环境构建
npm run build:prod   # 生产环境构建
npm run lint         # 代码检查
npm run lint:fix     # 自动修复代码问题
npm run format       # 代码格式化
```

**核心Hooks：**

- `useChatManager` - 聊天会话管理
- `useDeepSeekAPI` - API调用和流式响应处理
- `useLocalStorage` - 本地存储管理

### 后端开发

**可用脚本：**
```bash
npm run dev     # 开发模式（热重载）
npm run build   # 构建项目
npm run start   # 生产模式启动
```

**项目架构：**

- `controller/` - 处理HTTP请求
- `services/` - 业务逻辑层
- `middleware/` - 中间件
- `routes/` - 路由定义
- `config/` - 配置管理

## 🎯 核心功能实现

### 1. 流式响应处理

使用Server-Sent Events实现实时AI回复：

```typescript
// 后端流式响应
const stream = await openai.chat.completions.create({
  model: 'deepseek-chat',
  messages: formattedMessages,
  stream: true
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || ''
  if (content) {
    res.write(`data: ${JSON.stringify({ content })}\n\n`)
  }
}
```

### 2. 智能滚动控制

利用React 18的useTransition优化滚动体验：

```typescript
// 切换会话时立即滚动
useEffect(() => {
  if (currentChatId) {
    startTransition(() => {
      scrollToBottom(true)
    })
  }
}, [currentChatId])

// AI响应期间实时滚动
useEffect(() => {
  if (isLoading && lastMessage?.type === 'ai') {
    scrollToBottom(true)
  }
}, [lastMessage?.content, isLoading])
```

### 3. 本地存储管理

自定义Hook管理聊天记录：

```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  // ... 存储逻辑
}
```

## 🎨 界面预览

### 桌面端界面
- 左侧边栏：会话列表和管理
- 主聊天区：消息显示和输入
- 顶部导航：主题切换和新建会话

### 移动端适配
- 响应式侧边栏（抽屉式）
- 优化的触摸交互
- 自适应输入框高度


## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供强大的AI API服务
- [React](https://reactjs.org/) - 优秀的前端框架
- [Express](https://expressjs.com/) - 简洁的Node.js框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！