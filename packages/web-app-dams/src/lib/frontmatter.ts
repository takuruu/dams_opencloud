const FRONTMATTER_DELIMITER = '---'

export const parseFrontmatter = (content: string): Record<string, string | string[]> => {
  const lines = content.split(/\r?\n/)
  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    return {}
  }
  const result: Record<string, string | string[]> = {}
  let currentKey: string | null = null
  let currentList: string[] | null = null

  const flushList = () => {
    if (currentKey && currentList) {
      result[currentKey] = currentList
    }
    currentKey = null
    currentList = null
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === FRONTMATTER_DELIMITER) {
      flushList()
      return result
    }
    const listItem = line.match(/^\s+-\s+(.*)$/)
    if (listItem && currentKey) {
      currentList = currentList || []
      currentList.push(listItem[1].trim())
      continue
    }
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/)
    if (match) {
      flushList()
      currentKey = match[1]
      const value = match[2].trim()
      if (value === '') {
        currentList = []
      } else {
        result[currentKey] = value
        currentKey = null
      }
    }
  }
  flushList()
  return result
}

export const extractBody = (content: string): string => {
  const lines = content.split(/\r?\n/)
  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    return content.trim()
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FRONTMATTER_DELIMITER) {
      return lines
        .slice(i + 1)
        .join('\n')
        .trim()
    }
  }
  return ''
}

const serializeList = (key: string, items: string[]): string => {
  if (!items.length) {
    return `${key}:`
  }
  return [`${key}:`, ...items.map((item) => `  - ${item}`)].join('\n')
}

export const serializeFrontmatter = (data: Record<string, string | string[]>): string => {
  const entries = Object.entries(data).map(([key, value]) =>
    Array.isArray(value) ? serializeList(key, value) : `${key}: ${value}`
  )
  return [FRONTMATTER_DELIMITER, ...entries, FRONTMATTER_DELIMITER].join('\n')
}

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const buildFileName = (value: string, existing: string[]): string => {
  const base = slugify(value) || 'eintrag'
  let fileName = `${base}.md`
  let counter = 2
  while (existing.includes(fileName)) {
    fileName = `${base}-${counter}.md`
    counter++
  }
  return fileName
}
