export const appId = 'vesta-privacy'

export type ModuleFieldType = 'text' | 'list' | 'select' | 'date' | 'textarea'

export interface ModuleField {
  key: string
  label: string
  type: ModuleFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface ModuleColumn {
  key: string
  label: string
}

export interface DamsModule {
  id: string
  routeSlug: string
  title: string
  hint: string
  folderPath: string
  configKey: string
  nameField: string
  newLabel: string
  fields: ModuleField[]
  columns: ModuleColumn[]
}

export interface ModuleRecord {
  fileName: string
  path: string
  etag?: string
  data: Record<string, string | string[]>
  beschreibung: string
}

export const RECORD_STATUS_VALUES = ['entwurf', 'in Bearbeitung', 'freigegeben'] as const
export const PROCESSOR_STATUS_VALUES = ['entwurf', 'unterzeichnet', 'gekuendigt'] as const
export const TOM_STATUS_VALUES = ['geplant', 'in Umsetzung', 'umgesetzt'] as const
export const INCIDENT_STATUS_VALUES = ['offen', 'gemeldet', 'abgeschlossen'] as const
export const DSR_STATUS_VALUES = ['offen', 'in Bearbeitung', 'abgeschlossen'] as const
export const DSR_KIND_VALUES = [
  'Auskunft (Art. 15)',
  'Berichtigung (Art. 16)',
  'Löschung (Art. 17)',
  'Einschränkung (Art. 18)',
  'Datenübertragung (Art. 20)',
  'Widerspruch (Art. 21)'
] as const

const beschreibungField = (label: string): ModuleField => ({
  key: 'beschreibung',
  label,
  type: 'textarea',
  required: false
})

export const MODULES: DamsModule[] = [
  {
    id: 'records',
    routeSlug: 'records',
    title: 'Verfahrensverzeichnis (Art. 30 DSGVO)',
    hint: 'Alle Einträge sind Markdown-Dateien im Space. Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.',
    folderPath: '/Verfahrensverzeichnis',
    configKey: 'folderPath',
    nameField: 'titel',
    newLabel: 'Neues Verfahren',
    fields: [
      { key: 'titel', label: 'Titel der Verarbeitungstätigkeit', type: 'text', required: true },
      { key: 'verantwortlicher', label: 'Verantwortlicher', type: 'text', required: true },
      { key: 'zweck', label: 'Zweck der Verarbeitung', type: 'text', required: true },
      {
        key: 'kategorien',
        label: 'Kategorien personenbezogener Daten',
        type: 'list',
        required: true,
        placeholder: 'Kommagetrennt, z. B. IP-Adresse, Nutzungsdaten'
      },
      { key: 'betroffene', label: 'Kategorien betroffener Personen', type: 'text', required: true },
      { key: 'empfaenger', label: 'Empfänger', type: 'text', required: true },
      { key: 'drittland', label: 'Drittlandübermittlung', type: 'text', required: false },
      { key: 'loeschfrist', label: 'Löschfristen', type: 'text', required: true },
      { key: 'rechtsgrundlage', label: 'Rechtsgrundlage', type: 'text', required: true },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [...RECORD_STATUS_VALUES]
      },
      beschreibungField('Beschreibung (Markdown)')
    ],
    columns: [
      { key: 'titel', label: 'Titel' },
      { key: 'zweck', label: 'Zweck' },
      { key: 'status', label: 'Status' },
      { key: 'geaendert', label: 'Geändert' }
    ]
  },
  {
    id: 'avv',
    routeSlug: 'avv',
    title: 'Auftragsverarbeiter & AVV (Art. 28 DSGVO)',
    hint: 'Verzeichnis der Auftragsverarbeiter inkl. Auftragsverarbeitungsverträgen. Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.',
    folderPath: '/Auftragsverarbeiter',
    configKey: 'processorsFolderPath',
    nameField: 'firma',
    newLabel: 'Neuer Auftragsverarbeiter',
    fields: [
      { key: 'firma', label: 'Auftragsverarbeiter (Firma)', type: 'text', required: true },
      { key: 'dienstleistung', label: 'Dienstleistung', type: 'text', required: true },
      { key: 'kontakt', label: 'Ansprechpartner / Kontakt', type: 'text', required: true },
      { key: 'vertragsbeginn', label: 'Vertragsbeginn', type: 'date', required: true },
      {
        key: 'vertragsende',
        label: 'Vertragsende (Datum oder unbefristet)',
        type: 'text',
        required: true
      },
      {
        key: 'drittland',
        label: 'Drittlandübermittlung (Ja/Nein, ggf. Garantien)',
        type: 'text',
        required: false
      },
      { key: 'tom', label: 'TOM-Dokument erhalten (Ja/Nein)', type: 'text', required: false },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [...PROCESSOR_STATUS_VALUES]
      },
      {
        key: 'verfahren',
        label: 'Betroffene Verfahren (Titel aus dem Verfahrensverzeichnis)',
        type: 'list',
        required: true,
        placeholder: 'Kommagetrennt, z. B. Lohnbuchhaltung, Webanalyse'
      },
      beschreibungField('Notizen (Markdown)')
    ],
    columns: [
      { key: 'firma', label: 'Auftragsverarbeiter' },
      { key: 'dienstleistung', label: 'Dienstleistung' },
      { key: 'status', label: 'Status' },
      { key: 'vertragsende', label: 'Vertragsende' }
    ]
  },
  {
    id: 'tom',
    routeSlug: 'tom',
    title: 'Technische und organisatorische Maßnahmen',
    hint: 'Katalog der TOM (Art. 32 DSGVO) mit Umsetzungsstatus je Maßnahme. Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.',
    folderPath: '/TOM',
    configKey: 'tomFolderPath',
    nameField: 'massnahme',
    newLabel: 'Neue Maßnahme',
    fields: [
      { key: 'massnahme', label: 'Maßnahme', type: 'text', required: true },
      {
        key: 'bereich',
        label: 'Bereich (z. B. Zugriffskontrolle, Vertraulichkeit)',
        type: 'text',
        required: true
      },
      {
        key: 'umsetzung',
        label: 'Umsetzungsstatus',
        type: 'select',
        required: true,
        options: [...TOM_STATUS_VALUES]
      },
      {
        key: 'verantwortlich',
        label: 'Verantwortlich für Umsetzung',
        type: 'text',
        required: true
      },
      { key: 'frist', label: 'Frist / nächster Prüftermin', type: 'date', required: false },
      beschreibungField('Beschreibung der Maßnahme (Markdown)')
    ],
    columns: [
      { key: 'massnahme', label: 'Maßnahme' },
      { key: 'bereich', label: 'Bereich' },
      { key: 'umsetzung', label: 'Status' },
      { key: 'frist', label: 'Frist' }
    ]
  },
  {
    id: 'incidents',
    routeSlug: 'vorfälle',
    title: 'Datenschutzvorfälle (Art. 33/34 DSGVO)',
    hint: 'Dokumentation von Datenschutzvorfällen inkl. Meldepflicht-Prüfung. Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.',
    folderPath: '/Datenschutzvorfälle',
    configKey: 'incidentsFolderPath',
    nameField: 'titel',
    newLabel: 'Neuer Vorfall',
    fields: [
      { key: 'titel', label: 'Titel des Vorfalls', type: 'text', required: true },
      { key: 'eingang', label: 'Festgestellt am', type: 'date', required: true },
      {
        key: 'betroffene_daten',
        label: 'Betroffene Daten (Kategorien)',
        type: 'text',
        required: true
      },
      {
        key: 'betroffene_personen',
        label: 'Betroffene Personen (ungefähre Anzahl)',
        type: 'text',
        required: true
      },
      {
        key: 'meldepflichtig',
        label: 'Meldepflicht gegenüber Aufsichtsbehörde',
        type: 'select',
        required: true,
        options: ['ja', 'nein', 'unbekannt']
      },
      {
        key: 'frist_72h',
        label: 'Meldefrist (72 h, falls zutreffend)',
        type: 'date',
        required: false
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [...INCIDENT_STATUS_VALUES]
      },
      beschreibungField('Verlauf und Maßnahmen (Markdown)')
    ],
    columns: [
      { key: 'titel', label: 'Vorfall' },
      { key: 'eingang', label: 'Festgestellt' },
      { key: 'meldepflichtig', label: 'Meldepflicht' },
      { key: 'status', label: 'Status' }
    ]
  },
  {
    id: 'dsr',
    routeSlug: 'anfragen',
    title: 'Betroffenenanfragen (Art. 15–22 DSGVO)',
    hint: 'Anfragen Betroffener mit Fristen-Tracking (Antwort in der Regel innerhalb eines Monats). Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.',
    folderPath: '/Betroffenenanfragen',
    configKey: 'dsrFolderPath',
    nameField: 'betrifft',
    newLabel: 'Neue Anfrage',
    fields: [
      {
        key: 'betrifft',
        label: 'Anfrage betrifft (Person, anonymisiert dokumentiert)',
        type: 'text',
        required: true
      },
      {
        key: 'art',
        label: 'Art der Anfrage',
        type: 'select',
        required: true,
        options: [...DSR_KIND_VALUES]
      },
      { key: 'eingang', label: 'Eingang der Anfrage', type: 'date', required: true },
      {
        key: 'frist',
        label: 'Antwortfrist (in der Regel + 1 Monat)',
        type: 'date',
        required: true
      },
      { key: 'antwort_am', label: 'Beantwortet am', type: 'date', required: false },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [...DSR_STATUS_VALUES]
      },
      beschreibungField('Sachverhalt und Bearbeitung (Markdown)')
    ],
    columns: [
      { key: 'betrifft', label: 'Betrifft' },
      { key: 'art', label: 'Art' },
      { key: 'frist', label: 'Frist' },
      { key: 'status', label: 'Status' }
    ]
  }
]

export const getModule = (id: string): DamsModule => {
  const module = MODULES.find((m) => m.id === id)
  if (!module) {
    throw new Error(`Unknown module: ${id}`)
  }
  return module
}

export interface DamsConfig {
  spaceName: string
  folderPaths: Record<string, string>
}

export const defaultConfig: DamsConfig = {
  spaceName: 'Datenschutz',
  folderPaths: Object.fromEntries(MODULES.map((m) => [m.configKey, m.folderPath]))
}
