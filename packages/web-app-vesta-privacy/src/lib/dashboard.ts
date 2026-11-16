import { DamsModule, MODULES, ModuleRecord } from '../types'
import { parseFrontmatter } from './frontmatter'

export interface ModuleStats {
  module: DamsModule
  total: number
  done: number
  open: number
  ratio: number
}

export interface DashboardStats {
  modules: ModuleStats[]
  total: number
  done: number
  open: number
  ratio: number
}

const COMPLETED = ['freigegeben', 'abgeschlossen', 'umgesetzt', 'unterzeichnet']

export const computeModuleStats = (module: DamsModule, records: ModuleRecord[]): ModuleStats => {
  const total = records.length
  const done = records.filter((r) =>
    COMPLETED.includes(String(r.data.status ?? '').toLowerCase())
  ).length
  const open = total - done
  return { module, total, done, open, ratio: total ? done / total : 0 }
}

export const computeDashboardStats = (
  recordsByModule: Map<string, ModuleRecord[]>
): DashboardStats => {
  const modules = MODULES.filter((m) => m.id !== 'company').map((m) =>
    computeModuleStats(m, recordsByModule.get(m.id) ?? [])
  )
  const total = modules.reduce((sum, m) => sum + m.total, 0)
  const done = modules.reduce((sum, m) => sum + m.done, 0)
  const open = total - done
  return { modules, total, done, open, ratio: total ? done / total : 0 }
}

export const parseRawRecords = (
  module: DamsModule,
  docs: { fileName: string; path: string; content: string }[]
): ModuleRecord[] => {
  return docs.map((doc) => {
    const data = parseFrontmatter(doc.content)
    return {
      fileName: doc.fileName,
      path: doc.path,
      data: { status: String(data.status ?? '') },
      beschreibung: ''
    } as ModuleRecord
  })
}
