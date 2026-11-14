# Installation & Konfiguration

## Voraussetzungen

- OpenCloud >= 7.x (Server mit Web-UI)
- Node >= 22 und pnpm (für den Build der App)
- Optional: Docker für die lokale Entwicklungs-Umgebung

## Bauen

```bash
cd packages/web-app-dams
pnpm install
pnpm build          # Produktions-Build nach dist/
pnpm check:types    # Typcheck
pnpm test:unit      # Unit-Tests
```

## Installation in OpenCloud

Der Inhalt von `packages/web-app-dams/dist` muss als App in OpenCloud bereitgestellt
werden. Zwei übliche Wege:

### Docker (mount als Web-App)

```yaml
services:
  opencloud:
    image: opencloudeu/opencloud-rolling:latest
    environment:
      WEB_ASSET_APPS_PATH: /web/apps
    volumes:
      - ./packages/web-app-dams/dist:/web/apps/dams
```

Anschließend OpenCloud neu starten; die App erscheint im App-Switcher als „Datenschutz“.

### Docker Compose (Entwicklung mit Watch-Build)

Im Repo-Root liegt eine `docker-compose.yml`, die identisch zum offiziellen
[web-app-skeleton](https://github.com/opencloud-eu/web-app-skeleton) aufgebaut ist:

```bash
# Terminal 1
cd packages/web-app-dams && pnpm install && pnpm build:w
# Terminal 2
docker compose up
```

Weboberfläche: https://localhost:9200 (Login `admin` / `admin`).

## Konfiguration der App

Über die OpenCloud-`config.json` (Bereich `apps`):

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

| Option               | Standard                  | Bedeutung                                  |
| -------------------  | ------------------------- | ------------------------------------------ |
| `spaceName`          | `Datenschutz`             | Name des Spaces mit der Dokumentation      |
| `folderPath`         | `/Verfahrensverzeichnis`  | Ordner der Verfahren im Space              |
| `processorsFolderPath` | `/Auftragsverarbeiter`  | Ordner der Auftragsverarbeiter im Space    |

Der Space muss existieren; fehlende Modul-Ordner legt die App beim ersten Aufruf
selbst an. Alternativ können die Vorlagen per Sync geladen werden.

## Vorbereiten des Spaces

1. Space `Datenschutz` anlegen ( beliebiger Name, muss zur Konfiguration passen).
2. Vorlagen aus `templates/` in den Space laden – entweder per Weboberfläche/Upload
   oder per CLI:

```bash
python3 cli/dams_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis
python3 cli/dams_sync.py templates/Auftragsverarbeiter /Auftragsverarbeiter
```

## Rechte

Nutzer der App brauchen mindestens Leserecht auf den Space; zum Anlegen/Bearbeiten
von Verfahren Schreibrecht. Die Versionierung greift automatisch für alle Schreibenden.
