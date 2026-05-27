import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'skills/**',
    'packages/agent-pipeline/src/**',
    'apps/docs/**',
    'apps/marketplace/.nuxt/**',
    'apps/marketplace/.output/**',
  ],
  rules: {
    'style/eol-last': 'off'
  },
})
