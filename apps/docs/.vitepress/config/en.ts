import { defineConfig } from 'vitepress'

export const en = defineConfig({
  lang: 'en-US',
  description: 'Claude Code Skills & TypeScript Utilities',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/en/guide/introduction', activeMatch: '/en/guide/' },
      { text: 'Skills', link: '/en/skills/', activeMatch: '/en/skills/' },
      { text: 'Packages', link: '/en/packages/', activeMatch: '/en/packages/' },
      { text: 'Apps', link: '/en/apps/', activeMatch: '/en/apps/' },
      { text: 'Changelog', link: '/en/changelog' },
    ],

    sidebar: {
      '/en/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/en/guide/introduction' },
            { text: 'Getting Started', link: '/en/guide/getting-started' },
            { text: 'Project Structure', link: '/en/guide/project-structure' },
          ],
        },
      ],
      '/en/skills/': [
        {
          text: 'Skills',
          items: [
            { text: 'Overview', link: '/en/skills/' },
            { text: 'agent-pipeline', link: '/en/skills/agent-pipeline' },
            { text: 'github-trend-analyzer', link: '/en/skills/github-trend-analyzer' },
            { text: 'iconfont-downloader', link: '/en/skills/iconfont-downloader' },
            { text: 'drama-writer', link: '/en/skills/drama-writer' },
            { text: 'feature-planner', link: '/en/skills/feature-planner' },
            { text: 'i18n-helper', link: '/en/skills/i18n-helper' },
            { text: 'novel-writer', link: '/en/skills/novel-writer' },
          ],
        },
      ],
      '/en/packages/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/en/packages/' },
            { text: '@aspect-mark/agent-pipeline', link: '/en/packages/agent-pipeline' },
            { text: '@aspect-mark/pipeline-dashboard', link: '/en/packages/pipeline-dashboard' },
            { text: '@aspect-mark/shared', link: '/en/packages/shared' },
          ],
        },
      ],
      '/en/apps/': [
        {
          text: 'Apps',
          items: [
            { text: 'Overview', link: '/en/apps/' },
            { text: 'marketplace', link: '/en/apps/marketplace' },
            { text: 'docs', link: '/en/apps/docs' },
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/JS-mark/skills/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License',
      copyright: '© 2026 圣痕',
    },
  },
})
