import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /*
       * 规则严重级别：
       * "off" 或 0    ==>  关闭规则
       * "warn" 或 1   ==>  将规则违反显示为警告（代码仍可运行）
       * "error" 或 2  ==>  将规则违反显示为错误（代码无法运行/编译）
       */
      // 关闭对显式使用 any 类型的检查
      // 当需要处理类型不明确的场景（如第三方库返回值）时允许使用 any
      '@typescript-eslint/no-explicit-any': 'off',

      // 定义未使用的变量时仅给出警告而非错误
      // 保留未使用变量便于后续开发，避免频繁修改代码
      '@typescript-eslint/no-unused-vars': 'warn',

      // 关闭对未使用表达式的检查
      // 允许存在类似条件判断中未使用的表达式（如测试代码）
      '@typescript-eslint/no-unused-expressions': 'off',

      // 关闭 React Refresh 组件导出限制
      // 允许非组件模块使用热更新功能
      'react-refresh/only-export-components': 'off',
    },
  },
])
