'use client'

import { DocViewer } from '@/components/doc-viewer'
import { usePipelineContext } from '@/hooks/pipeline-context'

export default function DocsPage() {
  const { docs } = usePipelineContext()
  return (
    <div className="h-full">
      <DocViewer docs={docs} />
    </div>
  )
}
