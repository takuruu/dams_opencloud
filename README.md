# Vesta Privacy – Datenschutzmanagementsystem für OpenCloud

Vesta Privacy ist eine Web-App-Erweiterung für [OpenCloud](https://opencloud.eu), mit der kleine
Unternehmen ihre DSGVO-Dokumentation direkt in OpenCloud pflegen können – als Flat-Files
in Markdown, mit automatischer Datei-Versionierung durch OpenCloud.

Funktionsumfang:

- **Unternehmen** (Stammdaten als Markdown-Datei, Startseite der App)
- **Verfahrensverzeichnis** nach Art. 30 DSGVO
- **Auftragsverarbeiter & AVV** nach Art. 28 DSGVO (Vertragsstatus, Drittland-Angaben,
  TOM-Nachweis, Verknüpfung zu Verfahren)
- **TOM** nach Art. 32 DSGVO (Maßnahmenkatalog mit Umsetzungsstatus je Maßnahme)
- **Datenschutzvorfälle** nach Art. 33/34 DSGVO (mit Meldepflicht-Prüfung und 72-h-Frist)
- **Betroffenenanfragen** nach Art. 15–22 DSGVO (mit Fristen-Tracking)
- **Richtlinien & Konzepte** (interne Datenschutzrichtlinien mit Prüfzyklus)

## Grundprinzip

- **Dokumentation = Markdown-Dateien.** Jede Verarbeitungstätigkeit ist eine
  `.md`-Datei mit strukturiertem YAML-Frontmatter und Freitext-Beschreibung.
- **Keine eigene Datenbank.** Die Dateien liegen in einem normalen OpenCloud-Space
  (Standard: Space `Datenschutz`, Ordner `Verfahrensverzeichnis`).
- **Versionierung durch OpenCloud.** Jedes Speichern in der App erzeugt über die
  WebDAV-API eine neue Dateiversion in OpenCloud. Die Versionshistorie ist über die
  Weboberfläche einsehbar und ältere Versionen können wiederhergestellt werden.
- **Offen für andere Werkzeuge.** Da alles Markdown ist, funktioniert die Doku auch
  ohne die App (Desktop-Client, Text-Editor) und kann per CLI synchronisiert werden.

## Repository-Struktur

```
├── packages/web-app-vesta-privacy/   # OpenCloud Web-App (Vue 3 / TypeScript)
├── templates/               # Markdown-Vorlagen & Beispiele (alle Module)
├── cli/                     # Optionales CLI: Sync der Markdown-Struktur via WebDAV
└── docs/                    # Konzept, Datenmodell, Installation
```

## Schnellstart (Entwicklung)

Voraussetzungen: Node >= 22, pnpm, Docker.

```bash
cd packages/web-app-vesta-privacy
pnpm install
pnpm build:w        # Watch-Build in dist/
```

In einem zweiten Terminal im Repo-Root:

```bash
docker compose up   # startet OpenCloud auf https://localhost:9200
```

Login `admin` / `admin`. Die App erscheint nach dem Neuladen der Weboberfläche als
„Datenschutz“ im App-Switcher, mit Navigation zwischen den Modulen. Für die
Nutzung: einen Space namens `Datenschutz` anlegen und dort die Ordner aus
`templates/` ablegen (die App legt fehlende Ordner beim ersten Aufruf selbst an).

 Mehr zur Installation und Konfiguration: [docs/installation.md](docs/installation.md)

## Konfiguration

Die App kann über die OpenCloud-`config.json` (Abschnitt der App `vesta-privacy`) konfiguriert
werden:

```json
{
  "apps": {
    "vesta-privacy": {
      "spaceName": "Datenschutz",
      "folderPaths": {
        "folderPath": "/Verfahrenszeichnis",
        "processorsFolderPath": "/Auftragsverarbeiter",
        "tomFolderPath": "/TOM",
        "incidentsFolderPath": "/Datenschutzvorfälle",
        "dsrFolderPath": "/Betroffenenanfragen",
        "companyFolderPath": "/Unternehmen",
        "policiesFolderPath": "/Richtlinien"
      }
    }
  }
}
```

- `spaceName` – Name des Spaces, in dem die Dokumentation liegt (Standard: `Datenschutz`)
- `folderPaths` – Ordnerpfade je Modul im Space (Schlüssel: `folderPath` = Verfahrensverzeichnis,
  `processorsFolderPath` = AVV, `tomFolderPath` = TOM, `incidentsFolderPath` = Vorfälle,
  `dsrFolderPath` = Betroffenenanfragen)

## CLI-Sync (optional)

```bash
export OPENCLOUD_URL=https://opencloud.example.com
export OPENCLOUD_ACCESS_TOKEN=<persönliches Zugriffstoken>
export OPENCLOUD_SPACE=Datenschutz

python3 cli/vesta_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis
python3 cli/vesta_sync.py templates/Auftragsverarbeiter /Auftragsverarbeiter
python3 cli/vesta_sync.py templates/TOM /TOM
python3 cli/vesta_sync.py templates/Datenschutzvorfälle /Datenschutzvorfälle
python3 cli/vesta_sync.py templates/Betroffenenanfragen /Betroffenenanfragen
```

Das CLI legt fehlende Ordner an und lädt neue/geänderte Markdown-Dateien per WebDAV
hoch – dabei erzeugt OpenCloud automatisch neue Versionen. Details: [cli/README.md](cli/README.md).

## Dokumentation

- [docs/konzept.md](docs/konzept.md) – Architektur und Grundprinzipien
- [docs/datenmodell.md](docs/datenmodell.md) – Frontmatter-Schemas aller fünf DSGVO-Module
- [docs/installation.md](docs/installation.md) – Build, Installation, Konfiguration
- [docs/test-checkliste.md](docs/test-checkliste.md) – Laufzeit-Test gegen eine echte OpenCloud-Instanz

## License

Apache-2.0
