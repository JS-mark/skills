'use client'

import type { RoleInfo } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api-client'
import { cn, ROLE_LABELS } from '@/lib/utils'

const ROLE_ICONS: Record<string, string> = {
  'pm': '📋',
  'architect': '🏗️',
  'ui-designer': '🎨',
  'fullstack': '💻',
  'tester': '🧪',
  'reviewer': '🔍',
}

const BUILT_IN_ROLES = new Set(['pm', 'architect', 'ui-designer', 'fullstack', 'tester', 'reviewer'])

export function RoleManager() {
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [templates, setTemplates] = useState<Record<string, string>>({})

  const loadRoles = useCallback(async () => {
    try {
      const data = await api.getRoles()
      setRoles(data)
      if (!selected && data.length > 0) {
        setSelected(data[0].name)
        setContent(data[0].content)
      }
    }
    catch {}
  }, [selected])

  useEffect(() => { loadRoles() }, [loadRoles])

  async function selectRole(name: string) {
    setSelected(name)
    setEditMode(false)
    try {
      const role = await api.getRole(name)
      setContent(role.content)
    }
    catch (e) {
      setContent(`加载失败: ${(e as Error).message}`)
    }
  }

  async function saveRole() {
    if (!selected)
      return
    setSaving(true)
    try {
      await api.updateRole(selected, editContent)
      setContent(editContent)
      setEditMode(false)
      loadRoles()
    }
    catch (e) {
      alert(`保存失败: ${(e as Error).message}`)
    }
    finally {
      setSaving(false)
    }
  }

  async function deleteRole(name: string) {
    if (!confirm(`确认删除角色 "${name}"？`))
      return
    try {
      await api.deleteRole(name)
      if (selected === name) {
        setSelected(null)
        setContent('')
      }
      loadRoles()
    }
    catch (e) {
      alert(`删除失败: ${(e as Error).message}`)
    }
  }

  async function createRole() {
    if (!newName.trim())
      return
    const filename = newName.trim().toLowerCase().replace(/\s+/g, '-')
    const template = templates[filename] || `# Role: ${newName}\n\nDescribe this role's responsibilities here.\n`
    try {
      await api.createRole(filename, template)
      setShowCreate(false)
      setNewName('')
      loadRoles()
      selectRole(filename)
    }
    catch (e) {
      alert(`创建失败: ${(e as Error).message}`)
    }
  }

  async function openCreateDialog() {
    setShowCreate(true)
    try {
      const t = await api.getRoleTemplates()
      setTemplates(t)
    }
    catch {}
  }

  return (
    <div className="flex h-full">
      {/* Role list */}
      <div className="w-64 border-r border-slate-700/50 overflow-y-auto p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">角色列表</h2>
          <button
            onClick={openCreateDialog}
            className="px-2 py-1 text-xs rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
          >
            + 新增
          </button>
        </div>

        <div className="space-y-1.5">
          {roles.map(role => (
            <button
              key={role.name}
              onClick={() => selectRole(role.name)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-all group',
                selected === role.name
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50',
              )}
            >
              <div className="flex items-center gap-2">
                <span>{ROLE_ICONS[role.name] || '🤖'}</span>
                <span className="text-sm font-medium flex-1 truncate">
                  {ROLE_LABELS[role.name] || role.name}
                </span>
                {role.builtIn && (
                  <span className="text-[10px] text-slate-600" title="内置角色">🔒</span>
                )}
                {!role.builtIn && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRole(role.name) }}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{role.filename}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Role content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selected
          ? (
              <>
                <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
                  <span className="text-sm font-medium text-slate-300">
                    {ROLE_ICONS[selected] || '🤖'}
                    {' '}
                    {ROLE_LABELS[selected] || selected}
                  </span>
                  <div className="flex-1" />
                  {editMode
                    ? (
                        <>
                          <button onClick={() => setEditMode(false)} className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600">
                            取消
                          </button>
                          <button onClick={saveRole} disabled={saving} className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50">
                            {saving ? '保存中...' : '保存'}
                          </button>
                        </>
                      )
                    : (
                        <button
                          onClick={() => { setEditContent(content); setEditMode(true) }}
                          className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                        >
                          编辑
                        </button>
                      )}
                </div>
                <div className="flex-1 overflow-auto">
                  {editMode
                    ? (
                        <div className="flex h-full">
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-1/2 p-4 bg-transparent border-r border-slate-700/50 resize-none focus:outline-none font-mono text-sm text-slate-300"
                            spellCheck={false}
                          />
                          <div className="w-1/2 p-6 overflow-auto markdown-body text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{editContent}</ReactMarkdown>
                          </div>
                        </div>
                      )
                    : (
                        <div className="p-6 max-w-4xl markdown-body text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </div>
                      )}
                </div>
              </>
            )
          : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                选择一个角色查看
              </div>
            )}
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">新增角色</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">角色名称</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="如: devops, dba, security-auditor"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {Object.keys(templates).length > 0 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">可用模板</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(templates).map(t => (
                      <button
                        key={t}
                        onClick={() => setNewName(t)}
                        className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600">取消</button>
              <button onClick={createRole} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
