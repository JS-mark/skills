const API_BASE = typeof window !== 'undefined'
  ? (localStorage.getItem('api_base') || 'http://localhost:3210')
  : 'http://localhost:3210'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

async function requestText(path: string): Promise<string> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok)
    throw new Error(`API ${res.status}`)
  return res.text()
}

// ─── Status ───
export const api = {
  getStatus: () => request<import('./types').PipelineStatus>('/api/status'),
  getDocs: () => request<import('./types').DocItem[]>('/api/docs'),
  getDocContent: (path: string) => requestText(`/api/doc?path=${encodeURIComponent(path)}`),
  getFileContent: (path: string) => requestText(`/api/file?path=${encodeURIComponent(path)}`),
  getLogs: () => request<import('./types').LogItem[]>('/api/logs'),
  getLogContent: (file: string) => requestText(`/api/logs?file=${encodeURIComponent(file)}`),

  // ─── Control ───
  pause: () => request('/api/control/pause', { method: 'POST' }),
  resume: () => request('/api/control/resume', { method: 'POST' }),
  cancel: (body: { scope: 'phase' | 'pipeline', phaseId?: number }) =>
    request('/api/control/cancel', { method: 'POST', body: JSON.stringify(body) }),
  retry: (phaseId: number) =>
    request('/api/control/retry', { method: 'POST', body: JSON.stringify({ phaseId }) }),
  skipTo: (phaseId: number) =>
    request('/api/control/skip-to', { method: 'POST', body: JSON.stringify({ phaseId }) }),

  // ─── Roles ───
  getRoles: () => request<import('./types').RoleInfo[]>('/api/roles'),
  getRole: (name: string) => request<import('./types').RoleInfo>(`/api/roles/${encodeURIComponent(name)}`),
  createRole: (name: string, content: string) =>
    request('/api/roles', { method: 'POST', body: JSON.stringify({ name, content }) }),
  updateRole: (name: string, content: string) =>
    request(`/api/roles/${encodeURIComponent(name)}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteRole: (name: string) =>
    request(`/api/roles/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  getRoleTemplates: () => request<Record<string, string>>('/api/roles/templates'),

  // ─── Code ───
  getCodeTree: () => request<import('./types').FileTreeNode[]>('/api/code/tree'),
  getCodeStats: () => request<import('./types').CodeStats>('/api/code/stats'),
  searchCode: (q: string) => request<{ file: string, line: number, text: string }[]>(`/api/code/search?q=${encodeURIComponent(q)}`),
  getCodeDiff: () => requestText('/api/code/diff'),
  getExportUrl: () => `${API_BASE}/api/export`,
}

// ─── WebSocket ───
export function createWS(onMessage: (msg: import('./types').WSMessage) => void): WebSocket | null {
  if (typeof window === 'undefined')
    return null
  const wsBase = API_BASE.replace(/^http/, 'ws')
  const ws = new WebSocket(`${wsBase}/ws`)
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data))
    }
    catch {}
  }
  return ws
}

// ─── SSE for log streaming ───
export function createLogStream(file: string, onData: (chunk: string) => void): EventSource | null {
  if (typeof window === 'undefined')
    return null
  const es = new EventSource(`${API_BASE}/api/logs/stream?file=${encodeURIComponent(file)}`)
  es.onmessage = e => onData(e.data)
  return es
}
