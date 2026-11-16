import { DamsModule, ModuleRecord } from '../types'
import { extractBody, parseFrontmatter, serializeFrontmatter } from './frontmatter'

const asString = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value.join(', ') : (value ?? '')
}

export const parseModuleRecord = (
  module: DamsModule,
  fileName: string,
  path: string,
  content: string,
  etag?: string
): ModuleRecord => {
  const data = parseFrontmatter(content)
  const record: ModuleRecord = {
    fileName,
    path,
    etag,
    data: {},
    beschreibung: extractBody(content)
  }
  for (const field of module.fields) {
    if (field.type === 'textarea') {
      continue
    }
    const value = data[field.key]
    record.data[field.key] =
      field.type === 'list' ? (Array.isArray(value) ? value : []) : asString(value)
  }
  record.data.erstellt = asString(data.erstellt)
  record.data.geaendert = asString(data.geaendert)
  return record
}

export const buildModuleMarkdown = (module: DamsModule, record: ModuleRecord): string => {
  const frontmatterData: Record<string, string | string[]> = {}
  for (const field of module.fields) {
    if (field.type === 'textarea') {
      continue
    }
    frontmatterData[field.key] = record.data[field.key] ?? (field.type === 'list' ? [] : '')
  }
  frontmatterData.erstellt = record.data.erstellt ?? ''
  frontmatterData.geaendert = record.data.geaendert ?? ''
  return `${serializeFrontmatter(frontmatterData)}\n\n${record.beschreibung.trim()}\n`
}

export const emptyModuleRecord = (module: DamsModule): ModuleRecord => {
  const data: Record<string, string | string[]> = {}
  for (const field of module.fields) {
    if (field.type === 'textarea') {
      continue
    }
    if (field.type === 'select' && field.options?.length) {
      data[field.key] = field.options[0]
    } else if (field.type === 'list') {
      data[field.key] = []
    } else {
      data[field.key] = ''
    }
  }
  data.erstellt = ''
  data.geaendert = ''
  return { fileName: '', path: '', data, beschreibung: '' }
}
