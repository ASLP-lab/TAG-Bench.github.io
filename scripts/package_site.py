#!/usr/bin/env python3
"""Stage only public website files for GitHub Pages."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
destination = root / "_site"
if destination.exists():
    shutil.rmtree(destination)
destination.mkdir()
for name in ("index.html", ".nojekyll"):
    shutil.copy2(root / name, destination / name)
shutil.copytree(root / "assets", destination / "assets")
print(f"Staged static website: {destination}")
