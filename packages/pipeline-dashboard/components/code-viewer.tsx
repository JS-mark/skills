'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

interface CodeViewerProps {
  filePath: string | null
}

export function CodeViewer({ filePath }: CodeViewerProps) {
  const [code, setCode] = useState('')
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!filePath)
      return
    setLoading(true)
    setEditMode(false)
    api.getFileContent(filePath)
      .then(async (text) => {
        setCode(text)
        // Try to use shiki for syntax highlighting
        try {
          const { codeToHtml } = await import('shiki')
          const ext = filePath.split('.').pop() || 'text'
          const langMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            tsx: 'tsx',
            jsx: 'jsx',
            vue: 'vue',
            css: 'css',
            scss: 'scss',
            html: 'html',
            json: 'json',
            md: 'markdown',
            yaml: 'yaml',
            yml: 'yaml',
            py: 'python',
            rs: 'rust',
            go: 'go',
            java: 'java',
            sh: 'bash',
            sql: 'sql',
            xml: 'xml',
          }
          const lang = langMap[ext] || 'text'
          const result = await codeToHtml(text, {
            lang,
            theme: 'github-dark',
          })
          setHtml(result)
        }
        catch {
          setHtml('')
        }
      })
      .catch(() => setCode('加载失败'))
      .finally(() => setLoading(false))
  }, [filePath])

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function enterEdit() {
    setEditContent(code)
    setEditMode(true)
  }

  async function saveFile() {
    if (!filePath)
      return
    setSaving(true)
    try {
      await api.saveFileContent(filePath, editContent)
      setCode(editContent)
      setEditMode(false)
      // Re-highlight
      try {
        const { codeToHtml } = await import('shiki')
        const ext = filePath.split('.').pop() || 'text'
        const langMap: Record<string, string> = {
          js: 'javascript', ts: 'typescript', tsx: 'tsx', jsx: 'jsx', vue: 'vue',
          css: 'css', scss: 'scss', html: 'html', json: 'json', md: 'markdown',
          yaml: 'yaml', yml: 'yaml', py: 'python', rs: 'rust', go: 'go',
          java: 'java', sh: 'bash', sql: 'sql', xml: 'xml',
        }
        const lang = langMap[ext] || 'text'
        setHtml(await codeToHtml(editContent, { lang, theme: 'github-dark' }))
      }
      catch {
        setHtml('')
      }
    }
    catch (e) {
      alert(`保存失败: ${(e as Error).message}`)
    }
    finally {
      setSaving(false)
    }
  }

  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        选择一个文件查看
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">加载中...</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
        <span className="text-xs text-slate-400 font-mono">{filePath}</span>
        <div className="flex items-center gap-2">
          {editMode
            ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveFile}
                    disabled={saving}
                    className="px-2.5 py-1 text-[11px] rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </>
              )
            : (
                <>
                  <button
                    onClick={enterEdit}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={copyCode}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </>
              )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {editMode
          ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-full p-4 bg-[#0d1117] text-slate-300 font-mono text-[13px] leading-[1.6] resize-none focus:outline-none"
                spellCheck={false}
              />
            )
          : html
            ? (
                <div
                  className="p-4 text-sm [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!text-[13px] [&_code]:!leading-[1.6]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )
            : (
                <pre className="p-4 text-sm">
                  <code className="text-slate-300">{code}</code>
                </pre>
              )}
      </div>
    </div>
  )
}
