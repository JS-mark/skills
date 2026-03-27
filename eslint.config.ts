import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'skills/**',
    'packages/agent-pipeline/src/**',
    'packages/docs/**',
  ],
})
