'use client'

import type { DocItem, LogItem, PipelineStatus, WSMessage } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, createWS } from '@/lib/api-client'

export function usePipeline() {
  const [status, setStatus] = useState<PipelineStatus | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [logs, setLogs] = useState<LogItem[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const prevStatusRef = useRef<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [s, d, l] = await Promise.all([api.getStatus(), api.getDocs(), api.getLogs()])
      setStatus(s)
      setDocs(d)
      setLogs(l)
      setError(null)

      // Browser notification on phase change
      if (prevStatusRef.current && s.status !== prevStatusRef.current) {
        if (Notification.permission === 'granted') {
          const title = s.status === 'done' ? '流水线完成' : s.status === 'failed' ? '流水线失败' : `状态: ${s.status}`
          new Notification(title, { body: `Feature: ${s.feature}` })
        }
      }
      prevStatusRef.current = s.status
    }
    catch (e) {
      setError((e as Error).message)
    }
  }, [])

  const connectWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    const ws = createWS((msg: WSMessage) => {
      if (msg.type === 'status') {
        setStatus(msg.data)
      }
      else {
        // For other message types, refetch all data
        fetchAll()
      }
    })
    if (!ws)
      return

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      // Reconnect after 3s
      retryRef.current = setTimeout(connectWS, 3000)
    }
    ws.onerror = () => ws.close()
    wsRef.current = ws
  }, [fetchAll])

  useEffect(() => {
    fetchAll()
    connectWS()

    // Fallback polling if WS isn't connected
    const interval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchAll()
      }
    }, 5000)

    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      clearInterval(interval)
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [fetchAll, connectWS])

  return { status, docs, logs, connected, error, refetch: fetchAll }
}
