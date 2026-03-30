'use client'

import { PipelineTimeline } from '@/components/pipeline-timeline'
import { StatsCards } from '@/components/stats-cards'
import { usePipelineContext } from '@/hooks/pipeline-context'

export default function OverviewPage() {
  const { status, docs } = usePipelineContext()

  if (!status) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-lg font-semibold text-slate-300 mb-2">等待连接...</h2>
          <p className="text-sm text-slate-500">确保 Pipeline API 服务已启动 (端口 3210)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left: Pipeline timeline */}
      <div className="w-96 border-r border-slate-700/50 overflow-y-auto p-6 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">流水线进度</h2>
        <PipelineTimeline status={status} />
        <div className="mt-6 pt-5 border-t border-slate-700/50">
          <StatsCards status={status} />
        </div>
      </div>

      {/* Right: Recent docs overview */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">最新文档</h2>
        {docs.length > 0
          ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.slice(0, 6).map(doc => (
                  <DocCard key={doc.path} doc={doc} />
                ))}
              </div>
            )
          : <p className="text-sm text-slate-500">暂无文档产出</p>}

        {/* Source files summary */}
        {status.srcFiles && status.srcFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">代码文件</h2>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-sm text-slate-300 mb-2">
                共
                {' '}
                {status.srcFiles.length}
                {' '}
                个文件
              </div>
              <div className="space-y-1">
                {status.srcFiles.slice(0, 10).map(f => (
                  <div key={f.path} className="flex items-center text-xs text-slate-400">
                    <span className="flex-1 truncate font-mono">{f.path}</span>
                    <span className="text-slate-600 ml-2">{formatSizeSmall(f.size)}</span>
                  </div>
                ))}
                {status.srcFiles.length > 10 && (
                  <div className="text-xs text-slate-600">
                    ... 还有
                    {' '}
                    {status.srcFiles.length - 10}
                    {' '}
                    个文件
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatSizeSmall(b: number) {
  if (!b)
    return '0 B'
  if (b < 1024)
    return `${b} B`
  if (b < 1048576)
    return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

const CATEGORY_COLORS: Record<string, string> = {
  'prd': 'bg-purple-500/15 text-purple-400',
  'architecture': 'bg-cyan-500/15 text-cyan-400',
  'ui-design': 'bg-orange-500/15 text-orange-400',
  'test-plans': 'bg-green-500/15 text-green-400',
  'reviews': 'bg-red-500/15 text-red-400',
}

const CATEGORY_LABELS: Record<string, string> = {
  'prd': 'PRD',
  'architecture': '架构',
  'ui-design': 'UI',
  'test-plans': '测试',
  'reviews': '审查',
}

function DocCard({ doc }: { doc: import('@/lib/types').DocItem }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${CATEGORY_COLORS[doc.category] || 'bg-slate-600 text-slate-300'}`}>
        {CATEGORY_LABELS[doc.category] || doc.category}
      </span>
      <h4 className="text-sm font-medium mt-2 truncate">{doc.name}</h4>
      <p className="text-[11px] text-slate-500 mt-1">{formatSizeSmall(doc.size)}</p>
    </div>
  )
}
