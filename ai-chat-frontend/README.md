# 基于 React + TypeScript 构建的 AI 聊天界面

## 效果演示

![演示图AI.gif](./demo/AI.gif)

## 功能特性

- 🤖 **AI 对话交互** - 支持与 AI 助手进行自然语言对话
- 💬 **多会话管理** - 创建、切换和删除多个聊天会话
- 🔄 **流式响应** - 实时显示 AI 回复内容，提供流畅的交互体验
- 🎨 **深色/浅色主题** - 支持主题切换，适应不同使用环境
- 📱 **响应式设计** - 完美适配桌面端和移动端设备
- ✨ **Markdown 渲染** - 支持代码高亮、表格、链接等丰富内容格式
- 🔧 **消息操作** - 支持重新生成回复、复制消息等功能
- 💾 **本地存储** - 自动保存聊天记录到本地存储
- 🎯 **智能滚动** - 自动滚动到最新消息，优化阅读体验

## 技术栈

### 核心框架

- **React 19** - 前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化构建工具

### UI 和样式

- **Tailwind CSS 4** - 原子化 CSS 框架
- **React Icons** - 图标库

### Markdown 处理

- **react-markdown** - Markdown 渲染
- **react-syntax-highlighter** - 代码语法高亮
- **remark-gfm** - GitHub 风格 Markdown 支持
- **rehype-sanitize** - HTML 内容安全处理
- **rehype-external-links** - 外部链接处理

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks 管理
- **lint-staged** - 暂存文件检查
- **Commitizen** - 规范化提交信息

### 构建优化

- **vite-plugin-compression** - Gzip/Brotli 压缩
- **rollup-plugin-visualizer** - 打包分析
- **vite-plugin-html** - HTML 模板处理

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ErrorBoundary.tsx    # 错误边界组件
│   ├── MarkdownRenderer.tsx # Markdown 渲染器
│   ├── MessageActions.tsx   # 消息操作组件
│   ├── MessageItem.tsx      # 消息项组件
│   ├── Sidebar.tsx          # 侧边栏组件
│   └── ThemeToggle.tsx      # 主题切换组件
├── hooks/               # 自定义 Hooks
│   ├── useChatManager.ts    # 聊天管理
│   ├── useDeepSeekAPI.ts    # API 调用
│   └── useLocalStorage.ts   # 本地存储
├── context/             # React Context
├── constants/           # 常量定义
├── types/              # TypeScript 类型定义
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量配置文件：

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置：

```env
# 应用标题
VITE_SYS_TITLE=AI交互

# 基础路径（可选）
VITE_SYS_BASE=/

# API 基础地址
VITE_API_BASE_URL=http://localhost:4000/api

# 系统角色设定
VITE_SYSTEM_ROLE=You are a helpful assistant.
```

### 开发模式

```bash
# 开发环境
npm run dev

# 生产环境模式
npm run prod
```

### 构建部署

```bash
# 开发环境构建
npm run build:dev

# 生产环境构建
npm run build:prod

# 预览构建结果
npm run preview
```

### 代码质量

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format

# 规范化提交
npm run commit
```

## 开发说明

### 主要功能模块

1. **聊天管理** (`useChatManager`)
   - 多会话创建和管理
   - 消息历史记录
   - 本地存储持久化

2. **API 集成** (`useDeepSeekAPI`)
   - 流式响应处理
   - 错误处理和重试
   - 请求中断支持

3. **UI 组件**
   - 响应式布局设计
   - 主题切换功能
   - Markdown 内容渲染

### 代码规范

项目使用以下工具确保代码质量：

- **ESLint** - 基于 TypeScript 和 React 的规则配置
- **Prettier** - 统一的代码格式化
- **Husky** - 提交前自动检查
- **Commitizen** - 规范化的提交信息格式

### 构建优化

生产环境构建包含以下优化：

- Gzip 和 Brotli 压缩
- 代码分割和懒加载
- 打包体积分析
- 静态资源优化

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
