# Datenmodell: Verfahrensverzeichnis (Art. 30 DSGVO)

Jede Verarbeitungstätigkeit ist eine Markdown-Datei im Ordner
`/Verfahrensverzeichnis` des konfigurierten Spaces. Dateiname-Konvention:
`NN-kurztitel.md` (z. B. `01-webanalyse.md`), wobei `NN` eine fortlaufende Nummer ist.

## Aufbau einer Datei

```markdown
---
titel: Webanalyse und Reichweitenmessung
verantwortlicher: Max Mustermann (Geschäftsführung)
zweck: Reichweitenmessung und Optimierung des Webauftritts
kategorien: Webanalyse, Marketing
betroffene: Websitebesucher
empfaenger: Auftragsverarbeiter Analytics GmbH
drittland: Nein
loeschfrist: 14 Monate
rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO
status: in Bearbeitung
erstellt: 2026-01-15
geaendert: 2026-02-01
---

# Webanalyse und Reichweitenmessung

## Beschreibung der Tätigkeit
...

## Technische und organisatorische Maßnahmen
...
```

## Felder (Frontmatter)

| Feld              | DSGVO-Bezug                  | Pflicht | Typ             |
| ----------------- | ---------------------------- | ------- | --------------- |
| `titel`           | Benennung der Tätigkeit      | ja      | String          |
| `verantwortlicher`| Art. 30 Abs. 1 lit. a/g      | ja      | String          |
| `zweck`           | Art. 30 Abs. 1 lit. b        | ja      | String          |
| `kategorien`      | Art. 30 Abs. 1 lit. c/e      | ja      | Liste (Strings) |
| `betroffene`      | Art. 30 Abs. 1 lit. c        | ja      | String          |
| `empfaenger`      | Art. 30 Abs. 1 lit. d        | ja      | String          |
| `drittland`       | Art. 30 Abs. 1 lit. e        | ja      | String          |
| `loeschfrist`     | Art. 30 Abs. 1 lit. f        | ja      | String          |
| `rechtsgrundlage` | Art. 6 DSGVO                 | ja      | String          |
| `status`          | intern                       | ja      | `entwurf` \| `in Bearbeitung` \| `freigegeben` |
| `erstellt`        | intern (ISO-Datum)           | ja      | String          |
| `geaendert`       | intern (ISO-Datum)           | ja      | String          |

## Parsing-Regeln

- Frontmatter ist durch `---`-Zeilen eingeschlossen (YAML-Untermenge).
- Skalare: `key: value`. Listen: eine Zeile pro Eintrag mit `- ` unter dem Key.
- Der Freitext nach dem Frontmatter ist die ausführliche Beschreibung und kann
  beliebige Markdown-Abschnitte enthalten.
- Die App toleriert fehlende Felder (leere Anzeige), validiert aber Pflichtfelder
  beim Speichern.

## Versionierung

Die App schreibt ausschließlich über die WebDAV-API von OpenCloud. Jedes Überschreiben
einer existierenden Datei erzeugt dadurch automatisch eine neue Version in OpenCloud.
Die App selbst speichert keine Historie – die Historie ist die Dateiversionierung
von OpenCloud (einsehbar über die Weboberfläche, wiederherstellbar für Berechtigte).
