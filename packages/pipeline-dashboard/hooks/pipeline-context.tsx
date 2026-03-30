'use client'

import type { DocItem, LogItem, PipelineStatus } from '@/lib/types'
import { createContext, useContext } from 'react'
import { usePipeline } from './use-pipeline'

interface PipelineContextValue {
  status: PipelineStatus | null
  docs: DocItem[]
  logs: LogItem[]
  connected: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PipelineContext = createContext<PipelineContextValue>({
  status: null,
  docs: [],
  logs: [],
  connected: false,
  error: null,
  refetch: async () => {},
})

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const value = usePipeline()
  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipelineContext() {
  return useContext(PipelineContext)
}
