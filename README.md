# DAMS – Datenschutzmanagementsystem für OpenCloud

DAMS ist eine Web-App-Erweiterung für [OpenCloud](https://opencloud.eu), mit der kleine
Unternehmen ihre DSGVO-Dokumentation direkt in OpenCloud pflegen können – als Flat-Files
in Markdown, mit automatischer Datei-Versionierung durch OpenCloud.

Funktionsumfang:

- **Verfahrensverzeichnis** nach Art. 30 DSGVO
- **Auftragsverarbeiter & AVV** nach Art. 28 DSGVO (Verzeichnis der Auftragsverarbeiter
  mit Vertragsstatus, Drittland-Angaben, TOM-Nachweis und Verknüpfung zu Verfahren)

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
├── packages/web-app-dams/   # OpenCloud Web-App (Vue 3 / TypeScript)
├── templates/               # Markdown-Vorlagen & Beispiele (Verfahrensverzeichnis, AVV)
├── cli/                     # Optionales CLI: Sync der Markdown-Struktur via WebDAV
└── docs/                    # Konzept, Datenmodell, Installation
```

## Schnellstart (Entwicklung)

Voraussetzungen: Node >= 22, pnpm, Docker.

```bash
cd packages/web-app-dams
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

Die App kann über die OpenCloud-`config.json` (Abschnitt der App `dams`) konfiguriert
werden:

```json
{
  "apps": {
    "dams": {
      "spaceName": "Datenschutz",
      "folderPath": "/Verfahrensverzeichnis",
      "processorsFolderPath": "/Auftragsverarbeiter"
    }
  }
}
```

- `spaceName` – Name des Spaces, in dem die Dokumentation liegt (Standard: `Datenschutz`)
- `folderPath` – Pfad der Verfahren im Space (Standard: `/Verfahrensverzeichnis`)
- `processorsFolderPath` – Pfad der Auftragsverarbeiter im Space (Standard: `/Auftragsverarbeiter`)

## CLI-Sync (optional)

```bash
export OPENCLOUD_URL=https://opencloud.example.com
export OPENCLOUD_ACCESS_TOKEN=<persönliches Zugriffstoken>
export OPENCLOUD_SPACE=Datenschutz

python3 cli/dams_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis
python3 cli/dams_sync.py templates/Auftragsverarbeiter /Auftragsverarbeiter
```

Das CLI legt fehlende Ordner an und lädt neue/geänderte Markdown-Dateien per WebDAV
hoch – dabei erzeugt OpenCloud automatisch neue Versionen. Details: [cli/README.md](cli/README.md).

## Dokumentation

- [docs/konzept.md](docs/konzept.md) – Architektur und Grundprinzipien
- [docs/datenmodell.md](docs/datenmodell.md) – Frontmatter-Schema der Verfahren (Art. 30 DSGVO)
- [docs/installation.md](docs/installation.md) – Build, Installation, Konfiguration

## License

Apache-2.0
