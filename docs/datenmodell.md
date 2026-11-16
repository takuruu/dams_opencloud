# Datenmodell

## Module

Vesta Privacy verwendet zwei Ordner im Space, je ein Modul:

| Modul                                            | Ordner                  | Route              |
| ------------------------------------------------ | ----------------------- | ------------------ |
| Unternehmen (Stammdaten)                         | `/Unternehmen`          | `/{appId}/unternehmen` |
| Verfahrensverzeichnis (Art. 30)                  | `/Verfahrensverzeichnis` | `/{appId}/records` |
| Auftragsverarbeiter & AVV (Art. 28)              | `/Auftragsverarbeiter`  | `/{appId}/avv`     |
| Technische und organisatorische Maßnahmen (Art. 32) | `/TOM`                | `/{appId}/tom`     |
| Datenschutzvorfälle (Art. 33/34)                  | `/Datenschutzvorfälle`  | `/{appId}/vorfälle` |
| Betroffenenanfragen (Art. 15–22)                 | `/Betroffenenanfragen`  | `/{appId}/anfragen` |
| Richtlinien & Konzepte                           | `/Richtlinien`          | `/{appId}/richtlinien` |

Alle Module folgen demselben Prinzip: eine Markdown-Datei pro Eintrag,
YAML-Frontmatter für strukturierte Felder, Freitext für Details. Die App legt
die Ordnerstruktur nach dem Schema in `src/types.ts` (`MODULES`) an – neue
Module sind dort reine Konfiguration (Feld-Deskriptoren), ohne eigene View.

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

---

# Modul 3: Technische und organisatorische Maßnahmen (Art. 32 DSGVO)

Jede Maßnahme ist eine Datei im Ordner `/TOM` (eine Maßnahme = ein Eintrag mit
eigenem Umsetzungsstatus).

| Feld            | Bedeutung                          | Typ                                        |
| --------------- | ---------------------------------- | ------------------------------------------ |
| `massnahme`     | Kurztitel der Maßnahme             | String                                     |
| `bereich`       | z. B. Zugriffskontrolle            | String                                     |
| `umsetzung`     | Umsetzungsstatus                   | `geplant` \| `in Umsetzung` \| `umgesetzt` |
| `verantwortlich`| Rolle/Person für Umsetzung         | String                                     |
| `frist`         | Frist / nächster Prüftermin        | ISO-Datum                                  |
| `erstellt`/`geaendert` | intern                     | ISO-Datum                                  |

---

# Modul 4: Datenschutzvorfälle (Art. 33/34 DSGVO)

Jeder Vorfall ist eine Datei im Ordner `/Datenschutzvorfälle`. Zentrale Felder
für die Meldepflicht-Prüfung (72-h-Frist, Art. 33 Abs. 1):

| Feld                   | Bedeutung                          | Typ                                  |
| ---------------------- | ---------------------------------- | ------------------------------------ |
| `titel`               | Kurztitel des Vorfalls             | String                               |
| `eingang`             | Festgestellt am                    | ISO-Datum                            |
| `betroffene_daten`    | Kategorien betroffener Daten       | String                               |
| `betroffene_personen` | Anzahl/Kategorien betroffener Personen | String                          |
| `meldepflichtig`      | Meldeschwellen-Prüfung             | `ja` \| `nein` \| `unbekannt`      |
| `frist_72h`           | 72-h-Frist, falls zutreffend       | ISO-Datum                            |
| `status`              | `offen` \| `gemeldet` \| `abgeschlossen` | String                      |
| `erstellt`/`geaendert`| intern                             | ISO-Datum                            |

---

# Modul 5: Betroffenenanfragen (Art. 15–22 DSGVO)

Jede Anfrage ist eine Datei im Ordner `/Betroffenenanfragen`. Personen werden
anonymisiert dokumentiert (kein Klartext von Namen im Frontmatter).

| Feld          | Bedeutung                            | Typ                        |
| ------------- | ------------------------------------ | -------------------------- |
| `betrifft`    | Person, anonymisiert                 | String                     |
| `art`         | Art der Anfrage (Art. 15–21)         | Select, z. B. `Auskunft (Art. 15)` |
| `eingang`     | Eingangsdatum                        | ISO-Datum                  |
| `frist`       | Antwortfrist (i. d. R. + 1 Monat)    | ISO-Datum                  |
| `antwort_am`  | Beantwortet am                       | ISO-Datum                  |
| `status`      | `offen` \| `in Bearbeitung` \| `abgeschlossen` | String          |
| `erstellt`/`geaendert` | intern                    | ISO-Datum                  |

## Versionierung

Die App schreibt ausschließlich über die WebDAV-API von OpenCloud. Jedes Überschreiben
einer existierenden Datei erzeugt dadurch automatisch eine neue Version in OpenCloud.
Die App selbst speichert keine Historie – die Historie ist die Dateiversionierung
von OpenCloud (einsehbar über die Weboberfläche, wiederherstellbar für Berechtigte).
