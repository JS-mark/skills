'use client'

import type { PipelineStatus } from '@/lib/types'
import { useEffect, useState } from 'react'
import { STATUS_CONFIG } from '@/lib/utils'
import { ControlBar } from './control-bar'

interface HeaderProps {
  status: PipelineStatus | null
  connected: boolean
}

export function Header({ status, connected }: HeaderProps) {
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('zh-CN'))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const globalStatus = status?.status || 'pending'
  const config = STATUS_CONFIG[globalStatus] || STATUS_CONFIG.pending

  return (
    <header className="h-14 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {status && (
          <>
            <span className="text-sm font-medium text-slate-300">
              {status.feature}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}>
              {config.label}
            </span>
            {status.currentPhase > 0 && globalStatus === 'running' && (
              <span className="text-xs text-slate-400">
                Phase
                {' '}
                {status.currentPhase}
                /7
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {status && <ControlBar status={status} />}

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse-dot' : 'bg-red-500'}`} />
            <span>{connected ? '已连接' : '断开'}</span>
          </div>
          <span>{clock}</span>
        </div>
      </div>
    </header>
  )
}
