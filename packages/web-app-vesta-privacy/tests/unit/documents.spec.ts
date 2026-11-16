import { describe, expect, it } from 'vitest'
import { buildModuleMarkdown, emptyModuleRecord, parseModuleRecord } from '../../src/lib/documents'
import { computeDashboardStats, computeModuleStats } from '../../src/lib/dashboard'
import { buildFileName } from '../../src/lib/frontmatter'
import { getModule, MODULES, ModuleRecord } from '../../src/types'

describe('frontmatter helpers', () => {
  it('builds unique, slugged file names', () => {
    expect(buildFileName('Lohn & Gehalt ÄÖÜ!', [])).toBe('lohn-gehalt-aeoeue.md')
    expect(buildFileName('Webanalyse', ['webanalyse.md'])).toBe('webanalyse-2.md')
  })
})

describe('module documents', () => {
  it('defines seven non-overlapping modules', () => {
    expect(MODULES.map((m) => m.id)).toEqual([
      'company',
      'records',
      'avv',
      'tom',
      'incidents',
      'dsr',
      'policies'
    ])
    const slugs = MODULES.map((m) => m.routeSlug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  for (const module of MODULES) {
    it(`roundtrips a ${module.id} document`, () => {
      const record = emptyModuleRecord(module)
      record.data[module.nameField] = `Testeintrag ${module.id}`
      const selectField = module.fields.find((f) => f.type === 'select' && f.options?.length)
      const selectValue = selectField?.options?.[selectField.options.length - 1]
      if (selectField && selectValue) {
        record.data[selectField.key] = selectValue
      }
      record.beschreibung = '# Testeintrag\n\nBeschreibungstext.'

      const markdown = buildModuleMarkdown(module, record)
      const reparsed = parseModuleRecord(module, 'testeintrag.md', '/x', markdown)

      expect(reparsed.beschreibung).toContain('# Testeintrag')
      expect(reparsed.data[module.nameField]).toBe(`Testeintrag ${module.id}`)
      if (selectField && selectValue) {
        expect(reparsed.data[selectField.key]).toBe(selectValue)
      }
      expect(reparsed.data.erstellt).toBe(record.data.erstellt)
    })
  }

  it('parses lists and tolerates missing fields', () => {
    const records = getModule('records')
    const sample = [
      '---',
      'titel: Webanalyse',
      'kategorien:',
      '  - IP-Adresse',
      '  - Nutzungsdaten',
      'status: entwurf',
      '---',
      '',
      '# Webanalyse',
      ''
    ].join('\n')
    const record = parseModuleRecord(records, 'webanalyse.md', '/x', sample)
    expect(record.data.kategorien).toEqual(['IP-Adresse', 'Nutzungsdaten'])
    expect(record.data.zweck).toBe('')
    expect(record.beschreibung).toContain('# Webanalyse')
  })

  it('keeps processor verfahren links as lists', () => {
    const avv = getModule('avv')
    const sample = [
      '---',
      'firma: Analytics GmbH',
      'status: unterzeichnet',
      'verfahren:',
      '  - Webanalyse und Reichweitenmessung',
      '---',
      '',
      'Notizen',
      ''
    ].join('\n')
    const record = parseModuleRecord(avv, 'a.md', '/x', sample)
    expect(record.data.verfahren).toEqual(['Webanalyse und Reichweitenmessung'])
    expect(record.data.status).toBe('unterzeichnet')
  })

  it('creates empty records with select defaults', () => {
    const tom = getModule('tom')
    const record = emptyModuleRecord(tom)
    expect(record.data.umsetzung).toBe('geplant')
    expect(record.data.frist).toBe('')
    expect(record.data.beschreibung).toBeUndefined()
  })
})

describe('dashboard readiness', () => {
  const rec = (status: string): ModuleRecord => ({
    fileName: 'x.md',
    path: '/x',
    data: { status },
    beschreibung: ''
  })

  it('counts only completed statuses as done', () => {
    const records = getModule('records')
    const stats = computeModuleStats(records, [
      rec('freigegeben'),
      rec('entwurf'),
      rec('in Bearbeitung'),
      rec('freigegeben')
    ])
    expect(stats.total).toBe(4)
    expect(stats.done).toBe(2)
    expect(stats.open).toBe(2)
    expect(stats.ratio).toBe(0.5)
  })

  it('handles empty modules without division by zero', () => {
    const stats = computeModuleStats(getModule('tom'), [])
    expect(stats.ratio).toBe(0)
    expect(stats.total).toBe(0)
  })

  it('aggregates across modules excluding company', () => {
    const map = new Map<string, ModuleRecord[]>()
    map.set('records', [rec('freigegeben'), rec('entwurf')])
    map.set('tom', [rec('umgesetzt')])
    map.set('company', [rec('freigegeben'), rec('freigegeben')])
    const stats = computeDashboardStats(map)
    expect(stats.total).toBe(3)
    expect(stats.done).toBe(2)
    expect(stats.ratio).toBeCloseTo(2 / 3)
    expect(stats.modules.map((m) => m.module.id)).not.toContain('company')
  })
})
