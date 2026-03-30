'use client'

import type { ReactNode } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { PipelineProvider, usePipelineContext } from '@/hooks/pipeline-context'

function ShellInner({ children }: { children: ReactNode }) {
  const { status, connected } = usePipelineContext()

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header status={status} connected={connected} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PipelineProvider>
      <ShellInner>{children}</ShellInner>
    </PipelineProvider>
  )
}
