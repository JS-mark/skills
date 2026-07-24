import process from 'node:process'

const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
const wantBlob = process.env.STORAGE_DRIVER === 'vercelBlob'

const storageData = wantBlob && hasBlobToken
  ? { driver: 'vercelBlob' as const, token: process.env.BLOB_READ_WRITE_TOKEN! }
  : process.env.VERCEL
    ? { driver: 'memory' as const }
    : { driver: 'fs' as const, base: '.data/content' }

if (wantBlob && !hasBlobToken)
  console.warn('[storage] STORAGE_DRIVER=vercelBlob but BLOB_READ_WRITE_TOKEN is missing — falling back to memory driver. Connect a Blob Store in Vercel and redeploy.')

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
    storage: {
      data: storageData,
    },
    devStorage: {
      data: {
        driver: 'fs',
        base: './content',
      },
    },
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
    // 构建期本地 content 数据库使用 Node 内置 node:sqlite（Node 22.5+ / 25），
    // 避免 better-sqlite3 / sqlite3 的原生编译（node-gyp），从而无需在 Vercel 上编译原生模块。
    experimental: {
      nativeSqlite: true,
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
