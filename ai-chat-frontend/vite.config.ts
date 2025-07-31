import path from 'path'
import { defineConfig, loadEnv, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // 模式判断
  const isProduction = mode === 'production'
  const env = loadEnv(mode, process.cwd()) // 环境变量对象
  const { VITE_SYS_TITLE, VITE_SYS_BASE } = env
  return {
    plugins: [
      react(),
      tailwindcss(),
      // 使用修改html 的插件
      createHtmlPlugin({
        inject: {
          data: {
            title: VITE_SYS_TITLE,
          },
        },
      }),
      // Brotli 压缩 生产环境启用
      isProduction &&
        viteCompression({
          verbose: true, // 控制台输出压缩结果
          threshold: 10240, // 大于10kb的文件才压缩
          algorithm: 'brotliCompress', // 或 'brotli'
          ext: '.br',
          deleteOriginFile: false, // 生产环境建议改为 false 保留源文件 以确保兼容性
        }),

      // Gzip 压缩配置 生产环境启用
      isProduction &&
        viteCompression({
          verbose: true, // 控制台输出压缩结果
          threshold: 10240, // 大于10kb的文件才压缩
          algorithm: 'gzip', // 压缩算法
          ext: '.gz', // 生成的压缩文件后缀
          deleteOriginFile: false, // 生产环境建议改为 false 保留源文件 以确保兼容性
        }),

      isProduction &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: 'report.html',
          template: 'treemap',
          title: 'Bundle Analysis',
          sourcemap: false,
        }),
    ].filter(Boolean),
    base: VITE_SYS_BASE || '/', // 添加这一行设置基础路径
    server: {
      host: '0.0.0.0', // 或者指定为你的局域网 IP 地址
      port: 3000, // 可选，指定端口号
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      //导入时想要省略的扩展名列表
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    define: {
      'process.env': Object.fromEntries(
        // 将处理后的环境变量映射为 `process.env` 对象
        Object.entries(env) // 获取环境变量对象 `env` 的所有键值对
          .filter(([key]) => key.startsWith('VITE_')), // 筛选出以 `VITE_` 开头的环境变量
      ),
    },
    build: {
      // 生产环境启用代码压缩，开发环境不压缩
      minify: isProduction ? ('terser' as const) : false,

      // 设置 chunk 大小警告阈值（单位 KB）
      // 超过该值会输出警告，但不中断构建
      chunkSizeWarningLimit: 1024, // 1MB

      rollupOptions: {
        output: {
          /**
           * 自定义分包策略
           * - 将 node_modules 依赖按规则分组
           * - 避免单个 vendor 文件过大
           */
          manualChunks: createOptimizedChunks(),

          // 非入口 chunk 的命名规则（限制 hash 长度）
          chunkFileNames: 'js/[name]-[hash:8].js',

          // 入口 chunk 的命名规则（完整 hash）
          entryFileNames: 'js/[name]-[hash].js',

          // 静态资源（图片/字体等）命名规则
          assetFileNames: 'assets/[name]-[hash][extname]',
        },

        /**
         * 入口模块签名保留模式
         * - 'strict': 保持原始导出签名（最佳 Tree-Shaking）
         * - 确保组件库按需导入时能正确被优化
         */
        preserveEntrySignatures: 'strict' as const,
      },

      // Terser 压缩配置（仅在生产环境生效）
      terserOptions: {
        compress: {
          // 禁用全局移除 console（改为用 pure_funcs 精确控制）
          drop_console: false,

          // 精确指定要移除的 console 方法
          pure_funcs: isProduction
            ? ['console.log', 'console.info', 'console.debug', 'console.trace']
            : [],

          // 始终移除 debugger
          drop_debugger: isProduction,
        },
        format: {
          // 移除所有注释（包括法律声明）
          comments: false,
        },
      },
    },
  }
})

// 分块策略
function createOptimizedChunks(): (id: string) => string | undefined {
  const cache = new Map<string, string>()

  // 主依赖分组（按功能聚合）
  const groups = {
    // React 核心
    reactCore: new Set(['react', 'react-dom', 'scheduler']),
    // Markdown 渲染
    markdown: new Set([
      'react-markdown',
      'rehype-sanitize',
      'remark-gfm',
      'rehype-external-links',
    ]),
    // 语法高亮
    syntax: new Set(['react-syntax-highlighter', 'refractor']),
  }

  return (id: string) => {
    if (!id.includes('node_modules')) return
    if (cache.has(id)) return cache.get(id)

    const { fullName } = parsePackageId(id)
    let chunkName: string | undefined

    // 1. 匹配主依赖
    for (const [group, libs] of Object.entries(groups)) {
      if (libs.has(fullName)) {
        chunkName = `vendor-${group}`
        break
      }
    }

    // 2. 匹配由许多小包组成的生态系统（前缀匹配）
    if (!chunkName) {
      if (fullName.startsWith('micromark')) {
        chunkName = 'vendor-micromark'
      } else if (fullName.startsWith('hast')) {
        chunkName = 'vendor-hast'
      }
    }

    // 3. 处理未匹配的依赖
    if (!chunkName) {
      chunkName = 'vendor-common' // 将未匹配的依赖分配到 vendor-common
    }

    cache.set(id, chunkName)
    return chunkName
  }
}

// 包解析器
function parsePackageId(id: string): { fullName: string } {
  const normalizedPath = id.replace(/\\/g, '/')
  const scopedMatch = normalizedPath.match(
    /node_modules\/(@[^/]+\/[^/]+)(?:\/|$)/,
  )
  const unscopedMatch = normalizedPath.match(/node_modules\/([^/]+)(?:\/|$)/)
  return {
    fullName: scopedMatch?.[1] || unscopedMatch?.[1] || '',
  }
}
