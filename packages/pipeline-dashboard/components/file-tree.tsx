'use client'

import type { FileTreeNode } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { cn, formatSize, getFileIcon } from '@/lib/utils'

interface FileTreeProps {
  onSelect: (path: string) => void
  selectedPath?: string
}

export function FileTree({ onSelect, selectedPath }: FileTreeProps) {
  const [tree, setTree] = useState<FileTreeNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCodeTree()
      .then(setTree)
      .catch(() => setTree([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div className="p-4 text-sm text-slate-500">加载中...</div>
  if (!tree.length)
    return <div className="p-4 text-sm text-slate-500">暂无代码文件</div>

  return (
    <div className="py-2 text-sm">
      {tree.map(node => (
        <TreeNode key={node.path} node={node} depth={0} onSelect={onSelect} selectedPath={selectedPath} />
      ))}
    </div>
  )
}

function TreeNode({ node, depth, onSelect, selectedPath }: {
  node: FileTreeNode
  depth: number
  onSelect: (path: string) => void
  selectedPath?: string
}) {
  const [open, setOpen] = useState(depth < 2)

  const handleClick = useCallback(() => {
    if (node.type === 'directory') {
      setOpen(prev => !prev)
    }
    else {
      onSelect(node.path)
    }
  }, [node, onSelect])

  const isSelected = node.path === selectedPath

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 py-1 px-2 hover:bg-slate-800/50 rounded text-left transition-colors',
          isSelected && 'bg-blue-500/10 text-blue-400',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === 'directory'
          ? <span className="text-xs w-4 text-center text-slate-500">{open ? '▼' : '▶'}</span>
          : <span className="text-xs w-4 text-center">{getFileIcon(node.name)}</span>}
        <span className={cn('flex-1 truncate', node.type === 'directory' ? 'text-slate-300 font-medium' : 'text-slate-400')}>
          {node.name}
        </span>
        {node.type === 'file' && node.size != null && (
          <span className="text-[10px] text-slate-600 shrink-0">{formatSize(node.size)}</span>
        )}
      </button>
      {node.type === 'directory' && open && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  )
}
