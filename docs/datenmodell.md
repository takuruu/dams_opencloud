# Datenmodell

## Module

Das DAMS verwendet zwei Ordner im Space, je ein Modul:

| Modul                        | Ordner                 | Route        |
| ---------------------------- | ---------------------- | ------------ |
| Verfahrensverzeichnis (Art. 30) | `/Verfahrensverzeichnis` | `/{appId}/records` |
| Auftragsverarbeiter & AVV (Art. 28) | `/Auftragsverarbeiter` | `/{appId}/avv` |

Beide Module folgen demselben Prinzip: eine Markdown-Datei pro Eintrag,
YAML-Frontmatter für strukturierte Felder, Freitext für Details.

---

# Modul 1: Verfahrensverzeichnis (Art. 30 DSGVO)

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

---

# Modul 2: Auftragsverarbeiter & AVV (Art. 28 DSGVO)

Jeder Auftragsverarbeiter ist eine Markdown-Datei im Ordner
`/Auftragsverarbeiter`. Dateiname-Konvention: `kurztitel.md` (automatisch aus dem
Firmennamen erzeugt, z. B. `analytics-gmbh.md`).

## Aufbau einer Datei

```markdown
---
firma: Analytics GmbH
dienstleistung: Hosting und Betrieb der Webanalyse-Software
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

# AVV: Analytics GmbH

## Vertragsgegenstand
...
```

## Felder (Frontmatter)

| Feld             | DSGVO-Bezug                       | Pflicht | Typ             |
| ---------------- | --------------------------------- | ------- | --------------- |
| `firma`          | Benennung des Auftragsverarbeiters | ja     | String          |
| `dienstleistung` | Art der Verarbeitung              | ja      | String          |
| `kontakt`        | intern                            | ja      | String          |
| `vertragsbeginn` | intern (ISO-Datum)                | ja      | String          |
| `vertragsende`   | intern (ISO-Datum/unbefristet)    | ja      | String          |
| `status`         | Vertragsstatus                    | ja      | `entwurf` \| `unterzeichnet` \| `gekuendigt` |
| `drittland`      | Art.  44 ff. DSGVO                | ja      | String          |
| `tom`            | Art. 28 Abs. 3 lit. f DSGVO       | ja      | String (Ja/Nein) |
| `verfahren`      | Verknüpfung zum Verfahrensverzeichnis (Titel) | ja | Liste (Strings) |
| `erstellt`       | intern (ISO-Datum)                | ja      | String          |
| `geaendert`      | intern (ISO-Datum)                | ja      | String          |

Die Verknüpfung zu Verfahren erfolgt über die Liste `verfahren` mit den Titeln
der Einträge im Verfahrensverzeichnis – bewusst als lesbarer Text statt IDs,
damit die Dokumentation auch ohne die App nachvollziehbar bleibt.

## Versionierung

Die App schreibt ausschließlich über die WebDAV-API von OpenCloud. Jedes Überschreiben
einer existierenden Datei erzeugt dadurch automatisch eine neue Version in OpenCloud.
Die App selbst speichert keine Historie – die Historie ist die Dateiversionierung
von OpenCloud (einsehbar über die Weboberfläche, wiederherstellbar für Berechtigte).
