'use client'

import type { PipelineStatus } from '@/lib/types'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import { ConfirmDialog } from './confirm-dialog'

interface ControlBarProps {
  status: PipelineStatus
}

export function ControlBar({ status }: ControlBarProps) {
  const [confirm, setConfirm] = useState<{ action: string, message: string, onConfirm: () => Promise<void> } | null>(null)
  const [loading, setLoading] = useState(false)

  const isRunning = status.status === 'running'
  const isPaused = status.status === 'paused'
  const isDone = status.status === 'done' || status.status === 'failed' || status.status === 'cancelled'

  async function exec(action: string, message: string, fn: () => Promise<unknown>) {
    setConfirm({
      action,
      message,
      onConfirm: async () => {
        setLoading(true)
        try { await fn() }
        catch (e) { console.error(e) }
        finally { setLoading(false); setConfirm(null) }
      },
    })
  }

  if (isDone)
    return null

  return (
    <>
      <div className="flex items-center gap-1.5">
        {isRunning && (
          <button
            onClick={() => exec('暂停', '确认暂停流水线？Agent 将在当前操作完成后暂停。', () => api.pause())}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 transition-colors disabled:opacity-50"
          >
            ⏸ 暂停
          </button>
        )}

        {isPaused && (
          <button
            onClick={() => exec('恢复', '确认恢复流水线执行？', () => api.resume())}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50"
          >
            ▶ 恢复
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            onClick={() => exec('终止', '确认终止整条流水线？所有未完成阶段将被取消。', () => api.cancel({ scope: 'pipeline' }))}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
          >
            ⏹ 终止
          </button>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.action}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
