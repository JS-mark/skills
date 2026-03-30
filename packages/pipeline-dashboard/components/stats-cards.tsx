'use client'

import type { PipelineStatus } from '@/lib/types'
import { formatSize } from '@/lib/utils'

interface StatsCardsProps {
  status: PipelineStatus
}

export function StatsCards({ status }: StatsCardsProps) {
  const done = status.phases.filter(p => p.status === 'done').length
  const total = status.phases.length
  const codeFiles = status.srcFiles?.length || 0
  const totalOutput = status.phases.reduce((s, p) => s + (p.fileSize || 0), 0)
  const fixRound = status.fixRounds?.current || 0

  const cards = [
    { value: `${done}/${total}`, label: '阶段', color: 'text-cyan-400' },
    { value: String(codeFiles), label: '代码文件', color: 'text-blue-400' },
    { value: formatSize(totalOutput), label: '产出', color: 'text-purple-400' },
    { value: String(fixRound), label: '修复轮', color: 'text-orange-400' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
          <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
