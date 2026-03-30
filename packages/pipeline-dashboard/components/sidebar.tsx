'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: '概览', icon: '📊' },
  { href: '/docs', label: '文档', icon: '📄' },
  { href: '/code', label: '代码', icon: '💻' },
  { href: '/roles', label: '角色', icon: '🎭' },
  { href: '/logs', label: '日志', icon: '📋' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-slate-700/50 bg-slate-900/50 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-700/50">
        <h1 className="text-lg font-bold">
          <span className="text-blue-400">Pipeline</span>
          {' '}
          Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">Multi-Agent Control</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                ? 'bg-blue-500/15 text-blue-400 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50 text-xs text-slate-500">
        MCP Plugin v2.0
      </div>
    </aside>
  )
}
