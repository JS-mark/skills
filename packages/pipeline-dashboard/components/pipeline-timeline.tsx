'use client'

import type { FixRounds, Phase, PipelineStatus } from '@/lib/types'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import { cn, formatDuration, formatSize, PHASE_DESCRIPTIONS, PHASE_ICONS, ROLE_LABELS, STATUS_CONFIG } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

interface PipelineTimelineProps {
  status: PipelineStatus
}

export function PipelineTimeline({ status }: PipelineTimelineProps) {
  const { phases, fixRounds } = status
  const [confirm, setConfirm] = useState<{ action: string, message: string, onConfirm: () => Promise<void> } | null>(null)

  async function handleAction(action: string, message: string, fn: () => Promise<unknown>) {
    setConfirm({
      action,
      message,
      onConfirm: async () => {
        try { await fn() }
        catch (e) { console.error(e) }
        finally { setConfirm(null) }
      },
    })
  }

  return (
    <div className="space-y-1">
      {phases.map((phase, i) => (
        <PhaseItem
          key={phase.id}
          phase={phase}
          isLast={i === phases.length - 1}
          isCurrent={phase.id === status.currentPhase}
          fixRounds={phase.id === 7 ? fixRounds : undefined}
          pipelineStatus={status.status}
          onAction={handleAction}
        />
      ))}

      {confirm && (
        <ConfirmDialog
          title={confirm.action}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

function PhaseItem({ phase, isLast, isCurrent, fixRounds, pipelineStatus, onAction }: {
  phase: Phase
  isLast: boolean
  isCurrent: boolean
  fixRounds?: FixRounds
  pipelineStatus: string
  onAction: (action: string, message: string, fn: () => Promise<unknown>) => void
}) {
  const config = STATUS_CONFIG[phase.status] || STATUS_CONFIG.pending
  const isActive = isCurrent && phase.status === 'running'

  return (
    <div className="flex gap-4 relative">
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-700/50" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 z-10',
          config.bgColor,
          isActive && 'animate-pulse-dot',
        )}
      >
        {PHASE_ICONS[phase.id] || '📌'}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn('text-sm font-semibold', config.color)}>
            Phase
            {' '}
            {phase.id}
            :
            {' '}
            {phase.name}
          </h3>

          {/* Phase action buttons */}
          {pipelineStatus === 'running' && phase.status === 'failed' && (
            <button
              onClick={() => onAction('重试', `确认重试 Phase ${phase.id}？`, () => api.retry(phase.id))}
              className="px-2 py-0.5 text-[10px] rounded bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
            >
              重试
            </button>
          )}
          {pipelineStatus === 'running' && phase.status === 'running' && (
            <button
              onClick={() => onAction('跳过', `确认跳过 Phase ${phase.id}？`, () => api.cancel({ scope: 'phase', phaseId: phase.id }))}
              className="px-2 py-0.5 text-[10px] rounded bg-orange-500/15 text-orange-400 hover:bg-orange-500/25"
            >
              跳过
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-0.5">
          {PHASE_DESCRIPTIONS[phase.id] || phase.name}
          {' — '}
          {config.label}
        </p>

        {/* Duration / file info */}
        {(phase.duration || phase.fileSize || phase.fileCount) && (
          <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
            {phase.duration != null && <span>{formatDuration(phase.duration)}</span>}
            {phase.fileCount != null && (
              <span>
                {phase.fileCount}
                {' '}
                文件
              </span>
            )}
            {phase.fileSize != null && <span>{formatSize(phase.fileSize)}</span>}
          </div>
        )}

        {/* Error */}
        {phase.error && (
          <div className="mt-2 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {phase.error}
          </div>
        )}

        {/* Phase 2 subtasks */}
        {phase.id === 2 && phase.subtasks && (
          <div className="mt-2 space-y-1">
            {phase.subtasks.map(st => (
              <div key={st.role} className="flex items-center gap-2 text-xs">
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    st.status === 'done' ? 'bg-green-500' : st.status === 'running' ? 'bg-blue-500 animate-pulse-dot' : st.status === 'failed' ? 'bg-red-500' : 'bg-slate-600',
                  )}
                />
                <span className="text-slate-400">{ROLE_LABELS[st.role] || st.role}</span>
                {st.fileSize != null && st.fileSize > 0 && (
                  <span className="text-slate-500 ml-auto text-[11px]">{formatSize(st.fileSize)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Phase 7 fix rounds */}
        {phase.id === 7 && fixRounds && (fixRounds.current > 0 || phase.status === 'running') && (
          <div className="mt-2">
            <span className="text-[11px] text-slate-500">
              修复轮次:
              {' '}
              {fixRounds.current}
              /
              {fixRounds.max}
            </span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: fixRounds.max }).map((_, i) => {
                let cls = 'bg-slate-700'
                if (i < fixRounds.results.length) {
                  cls = fixRounds.results[i] === 'passed' ? 'bg-green-500' : 'bg-red-500'
                }
                else if (i === fixRounds.results.length && phase.status === 'running') {
                  cls = 'bg-blue-500 animate-pulse-dot'
                }
                return <div key={i} className={cn('w-5 h-1.5 rounded-full', cls)} />
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
