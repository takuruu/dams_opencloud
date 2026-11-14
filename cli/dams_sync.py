#!/usr/bin/env python3
"""Synchronisiert eine lokale Markdown-Struktur per WebDAV in einen OpenCloud-Space.

Nutzung:
    export OPENCLOUD_URL=https://opencloud.example.com
    export OPENCLOUD_ACCESS_TOKEN=<persönliches Zugriffstoken>
    export OPENCLOUD_SPACE=Datenschutz       # optional, Standard: Datenschutz

    python3 dams_sync.py <lokaler-ordner> <ziel-pfad-im-space>

Beispiel:
    python3 dams_sync.py templates/Verfahrensverzeichnis /Verfahrensverzeichnis

Das Tool legt fehlende Ordner im Space an und lädt neue oder geänderte Dateien
hoch. Bereits existierende Dateien werden überschrieben - OpenCloud erzeugt
dabei automatisch eine neue Dateiversion, sodass die Historie erhalten bleibt.
Nur Python-Standardbibliothek, keine Abhängigkeiten.
"""

import argparse
import os
import ssl
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from http.client import HTTPSConnection, HTTPConnection
from pathlib import Path

DAV_NAMESPACE = "DAV:"


def build_connection(url: str):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme == "https":
        context = ssl.create_default_context()
        if os.environ.get("OPENCLOUD_INSECURE", "").lower() in ("1", "true", "yes"):
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
        return HTTPSConnection(parsed.hostname, parsed.port or 443, context=context), parsed.hostname
    return HTTPConnection(parsed.hostname, parsed.port or 80), parsed.hostname


def dav_path(space_name: str, remote_path: str, file_name: str = "") -> str:
    quoted_space = urllib.parse.quote(f"/{space_name.strip('/')}")
    quoted_path = "/".join(urllib.parse.quote(part) for part in remote_path.strip("/").split("/") if part)
    path = f"/remote.php/dav/files{quoted_space}"
    if quoted_path:
        path += f"/{quoted_path}"
    if file_name:
        path += f"/{urllib.parse.quote(file_name)}"
    return path


def request(conn, method: str, path: str, token: str, body: bytes = b"", headers=None):
    hdrs = {"Authorization": f"Bearer {token}", "Overwrite": "T"}
    if body:
        hdrs["Content-Type"] = "text/markdown; charset=utf-8"
    if headers:
        hdrs.update(headers)
    conn.request(method, path, body=body, headers=hdrs)
    return conn.getresponse()


def ensure_folder(conn, space_name: str, folder_path: str, token: str) -> None:
    parts = [p for p in folder_path.strip("/").split("/") if p]
    current = ""
    for part in parts:
        current += f"/{part}"
        resp = request(conn, "MKCOL", dav_path(space_name, current), token)
        # 201 = erstellt, 405 = existiert bereits, 301 = Elternteil fehlt
        if resp.status not in (201, 405):
            raise RuntimeError(f"Ordneranlage {current} fehlgeschlagen: HTTP {resp.status}")
        resp.read()


def file_exists(conn, space_name: str, folder_path: str, file_name: str, token: str) -> bool:
    body = (
        '<?xml version="1.0" encoding="utf-8"?>'
        '<d:propfind xmlns:d="DAV:"><d:prop><d:getetag/></d:prop></d:propfind>'
    )
    resp = request(
        conn,
        "PROPFIND",
        dav_path(space_name, folder_path, file_name),
        token,
        body=body.encode("utf-8"),
        headers={"Depth": "0", "Content-Type": "application/xml"},
    )
    resp.read()
    return resp.status == 207


def upload_file(conn, space_name: str, folder_path: str, file_name: str, token: str, content: bytes) -> None:
    resp = request(conn, "PUT", dav_path(space_name, folder_path, file_name), token, body=content)
    resp.read()
    if resp.status not in (200, 201, 204):
        raise RuntimeError(f"Upload {file_name} fehlgeschlagen: HTTP {resp.status}")


def sync(local_dir: Path, space_name: str, remote_path: str, url: str, token: str) -> None:
    conn, _ = build_connection(url)
    ensure_folder(conn, space_name, remote_path, token)
    uploaded = 0
    skipped = 0
    for file_path in sorted(local_dir.rglob("*")):
        if file_path.is_dir():
            continue
        rel = file_path.relative_to(local_dir)
        target_folder = remote_path if len(rel.parts) == 1 else f"{remote_path.rstrip('/')}/{'/'.join(rel.parts[:-1])}"
        ensure_folder(conn, space_name, target_folder, token)
        if file_exists(conn, space_name, target_folder, rel.name, token):
            skipped += 1
            print(f"  übersprungen (existiert bereits): {rel}")
            continue
        upload_file(conn, space_name, target_folder, rel.name, token, file_path.read_bytes())
        uploaded += 1
        print(f"  hochgeladen: {rel}")
    conn.close()
    print(f"Fertig: {uploaded} hochgeladen, {skipped} übersprungen.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Markdown-Sync nach OpenCloud (WebDAV)")
    parser.add_argument("local_dir", help="Lokaler Ordner mit Markdown-Dateien")
    parser.add_argument("remote_path", help="Zielpfad im Space, z. B. /Verfahrensverzeichnis")
    parser.add_argument("--space", default=os.environ.get("OPENCLOUD_SPACE", "Datenschutz"))
    parser.add_argument("--url", default=os.environ.get("OPENCLOUD_URL"))
    parser.add_argument("--token", default=os.environ.get("OPENCLOUD_ACCESS_TOKEN"))
    args = parser.parse_args()

    if not args.url or not args.token:
        print("OPENCLOUD_URL und OPENCLOUD_ACCESS_TOKEN müssen gesetzt sein.", file=sys.stderr)
        return 1
    local_dir = Path(args.local_dir)
    if not local_dir.is_dir():
        print(f"Ordner nicht gefunden: {local_dir}", file=sys.stderr)
        return 1

    print(f"Sync {local_dir} → Space »{args.space}« {args.remote_path}")
    try:
        sync(local_dir, args.space, args.remote_path, args.url, args.token)
    except RuntimeError as exc:
        print(f"Fehler: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
