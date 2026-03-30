'use client'

import { LogStream } from '@/components/log-stream'
import { usePipelineContext } from '@/hooks/pipeline-context'

export default function LogsPage() {
  const { logs } = usePipelineContext()
  return (
    <div className="h-full">
      <LogStream logs={logs} />
    </div>
  )
}
