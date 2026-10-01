#!/usr/bin/env python3
"""Zip plugin/tafseer-dreams into plugin/tafseer-dreams.zip for Plugins → Upload Plugin.

    python3 plugin/build.py
"""

import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PLUGIN = HERE / "tafseer-dreams"

with zipfile.ZipFile(HERE / "tafseer-dreams.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    for path in sorted(PLUGIN.rglob("*")):
        zf.write(path, path.relative_to(HERE))
print("built tafseer-dreams.zip")
