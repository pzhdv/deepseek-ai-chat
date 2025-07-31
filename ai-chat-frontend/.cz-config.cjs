module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新增功能' },
    { value: 'fix', name: 'fix:      修复错误' },
    { value: 'docs', name: 'docs:     修改文档或注释' },
    {
      value: 'style',
      name: 'style:    不影响代码运行的格式化或样式调整',
    },
    { value: 'ui', name: 'ui:      UI 修改（布局、CSS 等）' },
    { value: 'hotfix', name: 'hotfix:   修复线上紧急问题' },
    { value: 'build', name: 'build:    影响构建系统或外部依赖的更改' },
    {
      value: 'refactor',
      name: 'refactor: 代码重构（不新增功能且不修复错误）',
    },
    { value: 'revert', name: 'revert:   回滚到之前的提交' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'ci', name: 'ci:       CI 配置文件和脚本的更改' },
    { value: 'chore', name: 'chore:    不修改 src 或测试文件的其他更改' },
    { value: 'test', name: 'test:     添加缺失的测试或修正现有测试' },
    { value: 'update', name: 'update:   普通更新' },
  ],
  messages: {
    type: '选择提交类型：', // 提示用户选择提交类型
    scope: '选择提交范围（可选）：', // 提示用户选择提交范围（作用域）
    subject: '简要描述此次提交的内容：', // 提示用户输入提交的简要描述
    body: '详细描述此次提交的内容（可选）：', // 提示用户输入提交的详细描述
    breaking: '列出任何破坏性更改（可选）：', // 提示用户输入破坏性更改的描述
    footer: '列出任何关闭的 Issue（可选，例如：#31, #34）：', // 提示用户输入关闭的 Issue 编号
    confirmCommit: '你确定要继续提交上述内容吗？', // 提示用户确认提交
  },
  allowCustomScopes: true, // 是否允许用户输入自定义的作用域
  defaultScopes: ['core', 'ui', 'api', 'test'], // 默认允许的作用域列表
  allowBreakingChanges: ['feat', 'fix', 'ui', 'hotfix', 'update', 'perf'], // 注意：这里使用去除emoji后的value值
  skipQuestions: ['body'], // 跳过的问题，这里跳过了详细描述（body）
  subjectLimit: 100, // 提交主题的最大长度限制
}
