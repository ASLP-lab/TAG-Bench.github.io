#!/usr/bin/env python3
"""Validate the committed demo without third-party Python packages."""
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import struct
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise SystemExit(f"FAIL: {message}")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        for key in ("src", "href"):
            if attrs.get(key):
                self.links.append(attrs[key])


def main():
    page = Page()
    html = (ROOT / "index.html").read_text()
    page.feed(html)
    require(len(page.ids) == len(set(page.ids)), "duplicate HTML id")
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        if url.path:
            require((ROOT / unquote(url.path)).is_file(), f"missing local asset: {link}")
        if not url.path and url.fragment:
            require(url.fragment in page.ids, f"missing anchor: {link}")
    raw = (ROOT / "assets/data.js").read_text()
    require(raw.startswith("window.TAGBENCH = "), "data.js assignment missing")
    data = json.loads(raw.removeprefix("window.TAGBENCH = ").strip().removesuffix(";"))
    summary = json.loads((ROOT / "assets/dataset-summary.json").read_text())
    selection = json.loads((ROOT / "assets/examples.json").read_text())
    for key in ("meta", "stats", "tasks", "points"):
        require(data[key] == summary[key], f"summary and JavaScript differ: {key}")
    for key in ("meta", "examples", "pairs"):
        require(data[key] == selection[key], f"examples and JavaScript differ: {key}")
    points, stats, tasks, examples = data["points"], data["stats"], data["tasks"], data["examples"]
    require(len(points) == stats["count"] == 1750, "expected 1,750 queries")
    require(len(tasks) == 8 and len(examples) == 16, "expected 8 tasks and 16 audio examples")
    require(len({p["id"] for p in points}) == len(points), "duplicate query id")
    require(sum(p["multi"] for p in points) == stats["multi"] == 387, "multi-target total differs")
    require(sum(not p["multi"] for p in points) == stats["single"] == 1363, "single-target total differs")
    require(math.isclose(sum(p["duration"] for p in points) / 3600, stats["hours"], abs_tol=1e-8), "total hours differ")
    require(all(0 <= p["coverage"] <= 1 and p["duration"] > 0 and p["count"] >= 1 for p in points), "invalid point")
    require(all(p["multi"] == (p["count"] > 1) for p in points), "multiplicity differs")
    expected = Counter(p["task"] for p in points)
    require(expected == Counter({t["id"]: t["count"] for t in tasks}), "task totals differ")
    require(Counter((s["task"], s["multi"]) for s in examples) == Counter({(t["id"], value): 1 for t in tasks for value in (True, False)}), "curation must have a single/multi pair per task")
    point_lookup = {p["id"]: p for p in points}
    for sample in examples:
        require(all(sample[key] == value for key, value in point_lookup[sample["id"]].items()), f"example summary differs: {sample['id']}")
        require(len(sample["intervals"]) == sample["count"], "interval count mismatch")
        require(all(0 <= a < b <= sample["duration"] + .00501 for a, b in sample["intervals"]), "invalid example interval")
        require(len(sample["waveform"]) == 3000 and all(type(n) is int and 0 <= n <= 255 for n in sample["waveform"]), "invalid waveform")
        audio = ROOT / sample["audio"]
        spectrum = ROOT / sample["spectrogram"]
        require(audio.is_file() and audio.stat().st_size > 1000, f"missing audio: {audio}")
        require(hashlib.sha256(audio.read_bytes()).hexdigest() == sample["audio_sha256"], "audio hash mismatch")
        require(audio.stat().st_size < 100 * 1024 * 1024, "audio exceeds GitHub's individual-file limit")
        png = spectrum.read_bytes()
        require(png.startswith(b"\x89PNG\r\n\x1a\n"), "invalid spectrogram PNG")
        width, height = struct.unpack(">II", png[16:24])
        require(width > 10 and height == 257, "invalid spectrogram dimensions")
        require(not Path(sample["source_file"]).is_absolute(), "absolute source path exposed")
    examples_by_id = {s["id"]: s for s in examples}
    for pair in data["pairs"]:
        short, long = examples_by_id[pair["short"]], examples_by_id[pair["long"]]
        require(short["query"] == long["query"], "context-pair queries differ")
        require(len(short["intervals"]) == len(long["intervals"]), "context-pair count differs")
        require(all(abs(a + pair["offset"] - b) < 1e-6 for first, second in zip(short["intervals"], long["intervals"]) for a, b in zip(first, second)), "context-pair timestamps differ")
        require(len(pair["pcm_sha256"]) == 64, "context-pair PCM verification missing")
    require("/cpfs_" not in raw and "/tmp/" not in raw, "local paths exposed in display data")
    require(not list(ROOT.glob("*.wav")) and not (ROOT / "results").exists(), "source audio or model results bundled")
    audio_bytes = sum((ROOT / s["audio"]).stat().st_size for s in examples)
    print(f"PASS: {len(points):,} queries, {len(tasks)} tasks, {len(examples)} complete audio examples, {len(data['pairs'])} verified context pairs.")
    print(f"PASS: local links, summaries, interval bounds, waveform bins, spectrograms and audio hashes. MP3 total: {audio_bytes / 1024**2:.2f} MiB.")


if __name__ == "__main__":
    main()
