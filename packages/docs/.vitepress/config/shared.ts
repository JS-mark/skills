import { defineConfig } from 'vitepress'

export const shared = defineConfig({
  title: 'Skills',
  base: '/skills/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/skills/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JS-mark/skills' },
    ],

    search: {
      provider: 'local',
    },
  },
})
