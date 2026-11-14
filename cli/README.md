# DAMS Sync CLI

Optionales Kommandozeilen-Tool, das eine lokale Markdown-Struktur per WebDAV in
einen OpenCloud-Space synchronisiert. OpenCloud erzeugt beim Überschreiben
automatisch neue Dateiversionen – die Versionshistorie bleibt also vollständig
in OpenCloud erhalten.

## Voraussetzungen

- Python 3.9+ (nur Standardbibliothek, keine Pakete nötig)
- Persönliches Zugriffstoken aus OpenCloud (Einstellungen → Zugriffstoken)

## Nutzung

```bash
export OPENCLOUD_URL=https://opencloud.example.com
export OPENCLOUD_ACCESS_TOKEN=<token>
export OPENCLOUD_SPACE=Datenschutz        # optional, Standard: Datenschutz

python3 cli/dams_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis
```

Optionen:

| Option     | Umgebungsvariable        | Standard       |
| ---------- | ------------------------ | -------------- |
| `--url`    | `OPENCLOUD_URL`          | –              |
| `--token`  | `OPENCLOUD_ACCESS_TOKEN` | –              |
| `--space`  | `OPENCLOUD_SPACE`        | `Datenschutz`  |

Für Testsysteme mit selbstsigniertem Zertifikat: `OPENCLOUD_INSECURE=1` setzen
(alle Zertifikatsprüfungen werden dann deaktiviert).

## Verhalten

- Fehlende Ordner im Space werden angelegt (`MKCOL`).
- Neue Dateien werden hochgeladen (`PUT`).
- Existierende Dateien werden **übersprungen**, damit lokal gelöschte/umbenannte
  Dateien im Space nicht versehentlich überschrieben werden. Zum bewussten
  Überschreiben Datei vorher im Space löschen – oder die Datei direkt in der
  OpenCloud-Weboberfläche bzw. über die DAMS-App bearbeiten (dort entsteht bei
  jedem Speichern eine neue Version).
