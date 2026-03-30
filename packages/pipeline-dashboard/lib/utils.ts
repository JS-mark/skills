import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatSize(bytes: number): string {
  if (!bytes)
    return '0 B'
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1048576)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr)
    return ''
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (s < 60)
    return `${s}秒前`
  if (s < 3600)
    return `${Math.floor(s / 60)}分钟前`
  if (s < 86400)
    return `${Math.floor(s / 3600)}小时前`
  return `${Math.floor(s / 86400)}天前`
}

export function formatDuration(ms: number): string {
  if (ms < 1000)
    return `${ms}ms`
  if (ms < 60000)
    return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000)
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

export const PHASE_ICONS: Record<number, string> = {
  1: '📋',
  2: '🏗️',
  3: '💻',
  4: '🔍',
  5: '🔧',
  6: '🧪',
  7: '🔄',
}

export const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: '需求分析与 PRD',
  2: '架构 + UI + 测试计划',
  3: '功能代码实现',
  4: '代码质量审查',
  5: '修复审查问题',
  6: '编写测试并执行',
  7: 'Bug 修复 + 重新测试',
}

export const ROLE_LABELS: Record<string, string> = {
  'architect': '架构师',
  'ui-designer': 'UI 设计师',
  'tester': '测试工程师',
  'pm': '产品经理',
  'fullstack': '全栈工程师',
  'reviewer': '代码审查员',
}

export const STATUS_CONFIG: Record<string, { label: string, color: string, bgColor: string }> = {
  done: { label: '完成', color: 'text-green-400', bgColor: 'bg-green-500/15' },
  running: { label: '执行中', color: 'text-blue-400', bgColor: 'bg-blue-500/15' },
  pending: { label: '等待', color: 'text-slate-400', bgColor: 'bg-slate-500/15' },
  failed: { label: '失败', color: 'text-red-400', bgColor: 'bg-red-500/15' },
  skipped: { label: '跳过', color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
  cancelled: { label: '已取消', color: 'text-orange-400', bgColor: 'bg-orange-500/15' },
  paused: { label: '已暂停', color: 'text-yellow-400', bgColor: 'bg-yellow-500/15' },
}

export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    js: '📜',
    ts: '🔷',
    tsx: '⚛️',
    jsx: '⚛️',
    json: '📋',
    vue: '💚',
    css: '🎨',
    scss: '🎨',
    html: '🌐',
    md: '📝',
    yaml: '⚙️',
    yml: '⚙️',
    py: '🐍',
    rs: '🦀',
    go: '🐹',
    java: '☕',
    sh: '🐚',
    sql: '🗄️',
    svg: '🖼️',
    png: '🖼️',
  }
  return map[ext || ''] || '📄'
}
