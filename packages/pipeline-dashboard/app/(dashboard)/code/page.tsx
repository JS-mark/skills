'use client'

import type { CodeStats } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { CodeViewer } from '@/components/code-viewer'
import { FileTree } from '@/components/file-tree'
import { api } from '@/lib/api-client'
import { formatSize } from '@/lib/utils'

export default function CodePage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [stats, setStats] = useState<CodeStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ file: string, line: number, text: string }[]>([])
  const [showDiff, setShowDiff] = useState(false)
  const [diff, setDiff] = useState('')

  useEffect(() => {
    api.getCodeStats().then(setStats).catch(() => {})
  }, [])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim())
      return
    try {
      const results = await api.searchCode(searchQuery)
      setSearchResults(results)
    }
    catch {
      setSearchResults([])
    }
  }, [searchQuery])

  async function loadDiff() {
    setShowDiff(true)
    try {
      const d = await api.getCodeDiff()
      setDiff(d)
    }
    catch {
      setDiff('无法获取 diff')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        {stats && (
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              {stats.totalFiles}
              {' '}
              文件
            </span>
            <span>
              {stats.totalLines.toLocaleString()}
              {' '}
              行
            </span>
            <span>{formatSize(stats.totalSize)}</span>
            {Object.entries(stats.languages).slice(0, 4).map(([lang, count]) => (
              <span key={lang} className="px-1.5 py-0.5 rounded bg-slate-700/50 text-[11px]">
                {lang}
                :
                {count}
              </span>
            ))}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="搜索代码..."
            className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 focus:outline-none focus:border-blue-500 w-48"
          />
          <button
            onClick={() => showDiff ? setShowDiff(false) : loadDiff()}
            className={`px-2.5 py-1 text-xs rounded ${showDiff ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {showDiff ? '返回文件' : 'Git Diff'}
          </button>
          <a
            href={api.getExportUrl()}
            className="px-2.5 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            导出 ZIP
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {showDiff
          ? (
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {diff || '无变更'}
                </pre>
              </div>
            )
          : searchResults.length > 0
            ? (
                <div className="flex-1 flex flex-col">
                  <div className="px-4 py-2 border-b border-slate-700/50 text-xs text-slate-400">
                    搜索结果:
                    {' '}
                    {searchResults.length}
                    {' '}
                    条匹配
                    <button onClick={() => setSearchResults([])} className="ml-3 text-blue-400 hover:underline">清除</button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 space-y-2">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedFile(r.file); setSearchResults([]) }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs"
                      >
                        <span className="text-blue-400 font-mono">{r.file}</span>
                        <span className="text-slate-600 mx-2">:</span>
                        <span className="text-slate-500">{r.line}</span>
                        <div className="text-slate-400 mt-0.5 truncate font-mono">{r.text}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            : (
                <>
                  {/* File tree */}
                  <div className="w-64 border-r border-slate-700/50 overflow-y-auto shrink-0">
                    <FileTree onSelect={setSelectedFile} selectedPath={selectedFile || undefined} />
                  </div>
                  {/* Code viewer */}
                  <div className="flex-1 overflow-hidden">
                    <CodeViewer filePath={selectedFile} />
                  </div>
                </>
              )}
      </div>
    </div>
  )
}
