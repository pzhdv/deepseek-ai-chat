module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'], // body上方必须有换行
    'footer-leading-blank': [1, 'always'], // footer上方建议换行
    'header-max-length': [2, 'always', 108], // 标题最大108字符
    'type-case': [0], // 不检查类型大小写
    'type-empty': [2, 'never'], // 禁止类型为空
    'scope-empty': [2, 'never'], // 禁止作用域为空
    'scope-case': [0], // 不检查作用域大小写
    'subject-full-stop': [2, 'never'], // 禁止描述以句号结尾
    'subject-case': [0], // 不检查描述大小写（允许中文）
    'subject-empty': [2, 'never'], // 禁止描述为空
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能、页面
        'fix', // 修补bug
        'docs', // 修改文档、注释
        'style', // 格式：不影响代码运行的变动、空格、格式化等等
        'ui', // ui修改：布局、css样式等等
        'hotfix', // 修复线上紧急bug
        'build', // 改变构建流程，新增依赖库、工具等（例如:修改webpack）
        'refactor', // 代码重构，未新增任何功能和修复任何bug
        'revert', // 回滚到上一个版本
        'perf', // 优化：提升性能、用户体验等
        'ci', // 对CI/CD配置文件和脚本的更改
        'chore', // 其他不修改src或测试文件的更改
        'test', // 测试用例：包括单元测试、集成测试
        'update', // 更新：普通更新
      ],
    ],
  },
}
