'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DocViewer } from '@/components/doc-viewer'
import { usePipelineContext } from '@/hooks/pipeline-context'

function DocsContent() {
  const { docs } = usePipelineContext()
  const searchParams = useSearchParams()
  const initialSelected = searchParams.get('selected') || undefined

  return <DocViewer docs={docs} initialSelected={initialSelected} />
}

export default function DocsPage() {
  return (
    <div className="h-full">
      <Suspense>
        <DocsContent />
      </Suspense>
    </div>
  )
}
