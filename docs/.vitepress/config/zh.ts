import { defineConfig } from 'vitepress'

export const zh = defineConfig({
  lang: 'zh-CN',
  description: 'Claude Code Skills 与 TypeScript 工具集',

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'Skills', link: '/skills/', activeMatch: '/skills/' },
      { text: 'Packages', link: '/packages/', activeMatch: '/packages/' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '项目结构', link: '/guide/project-structure' },
          ],
        },
      ],
      '/skills/': [
        {
          text: 'Skills',
          items: [
            { text: '总览', link: '/skills/' },
            { text: 'agent-pipeline', link: '/skills/agent-pipeline' },
            { text: 'iconfont-downloader', link: '/skills/iconfont-downloader' },
            { text: 'drama-writer', link: '/skills/drama-writer' },
            { text: 'feature-planner', link: '/skills/feature-planner' },
            { text: 'i18n-helper', link: '/skills/i18n-helper' },
            { text: 'novel-writer', link: '/skills/novel-writer' },
          ],
        },
      ],
      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: '总览', link: '/packages/' },
            { text: '@aspect-mark/agent-pipeline', link: '/packages/agent-pipeline' },
            { text: '@aspect-mark/shared', link: '/packages/shared' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/JS-mark/skills/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '基于 MIT 许可发布',
      copyright: '© 2026 圣痕',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})
