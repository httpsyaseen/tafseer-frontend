#!/usr/bin/env python3
"""Build the Tafseer WordPress plugins from plugin/src.

Every plugin is the same code with a different authority. Edit plugin/src, then run:

    python3 plugin/build.py

Output: plugin/dist/<slug>/ and plugin/dist/<slug>.zip, ready for Plugins → Upload Plugin.
"""

import shutil
import zipfile
from pathlib import Path

VERSION = "2.0.0"

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
DIST = HERE / "dist"

# slug, name, shortcode, source ("" = visitor chooses), REST route, PHP namespace, description
PLUGINS = [
    ("tafseer-dreams", "Tafseer Dream Interpretation", "tafseer_dream", "", "dreams", "Tafseer\\Dreams",
     "Dream interpretation from the classical books. The visitor chooses the authority, or all of them."),
    ("tafseer-all", "Tafseer — All Books", "tafseer_all", "all", "dreams/all", "Tafseer\\All",
     "Dream interpretation from all the classical books together."),
    ("tafseer-ibn-sirin", "Tafseer — Ibn Sirin", "tafseer_ibn_sirin", "ibn_sirin", "dreams/ibn-sirin", "Tafseer\\IbnSirin",
     "Dream interpretation from the book attributed to Ibn Sirin."),
    ("tafseer-nabulsi", "Tafseer — Al-Nabulsi", "tafseer_nabulsi", "nabulsi", "dreams/nabulsi", "Tafseer\\Nabulsi",
     "Dream interpretation from Abd al-Ghani al-Nabulsi."),
    ("tafseer-ibn-shahin", "Tafseer — Ibn Shahin", "tafseer_ibn_shahin", "ibn_shaheen", "dreams/ibn-shahin", "Tafseer\\IbnShahin",
     "Dream interpretation from Ibn Shahin al-Zahiri."),
    ("tafseer-tabir", "Tafseer — Ta'bir al-Ru'ya", "tafseer_tabir", "tabir", "dreams/tabir", "Tafseer\\Tabir",
     "Dream interpretation from the classical book Ta'bir al-Ru'ya."),
    ("tafseer-sadiq", "Tafseer — Imam Al-Sadiq", "tafseer_sadiq", "sadiq", "dreams/sadiq", "Tafseer\\Sadiq",
     "Dream interpretation attributed to Imam Ja'far al-Sadiq and the Ahl al-Bayt."),
    ("tafseer-freud", "Tafseer — Sigmund Freud", "tafseer_freud", "freud", "dreams/freud", "Tafseer\\Freud",
     "Psychological dream interpretation in the manner of Sigmund Freud."),
]

TEMPLATED = {".php", ".txt"}


def build(slug, name, shortcode, source, route, namespace, description):
    values = {
        "NAME": name,
        "SLUG": slug,
        "SHORTCODE": shortcode,
        "SOURCE": source,
        "ROUTE": route,
        "NAMESPACE": namespace,
        "DESCRIPTION": description,
        "VERSION": VERSION,
    }
    out = DIST / slug
    shutil.copytree(SRC, out)
    (out / "plugin.php").rename(out / f"{slug}.php")

    for path in out.rglob("*"):
        if path.suffix not in TEMPLATED:
            continue
        text = path.read_text(encoding="utf-8")
        for key, value in values.items():
            text = text.replace("{{" + key + "}}", value)
        if "{{" in text:
            raise SystemExit(f"unfilled placeholder in {path}")
        path.write_text(text, encoding="utf-8")

    with zipfile.ZipFile(DIST / f"{slug}.zip", "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(out.rglob("*")):
            zf.write(path, path.relative_to(DIST))


def main():
    shutil.rmtree(DIST, ignore_errors=True)
    DIST.mkdir()
    for plugin in PLUGINS:
        build(*plugin)
        print(f"built {plugin[0]}.zip  [{plugin[2]}]")


if __name__ == "__main__":
    main()
