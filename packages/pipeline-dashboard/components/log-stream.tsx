'use client'

import type { LogItem } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, createLogStream } from '@/lib/api-client'
import { cn, formatSize, timeAgo } from '@/lib/utils'

interface LogStreamProps {
  logs: LogItem[]
}

export function LogStream({ logs }: LogStreamProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const esRef = useRef<EventSource | null>(null)

  const loadLog = useCallback(async (name: string) => {
    setSelected(name)
    setContent('')

    // Close previous SSE
    esRef.current?.close()

    try {
      const text = await api.getLogContent(name)
      setContent(text)

      // Start SSE for live streaming
      const es = createLogStream(name, (chunk) => {
        setContent(prev => `${prev + chunk}\n`)
      })
      esRef.current = es
    }
    catch {}
  }, [])

  useEffect(() => {
    return () => { esRef.current?.close() }
  }, [])

  useEffect(() => {
    if (autoScroll && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content, autoScroll])

  useEffect(() => {
    if (logs.length > 0 && !selected) {
      loadLog(logs[0].name)
    }
  }, [logs, selected, loadLog])

  const filteredContent = filter
    ? content.split('\n').filter(l => l.toLowerCase().includes(filter.toLowerCase())).join('\n')
    : content

  return (
    <div className="flex h-full">
      {/* Log list */}
      <div className="w-64 border-r border-slate-700/50 overflow-y-auto p-4 shrink-0">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">日志文件</h2>
        {!logs.length
          ? <p className="text-sm text-slate-500">暂无日志</p>
          : (
              <div className="space-y-1.5">
                {logs.map(log => (
                  <button
                    key={log.name}
                    onClick={() => loadLog(log.name)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg border transition-all',
                      selected === log.name
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-700/50 hover:border-slate-600',
                    )}
                  >
                    <div className="text-sm font-medium truncate">{log.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {formatSize(log.size)}
                      {log.mtime && ` · ${timeAgo(log.mtime)}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
      </div>

      {/* Log content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected && (
          <>
            <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
              <span className="text-xs text-slate-400 font-medium">{selected}</span>
              <div className="flex-1" />
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="过滤..."
                className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500 w-40"
              />
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn('px-2 py-1 text-[11px] rounded', autoScroll ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400')}
              >
                {autoScroll ? '自动滚动 ON' : '自动滚动 OFF'}
              </button>
            </div>
            <div
              ref={contentRef}
              className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap break-all bg-[#0d1117]"
            >
              {filteredContent || '空日志'}
            </div>
          </>
        )}
        {!selected && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            选择一个日志文件查看
          </div>
        )}
      </div>
    </div>
  )
}
