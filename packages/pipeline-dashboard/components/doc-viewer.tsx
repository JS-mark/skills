'use client'

import type { DocItem } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api-client'
import { cn, formatSize, timeAgo } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, { label: string, color: string }> = {
  'prd': { label: 'PRD', color: 'bg-purple-500/15 text-purple-400' },
  'architecture': { label: '架构', color: 'bg-cyan-500/15 text-cyan-400' },
  'ui-design': { label: 'UI', color: 'bg-orange-500/15 text-orange-400' },
  'test-plans': { label: '测试', color: 'bg-green-500/15 text-green-400' },
  'reviews': { label: '审查', color: 'bg-red-500/15 text-red-400' },
}

interface DocViewerProps {
  docs: DocItem[]
}

export function DocViewer({ docs }: DocViewerProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const loadDoc = useCallback(async (path: string) => {
    setSelected(path)
    setLoading(true)
    try {
      const text = await api.getDocContent(path)
      setContent(text)
    }
    catch (e) {
      setContent(`加载失败: ${(e as Error).message}`)
    }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (docs.length > 0 && !selected) {
      loadDoc(docs[0].path)
    }
  }, [docs, selected, loadDoc])

  if (!docs.length) {
    return <div className="p-8 text-center text-slate-500">暂无文档</div>
  }

  return (
    <div className="flex h-full">
      {/* Document list */}
      <div className="w-72 border-r border-slate-700/50 overflow-y-auto p-4 space-y-2 shrink-0">
        {docs.map(doc => (
          <button
            key={doc.path}
            onClick={() => loadDoc(doc.path)}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-all',
              selected === doc.path
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50',
            )}
          >
            <span className={cn('text-[10px] px-2 py-0.5 rounded-md font-medium', CATEGORY_LABELS[doc.category]?.color || 'bg-slate-600 text-slate-300')}>
              {CATEGORY_LABELS[doc.category]?.label || doc.category}
            </span>
            <h4 className="text-sm font-medium mt-2 truncate">{doc.name}</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              {formatSize(doc.size)}
              {doc.mtime && ` · ${timeAgo(doc.mtime)}`}
            </p>
          </button>
        ))}
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading
          ? <div className="text-slate-500">加载中...</div>
          : selected
            ? (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                    <span className="text-sm text-slate-400">{selected}</span>
                  </div>
                  <div className="markdown-body text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </div>
              )
            : <div className="text-slate-500">选择一个文档查看</div>}
      </div>
    </div>
  )
}
