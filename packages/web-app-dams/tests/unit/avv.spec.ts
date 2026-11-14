import { describe, expect, it } from 'vitest'
import { toProcessorMarkdown, toProcessorRecord } from '../../src/lib/avv'

const sample = `---
firma: Analytics GmbH
dienstleistung: Webanalyse-Hosting
kontakt: Jane Doe, privacy@analytics.example
vertragsbeginn: 2026-01-10
vertragsende: unbefristet
status: unterzeichnet
drittland: Nein
tom: Ja
verfahren:
  - Webanalyse und Reichweitenmessung
erstellt: 2026-01-15
geaendert: 2026-02-01
---

# AVV Analytics GmbH

Notizen zum Vertrag.
`

describe('avv', () => {
  it('parses a processor document', () => {
    const record = toProcessorRecord(
      'analytics-gmbh.md',
      '/Auftragsverarbeiter/analytics-gmbh.md',
      sample
    )
    expect(record.firma).toBe('Analytics GmbH')
    expect(record.status).toBe('unterzeichnet')
    expect(record.verfahren).toEqual(['Webanalyse und Reichweitenmessung'])
    expect(record.beschreibung).toContain('# AVV Analytics GmbH')
  })

  it('roundtrips through markdown', () => {
    const record = toProcessorRecord('a.md', '/x', sample)
    const markdown = toProcessorMarkdown(record)
    const reparsed = toProcessorRecord('a.md', '/y', markdown)
    expect(reparsed).toEqual({ ...record, path: '/y', etag: undefined })
  })

  it('defaults status to entwurf', () => {
    const record = toProcessorRecord('a.md', '/x', '---\nfirma: X\n---\nText')
    expect(record.status).toBe('entwurf')
    expect(record.verfahren).toEqual([])
  })
})
