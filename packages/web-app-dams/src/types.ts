export const appId = 'dams'

export const STATUS_VALUES = ['entwurf', 'in Bearbeitung', 'freigegeben'] as const
export type RecordStatus = (typeof STATUS_VALUES)[number]

export interface ProcessingRecord {
  fileName: string
  path: string
  etag?: string
  titel: string
  verantwortlicher: string
  zweck: string
  kategorien: string[]
  betroffene: string
  empfaenger: string
  drittland: string
  loeschfrist: string
  rechtsgrundlage: string
  status: string
  erstellt: string
  geaendert: string
  beschreibung: string
}

export const RECORD_FIELDS = [
  'titel',
  'verantwortlicher',
  'zweck',
  'betroffene',
  'empfaenger',
  'drittland',
  'loeschfrist',
  'rechtsgrundlage',
  'status'
] as const

export const PROCESSOR_STATUS_VALUES = ['entwurf', 'unterzeichnet', 'gekuendigt'] as const
export type ProcessorStatus = (typeof PROCESSOR_STATUS_VALUES)[number]

export interface ProcessorRecord {
  fileName: string
  path: string
  etag?: string
  firma: string
  dienstleistung: string
  kontakt: string
  vertragsbeginn: string
  vertragsende: string
  status: string
  drittland: string
  tom: string
  verfahren: string[]
  erstellt: string
  geaendert: string
  beschreibung: string
}

export const PROCESSOR_FIELDS = [
  'firma',
  'dienstleistung',
  'kontakt',
  'vertragsbeginn',
  'vertragsende',
  'drittland',
  'tom'
] as const

export interface DamsConfig {
  spaceName: string
  folderPath: string
  processorsFolderPath: string
}

export const defaultConfig: DamsConfig = {
  spaceName: 'Datenschutz',
  folderPath: '/Verfahrensverzeichnis',
  processorsFolderPath: '/Auftragsverarbeiter'
}
