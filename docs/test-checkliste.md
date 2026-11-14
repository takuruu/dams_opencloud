# Test-Checkliste: DAMS mit echter OpenCloud-Instanz

Diese Checkliste führt durch den Laufzeit-Test der App gegen eine echte
OpenCloud-Instanz. Voraussetzungen: Docker, Node >= 22, pnpm.

## 1. Build & Server starten

- [ ] `cd packages/web-app-dams && pnpm install && pnpm build`
      → `dist/` wird erzeugt (enthält `manifest.json` und JS-Bundles)
- [ ] Im Repo-Root: `docker compose up`
      → OpenCloud startet auf `https://localhost:9200`
- [ ] Selbstsigniertes Zertifikat im Browser akzeptieren
- [ ] Login als `admin` / `admin` (oder per `IDM_CREATE_DEMO_USERS` angelegter Testnutzer)

## 2. App-Registrierung prüfen

- [ ] App-Switcher zeigt „Datenschutz“ (Schild-Icon)
- [ ] Klick öffnet die App; linke Sidebar zeigt **fünf** Nav-Items:
      Verfahrensverzeichnis, Auftragsverarbeiter & AVV, TOM, Datenschutzvorfälle,
      Betroffenenanfragen
- [ ] Keine Fehler in der Browser-Konsole (v. a. keine Module-Federation-Fehler)

## 3. Space & Ordner anlegen

- [ ] Space namens `Datenschutz` anlegen (beliebiger Name, muss zur Config passen)
- [ ] Ersten Testnutzer mit Schreibrechten auf den Space berechtigen
- [ ] Vorlagen hochladen (Variante A per Weboberfläche, Variante B per CLI):

```bash
export OPENCLOUD_URL=https://localhost:9200
export OPENCLOUD_ACCESS_TOKEN=<Token aus Einstellungen → Zugriffstoken>
export OPENCLOUD_INSECURE=1

python3 cli/dams_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis
python3 cli/dams_sync.py templates/Auftragsverarbeiter /Auftragsverarbeiter
python3 cli/dams_sync.py templates/TOM /TOM
python3 cli/dams_sync.py "templates/Datenschutzvorfälle" /Datenschutzvorfälle
python3 cli/dams_sync.py templates/Betroffenenanfragen /Betroffenenanfragen
```

- [ ] CLI-Ausgabe: jeweils „hochgeladen“ ohne HTTP-Fehler

## 4. Module in der App testen (pro Modul wiederholen)

- [ ] Liste lädt und zeigt die Beispiel-Einträge aus den Templates
      (Verfahren: „Lohnbuchhaltung“, „Webanalyse“; AVV: „Analytics GmbH“ …)
- [ ] „Neuer Eintrag“: Formular öffnet, Pflichtfeld-Validierung greift
- [ ] Eintrag anlegen → Erfolgsmeldung, neuer Zeile erscheint in der Tabelle
- [ ] Eintrag bearbeiten (Feld ändern + Freitext ergänzen) → speichern
- [ ] **Versionierung prüfen:** Datei in der Files-App öffnen →
      Seitenleiste → „Versionen“ → bei jedem Speichern muss eine neue Version
      mit Zeitstempel entstehen; alte Version ist wiederherstellbar
- [ ] Datei-Inhalt prüfen: Markdown mit Frontmatter (z. B. `titel:`, `status:`),
      Freitext unangetastet (Überschriften bleiben erhalten)
- [ ] Listen-Felder (z. B. `kategorien`, `verfahren`) erscheinen im
      Frontmatter als `- `-Einträge und in der App kommagetrennt
- [ ] Status-Dropdown zeigt nur die erlaubten Werte des Moduls

## 5. Konfiguration testen (optional)

- [ ] In der `config.json` (Bereich `apps.dams`) `spaceName` oder einen
      `folderPaths`-Eintrag ändern → OpenCloud neu starten → App folgt der
      neuen Konfiguration (Space/Ordner wird bei Aufruf des Moduls angelegt)

## 6. Rechte & Fehlerfälle

- [ ] Nutzer ohne Schreibrechte: Liste lesbar, „Neu“/„Bearbeiten“-Buttons
      ausgeblendet
- [ ] Space umbenennen/entfernen → App zeigt Hinweis „kein Space gefunden“
      statt Absturz
- [ ] Zwei gleichzeitige Bearbeitungen: zweiter Speicherversuch mit altem ETag
      schlägt fehl (Konflikt-Meldung) statt stillem Überschreiben

## 7. CLI-Gegenprobe

- [ ] In der App geänderte Datei lokal nicht anfassen; erneuter CLI-Sync
      überspringt existierende Dateien („übersprungen“)
- [ ] Datei im Space löschen und erneut syncen → Datei wird neu angelegt

## 8. Abnahmekriterien (Kurzform)

1. Alle 5 Module laden, anlegen, bearbeiten und löschen-frei (keine Datenverluste)
2. Jedes Speichern erzeugt eine OpenCloud-Dateiversion
3. Markdown bleibt ohne App les- und editierbar (Files-App / Text-Editor)
4. CLI-Sync und App vertragen sich (kein gegenseitiges Überschreiben)

Bei Problemen: Browser-Konsole, `docker compose logs opencloud` und die
Versionshistorie der jeweiligen Datei prüfen.
