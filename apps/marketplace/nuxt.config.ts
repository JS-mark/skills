// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@vueuse/nuxt',
  ],

  ssr: true,

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
  },

  vite: {
    optimizeDeps: {
      include: [],
    },
  },

  content: {
    database: {
      type: 'libsql',
      url: ':memory:',
    },
  },

  colorMode: {
    preference: 'system',
  },

  fonts: {
    providers: {
      google: false,
      googleicons: false,
    },
  },

  app: {
    head: {
      title: 'SkillForge — Skills & MCP & More',
      meta: [
        { name: 'description', content: 'Discover, search, and share skills, MCP servers, and developer tools' },
      ],
    },
  },

  compatibilityDate: '2026-05-26',
})
