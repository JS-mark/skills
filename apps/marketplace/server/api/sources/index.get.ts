import { getSources } from '~~/server/utils/data'

export default defineEventHandler(() => {
  return getSources()
})
