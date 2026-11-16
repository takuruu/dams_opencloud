# Konzept

## Ziel

Datenschutzmanagementsystem (Vesta Privacy) für kleine Unternehmen als OpenCloud-Web-App. Die
DSGVO-Dokumentation soll ohne zusätzliche Datenbank oder Spezialsoftware gepflegt
werden können – mit Markdown als einzigem Datenformat und OpenCloud als Ablage-,
Berechtigungs- und Versionierungsschicht.

## Architektur

```
┌─────────────────────────────────────────────┐
│ OpenCloud Web (Runtime)                     │
│  └── Vesta-Privacy-App (Vue 3, via Extension-System, │
│      Module Federation, @opencloud-eu/web-pkg)│
│       ├── listet .md-Dateien im Space        │
│       ├── parst YAML-Frontmatter             │
│       └── liest/schreibt via WebDAV-API       │
└───────────────────┬─────────────────────────┘
                    │ WebDAV / Graph API
┌───────────────────▼─────────────────────────┐
│ OpenCloud Server                             │
│  └── Space „Datenschutz“                     │
│      └── /Verfahrensverzeichnis/*.md         │
│          → Datei-Versionierung von OpenCloud  │
└─────────────────────────────────────────────┘
```

Beteiligte Bausteine:

1. **Web-App `vesta-privacy`** (`packages/web-app-vesta-privacy`): registriert sich über das
   OpenCloud-Extension-System (`defineWebApplication` aus `@opencloud-eu/web-pkg`)
   als eigene App im App-Switcher. Sie greift über den WebDAV-Client aus
   `@opencloud-eu/web-client` auf einen konfigurierbaren Space zu.
2. **Markdown-Struktur** (`templates/`): Vorlagen und Beispiele für die
   Dokumentation. Jede Verarbeitungstätigkeit = eine Datei.
3. **CLI** (`cli/vesta_sync.py`): optionaler, abhängigkeitsfreier Sync einer lokalen
   Markdown-Struktur in einen OpenCloud-Space (WebDAV, persönliches Zugriffstoken).

## Warum Flat-Files + Versionierung?

- **Nachvollziehbarkeit (Art. 5 Abs. 2 DSGVO):** OpenCloud versioniert jede Datei
  automatisch. Jede Änderung am Verfahrensverzeichnis erzeugt eine neue Version mit
  Zeitstempel und Autor – ohne eigenes Audit-Log zu bauen.
- **Portabilität:** Markdown ist menschenlesbar, diffbar und in jedem Editor
  bearbeitbar. Kein Vendor-Lock-in in ein Datenbankschema.
- **Berechtigungen:** Zugriffschutz ergibt sich aus den Space-Berechtigungen von
  OpenCloud; Vesta Privacy führt keine eigene Rechteverwaltung ein.
- **Kollaboration:** Mehrere Personen können über die gewohnte OpenCloud-Freigabe-
   Mechanik am Space mitarbeiten.

## Datenfluss beim Speichern

1. Nutzer ändert Felder im Formular der App.
2. Die App serialisiert Frontmatter + Beschreibungstext zurück in Markdown.
3. `PUT` per WebDAV mit `previousEntityTag` (ETag) → optimistische Sperre gegen
   verlorene Updates.
4. OpenCloud legt eine neue Dateiversion an; die Historie ist in der
   Weboberfläche unter „Versionen“ der Datei sichtbar.

## Erweiterbarkeit

Das Frontmatter-Schema ist bewusst simpel gehalten; weitere DSGVO-Module
(AVV, TOM, Löschkonzept, Datenschutzvorfälle, Betroffenenanfragen) können als
weitere Ordner im selben Space und – mit eigenen Views – in derselben App ergänzt
werden. Das Datenmodell dazu: [datenmodell.md](datenmodell.md).
