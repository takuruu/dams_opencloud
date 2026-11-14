import { ProcessorRecord } from '../types'
import { extractBody, parseFrontmatter, serializeFrontmatter } from './frontmatter'

export const toProcessorRecord = (
  fileName: string,
  path: string,
  content: string,
  etag?: string
): ProcessorRecord => {
  const data = parseFrontmatter(content)
  const asString = (key: string): string => {
    const value = data[key]
    return Array.isArray(value) ? value.join(', ') : (value ?? '')
  }
  return {
    fileName,
    path,
    etag,
    firma: asString('firma'),
    dienstleistung: asString('dienstleistung'),
    kontakt: asString('kontakt'),
    vertragsbeginn: asString('vertragsbeginn'),
    vertragsende: asString('vertragsende'),
    status: asString('status') || 'entwurf',
    drittland: asString('drittland'),
    tom: asString('tom'),
    verfahren: Array.isArray(data.verfahren) ? data.verfahren : [],
    erstellt: asString('erstellt'),
    geaendert: asString('geaendert'),
    beschreibung: extractBody(content)
  }
}

export const toProcessorMarkdown = (record: ProcessorRecord): string => {
  const frontmatter = serializeFrontmatter({
    firma: record.firma,
    dienstleistung: record.dienstleistung,
    kontakt: record.kontakt,
    vertragsbeginn: record.vertragsbeginn,
    vertragsende: record.vertragsende,
    status: record.status,
    drittland: record.drittland,
    tom: record.tom,
    verfahren: record.verfahren,
    erstellt: record.erstellt,
    geaendert: record.geaendert
  })
  return `${frontmatter}\n\n${record.beschreibung.trim()}\n`
}
