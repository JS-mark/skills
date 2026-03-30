export interface PipelineSubtask {
  role: string
  status: PhaseStatus
  fileExists?: boolean
  fileSize?: number
}

export type PhaseStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped' | 'cancelled'
export type PipelineGlobalStatus = 'running' | 'paused' | 'done' | 'failed' | 'cancelled'

export interface Phase {
  id: number
  name: string
  status: PhaseStatus
  subtasks?: PipelineSubtask[]
  startedAt?: string
  completedAt?: string
  duration?: number
  error?: string
  fileCount?: number
  fileSize?: number
}

export interface FixRounds {
  current: number
  max: number
  results: ('passed' | 'failed')[]
}

export interface SrcFile {
  path: string
  size: number
  mtime: string | null
}

export interface PipelineStatus {
  version: number
  feature: string
  status: PipelineGlobalStatus
  startedAt: string
  completedAt?: string
  currentPhase: number
  phases: Phase[]
  fixRounds: FixRounds
  srcFiles?: SrcFile[]
  timestamp?: string
}

export interface DocItem {
  category: string
  name: string
  path: string
  size: number
  mtime: string | null
}

export interface LogItem {
  name: string
  size: number
  mtime: string | null
}

export interface RoleInfo {
  name: string
  filename: string
  content: string
  builtIn: boolean
  size: number
}

export interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  mtime?: string | null
  children?: FileTreeNode[]
}

export interface CodeStats {
  totalFiles: number
  totalLines: number
  totalSize: number
  languages: Record<string, number>
}

export type WSMessage
  = | { type: 'status', data: PipelineStatus }
    | { type: 'phase_update', data: { phaseId: number, status: PhaseStatus } }
    | { type: 'log_append', data: { file: string, content: string } }
