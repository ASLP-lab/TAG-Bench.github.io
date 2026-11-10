#!/usr/bin/env python3
"""Build portable data, full-length listening examples, and signal visualizations.

Rebuilding needs numpy, Pillow and ffmpeg. Serving the committed site needs none
of these. Source recordings and model outputs are never copied into the site.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import shutil
import statistics
import subprocess
import wave

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TASKS = [
    ("word", "word", "Word", "词汇", "#517ead", "Locate a spoken word.", "定位一个被说出的词。"),
    ("event", "acoustic event", "Acoustic event", "声音事件", "#c47736", "Find a recognizable sound.", "找到一个可辨识的声音事件。"),
    ("description", "acoustic description", "Acoustic description", "声音描述", "#447e67", "Ground a description of sound.", "定位自然语言描述的声音。"),
    ("semantic", "semantic", "Semantic", "语义", "#8b6b9e", "Find the meaning in speech.", "定位语音中表达的语义。"),
    ("rough", "rough semantic", "Rough semantic", "粗粒度语义", "#a27b37", "Follow a topic or broad cue.", "根据话题或概括性线索定位。"),
    ("emotion", "emotion", "Emotion", "情绪", "#b0657b", "Locate an expressed emotion.", "找到说话人表达情绪的片段。"),
    ("long-semantic", "long - semantic", "Long · semantic", "长音频 · 语义", "#666fba", "Retrieve meaning in long context.", "在长上下文中检索语义。"),
    ("long-description", "long - acoustic description", "Long · acoustic description", "长音频 · 声音描述", "#398c93", "Find a sound in a long recording.", "在长录音中找到目标声音。"),
]
TASK_BY_TAG = {row[1]: row[0] for row in TASKS}
PAIR_SPECS = [("door", "tagbench-0673", "tagbench-1583", 720),
              ("water", "tagbench-0653", "tagbench-1563", 600)]


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def intervals(text):
    result = []
    for part in text.split(";"):
        match = re.fullmatch(r"\s*(\d+(?:\.\d+)?)s\s*~\s*(\d+(?:\.\d+)?)s\s*", part)
        if not match:
            raise ValueError(f"Invalid timestamp: {text}")
        start, end = map(float, match.groups())
        if start >= end:
            raise ValueError(f"Empty or reversed interval: {text}")
        result.append([start, end])
    return result


def union_length(spans, duration):
    """Measure the union within the recording; leave original timestamps intact."""
    merged = []
    for start, end in sorted(spans):
        start, end = max(0, start), min(duration, end)
        if start >= end:
            continue
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(end, merged[-1][1])
        else:
            merged.append([start, end])
    return sum(end - start for start, end in merged)


def signal_assets(source, destination, spectrum_path, ffmpeg, bitrate):
    subprocess.run([ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
                    "-i", str(source), "-map_metadata", "-1", "-ac", "1", "-ar", "32000",
                    "-c:a", "libmp3lame", "-b:a", bitrate, str(destination)], check=True)
    raw = subprocess.run([ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error",
                          "-i", str(source), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    signal = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768
    bins = min(3000, len(signal))
    edges = np.linspace(0, len(signal), bins + 1, dtype=int)
    peaks = np.array([np.max(np.abs(signal[edges[i]:edges[i+1]])) for i in range(bins)])
    peaks /= max(float(peaks.max()), 1e-8)

    # A 512-sample Hann STFT at 8 kHz; average linear power per display column.
    # Process columns independently so long audio does not require a full STFT in RAM.
    n_fft, hop, columns = 512, 128, 1200
    padded = np.pad(signal, (0, max(0, n_fft - len(signal))))
    frames = np.lib.stride_tricks.sliding_window_view(padded, n_fft)[::hop]
    columns = min(columns, len(frames))
    boundaries = np.linspace(0, len(frames), columns + 1, dtype=int)
    window = np.hanning(n_fft)
    power = np.stack([np.mean(np.abs(np.fft.rfft(frames[boundaries[i]:boundaries[i+1]] * window)) ** 2, axis=0)
                      for i in range(columns)], axis=1)
    db = 10 * np.log10(np.maximum(power, 1e-12) / max(float(power.max()), 1e-12))
    level = np.clip((db + 65) / 65, 0, 1)
    colors = np.array([[14, 27, 34], [27, 58, 69], [41, 108, 113], [121, 184, 145], [226, 235, 159]])
    scale = np.linspace(0, 1, len(colors))
    rgb = np.stack([np.interp(level, scale, colors[:, channel]) for channel in range(3)], axis=-1)
    Image.fromarray(np.flipud(rgb).astype(np.uint8)).save(spectrum_path, optimize=True)
    return np.rint(peaks * 255).astype(int).tolist()


def verify_pair(short_path, long_path, offset):
    with wave.open(str(short_path), "rb") as short, wave.open(str(long_path), "rb") as long:
        for getter in ("getframerate", "getsampwidth", "getnchannels"):
            if getattr(short, getter)() != getattr(long, getter)():
                raise ValueError("Paired audio format mismatch")
        long.setpos(round(offset * long.getframerate()))
        original = short.readframes(short.getnframes())
        embedded = long.readframes(short.getnframes())
        if original != embedded:
            raise ValueError("Short recording does not exactly match the claimed long-audio context")
        return hashlib.sha256(original).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--audio-root", type=Path)
    parser.add_argument("--selection", type=Path, default=ROOT / "scripts/selection.json")
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--bitrate", default="64k", choices=["48k", "64k", "96k"])
    args = parser.parse_args()
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        parser.error("ffmpeg is required to rebuild audio assets")
    audio_root = args.audio_root or args.source.parent / "wavs"
    source_rows = [json.loads(line) for line in args.source.read_text().splitlines() if line.strip()]
    points, lookup, rounding = [], {}, []
    for index, row in enumerate(source_rows, 1):
        identity = f"tagbench-{index:04d}"
        source = audio_root / Path(row["audio_path"]).name
        with wave.open(str(source), "rb") as audio:
            duration = audio.getnframes() / audio.getframerate()
        spans = intervals(row["timestamp"])
        if type(row["multi_target"]) is not bool or row["multi_target"] != (len(spans) > 1):
            raise ValueError(f"Inconsistent multi_target: {identity}")
        overshoot = max(end for _, end in spans) - duration
        if overshoot > 0.00501:
            raise ValueError(f"Annotation exceeds recording by {overshoot}s: {identity}")
        if overshoot > 1e-8:
            rounding.append(identity)
        point = {"id": identity, "task": TASK_BY_TAG[row["task_tag"]], "duration": round(duration, 6),
                 "count": len(spans), "multi": row["multi_target"],
                 "coverage": round(union_length(spans, duration) / duration, 9)}
        points.append(point)
        lookup[identity] = (row, source, spans, point)
    selection = json.loads(args.selection.read_text())
    if len({item["id"] for item in selection}) != len(selection):
        raise ValueError("Duplicate selected example")
    assets = ROOT / "assets"
    for directory in ("audio", "spectrograms"):
        (assets / directory).mkdir(parents=True, exist_ok=True)

    def prepare(item):
        identity = item["id"]
        row, source, spans, point = lookup[identity]
        if source.name != item["audio_file"]:
            raise ValueError(f"Selection changed at {identity}; review the source row before rebuilding")
        audio = assets / "audio" / f"{identity}.mp3"
        spectrum = assets / "spectrograms" / f"{identity}.png"
        waveform = signal_assets(source, audio, spectrum, ffmpeg, args.bitrate)
        print(f"Prepared {identity}: {point['duration']:.3f}s", flush=True)
        return {**point, "title": item["title"], "question": row["question"], "query": row["raw_query"],
                "timestamp": row["timestamp"], "intervals": spans, "source_file": source.name,
                "audio": f"assets/audio/{audio.name}", "spectrogram": f"assets/spectrograms/{spectrum.name}",
                "waveform": waveform, "source_sha256": sha256(source), "audio_sha256": sha256(audio)}

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        examples = list(pool.map(prepare, selection))
    pairs = []
    for name, short_id, long_id, offset in PAIR_SPECS:
        a, b = lookup[short_id], lookup[long_id]
        if a[0]["raw_query"] != b[0]["raw_query"] or len(a[2]) != len(b[2]):
            raise ValueError("Context pair queries or interval counts differ")
        if any(abs(x + offset - y) > 1e-6 for span_a, span_b in zip(a[2], b[2]) for x, y in zip(span_a, span_b)):
            raise ValueError("Context pair annotation offsets differ")
        pairs.append({"id": name, "short": short_id, "long": long_id, "offset": offset,
                      "pcm_sha256": verify_pair(a[1], b[1], offset)})
    tasks = [{"id": ident, "tag": tag, "label": {"en": en, "zh": zh}, "color": color,
              "description": {"en": description, "zh": description_zh},
              "count": sum(p["task"] == ident for p in points)}
             for ident, tag, en, zh, color, description, description_zh in TASKS]
    stats = {"count": len(points), "hours": sum(p["duration"] for p in points) / 3600,
             "multi": sum(p["multi"] for p in points), "single": sum(not p["multi"] for p in points),
             "maxTargets": max(p["count"] for p in points), "maxDuration": max(p["duration"] for p in points),
             "minDuration": min(p["duration"] for p in points),
             "medianDuration": statistics.median(p["duration"] for p in points),
             "medianCoverage": statistics.median(p["coverage"] for p in points),
             "uniqueAudioFiles": len({entry[1].name for entry in lookup.values()}),
             "targetCounts": dict(sorted(Counter(p["count"] for p in points).items()))}
    meta = {"source": args.source.name, "source_sha256": sha256(args.source),
            "idConvention": "tagbench-NNNN is the 1-based row number of the source JSONL.",
            "durationDefinition": "Actual WAV frame count / sample rate; total hours summed once per query.",
            "countDefinition": "Number of original semicolon-separated annotated intervals, before merging.",
            "coverageDefinition": "Length of the interval union intersected with the recording / WAV duration.",
            "roundingEndpointIds": rounding,
            "audioTransform": f"Full recording; mono MP3, 32 kHz, {args.bitrate}bps; no cropping, original time origin.",
            "waveform": "3000 normalized peak bins from mono 8 kHz PCM.",
            "spectrogram": "8 kHz PCM; 512-sample Hann window; 128-sample hop; mean linear power per time column; -65 to 0 dB relative to per-recording peak; 0–4 kHz.",
            "curation": "16 examples: one single-target and one multi-target query per task. The gallery is curated, not a random representative sample."}
    payload = {"meta": meta, "stats": stats, "tasks": tasks, "points": points, "examples": examples, "pairs": pairs}
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (assets / "data.js").write_text("window.TAGBENCH = " + encoded + ";\n")
    (assets / "dataset-summary.json").write_text(json.dumps({k: payload[k] for k in ("meta", "stats", "tasks", "points")}, ensure_ascii=False, indent=2) + "\n")
    (assets / "examples.json").write_text(json.dumps({"meta": meta, "examples": examples, "pairs": pairs}, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {len(points)} data points, {len(examples)} recordings, {len(pairs)} verified context pairs.")


if __name__ == "__main__":
    main()
