import { describe, expect, it } from 'vitest'
import {
  buildFileName,
  extractBody,
  parseFrontmatter,
  serializeFrontmatter,
  toMarkdown,
  toRecord
} from '../../src/lib/frontmatter'

const sample = `---
titel: Webanalyse
zweck: Reichweitenmessung
kategorien:
  - IP-Adresse
  - Nutzungsdaten
status: entwurf
---

# Webanalyse

Beschreibungstext.
`

describe('frontmatter', () => {
  it('parses scalars and lists', () => {
    const data = parseFrontmatter(sample)
    expect(data.titel).toBe('Webanalyse')
    expect(data.kategorien).toEqual(['IP-Adresse', 'Nutzungsdaten'])
    expect(data.status).toBe('entwurf')
  })

  it('extracts the body after the frontmatter block', () => {
    expect(extractBody(sample)).toContain('# Webanalyse')
    expect(extractBody(sample)).toContain('Beschreibungstext.')
  })

  it('roundtrips through serialize, parse, toRecord and toMarkdown', () => {
    const record = toRecord('webanalyse.md', '/Verfahrensverzeichnis/webanalyse.md', sample)
    expect(record.titel).toBe('Webanalyse')
    expect(record.kategorien).toEqual(['IP-Adresse', 'Nutzungsdaten'])
    expect(record.beschreibung).toContain('# Webanalyse')

    const markdown = toMarkdown(record)
    const reparsed = toRecord('webanalyse.md', '/x', markdown)
    expect(reparsed).toEqual({ ...record, path: '/x', etag: undefined })
  })

  it('serializes empty lists', () => {
    const markdown = serializeFrontmatter({ kategorien: [] })
    expect(markdown).toContain('kategorien:')
  })

  it('builds unique, slugged file names', () => {
    expect(buildFileName('Lohn & Gehalt ÄÖÜ!', [])).toBe('lohn-gehalt-aeoeue.md')
    expect(buildFileName('Webanalyse', ['webanalyse.md'])).toBe('webanalyse-2.md')
  })

  it('handles content without frontmatter', () => {
    const data = parseFrontmatter('Just text')
    expect(data).toEqual({})
    expect(extractBody('Just text')).toBe('Just text')
  })
})
