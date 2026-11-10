<div align="center">

# TAG-Bench · Audio Explorer

**Every sound. In its own time.**

An interactive companion to **TAG-Bench: Benchmarking Temporal Audio Grounding in Large Audio Language Models**.

[Paper](https://arxiv.org/abs/2609.01542v2) · [English](README.md) · [简体中文](README_zh.md)

</div>

Explore **1,750 grounding queries across eight tasks**, and listen to **16 complete recordings** with synchronized annotations, waveforms, and spectrograms. This standalone website runs entirely in the browser and can be hosted on GitHub Pages.

## Explore the benchmark

| View | What you can explore |
| --- | --- |
| Task distribution | Eight query types, from individual words to long-context semantic and acoustic grounding |
| Interactive scatter plot | Recording duration against target coverage or target count; filter by task, duration, and multiplicity |
| Duration and occurrence distributions | How long recordings are and how many annotated moments each query contains |
| Short / long context comparisons | Two pairs with the exact same 60-second recording embedded in 19–20 minutes of audio |
| Listening room | Search 16 examples, play individual targets or all targets in sequence, zoom the timeline, and switch between waveform and spectrogram |
| Inspect and export | Paginated query summaries, filtered CSV, original example annotations, and shareable example URLs |

The page supports **English and Simplified Chinese**. Original English queries remain unchanged when switching the interface language.

## Open locally

Open [index.html](index.html) directly, or serve the project folder:

```bash
python3 scripts/serve.py --port 8000
```

Visit **http://localhost:8000**. This standard-library preview server supports byte-range requests so the browser can seek into long recordings. No installation, build step, API key, model inference, or external CDN is required to view the bundled page. The full audio selection occupies approximately **40 MiB**; recordings are loaded on demand.

An individual example can be opened with a query parameter:

```text
?sample=tagbench-1583&lang=en#listen
```

## Publish on GitHub Pages

1. Create a GitHub repository and upload this directory's contents, including `assets/` and `.github/workflows/pages.yml`.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Push to `main` or `master`, or run **Validate and publish demo** from the Actions tab.
4. Open the deployment URL shown in the completed workflow.

The workflow validates the data, stages `index.html`, `.nojekyll`, and `assets/`, then deploys them. Pull requests run validation without publishing. All asset paths are relative, so the page works under a repository subpath. A repository URL is not hardcoded.

## Selected recordings

Each task has one single-target and one multi-target example. This selection illustrates different grounding behaviors; it is not a random representative sample.

| Task | Single target | Multiple targets |
| --- | --- | --- |
| Word | `0005` · WELL | `0126` · LOBSTERS, twice |
| Acoustic event | `0287` · Rain on a tent | `0534` · Eighteen metal clinks |
| Acoustic description | `0673` · A door opens and closes | `0653` · Five water-drop intervals |
| Semantic | `1098` · Positive learning environments | `1131` · A game borrowing an idea |
| Rough semantic | `1151` · Naming a podcast | `1241` · Raising a service dog |
| Emotion | `0887` · Joy and enthusiasm | `0910` · Amusement about a game |
| Long · semantic | `1376` · Main vocals and lead vocals | `1370` · Why a tournament moved |
| Long · acoustic description | `1583` · A door in twenty minutes | `1563` · Water drops in a long recording |

All IDs above have the prefix `tagbench-`. IDs are generated from the source file's **1-based row numbers** and are tied to its SHA-256 fingerprint.

The door pair (`0673` / `1583`) has an offset of 720 seconds. The water pair (`0653` / `1563`) has an offset of 600 seconds. The asset builder checks that each entire short recording matches the corresponding original PCM segment byte for byte, and that query text and shifted target intervals agree.

## Data and visualization conventions

- All dataset charts use the supplied `TAGBench.jsonl` and actual WAV headers: **1,750 queries, 149.52936 hours, 1,363 single-target and 387 multi-target queries**. There are 1,750 unique audio files in this snapshot.
- Target count means the number of **original annotated intervals**. Two source examples contain touching intervals; these are kept separate for this visualization. An evaluator may merge them when computing interval-union metrics.
- Coverage is the duration of the interval union intersected with the recording, divided by the recording duration. Eight annotation endpoints exceed the WAV duration by 2–4 milliseconds due to timestamp rounding. Display coverage is bounded by the actual recording; the original annotations are retained.
- All selected recordings are **full length**, converted to mono MP3 at 32 kHz / 64 kbps. They have not been cropped or shifted. The longest is 20 minutes.
- Waveforms contain 3,000 peak bins normalized separately for each recording. Spectrograms show **0–4 kHz** from 8 kHz PCM using a 512-sample Hann window and a 128-sample hop. Power is averaged per display column, then shown at −65 to 0 dB relative to that recording's peak. These displays do not compare absolute loudness between recordings.
- The demo contains only dataset summaries, selected annotations, compressed recordings, and presentation assets. It does not include model prediction files or the full source dataset.

The precise source fingerprint and transformation metadata are included in [dataset-summary.json](assets/dataset-summary.json) and [examples.json](assets/examples.json).

## Rebuild the assets

Only rebuilding requires Python 3.10+, NumPy, Pillow, and `ffmpeg` on `PATH`. The original dataset and WAV files can remain outside this repository.

```bash
python3 -m pip install -r requirements-build.txt
python3 scripts/build_data.py \
  --source /path/to/TAGBench/TAGBench.jsonl \
  --audio-root /path/to/TAGBench/wavs
python3 scripts/check_site.py
```

The curated IDs, source filenames, and bilingual titles are in [scripts/selection.json](scripts/selection.json). Source filename checks detect reordered or changed selected rows. `--bitrate 48k` produces smaller audio files; `--bitrate 96k` produces larger ones. To stage just the public website:

```bash
python3 scripts/package_site.py
```

The output is `_site/`, which is ignored by Git. Routine validation uses only Python's standard library:

```bash
python3 scripts/check_site.py
node --check assets/app.js
```

## Citation

```bibtex
@misc{dai2026tagbench,
  title={TAG-Bench: Benchmarking Temporal Audio Grounding in Large Audio Language Models},
  author={Yuhang Dai and Xin Shu and Zengxi Li and Lei Xie and Xiangang Li and Jianwei Yu},
  year={2026},
  eprint={2609.01542},
  archivePrefix={arXiv},
  primaryClass={eess.AS},
  url={https://arxiv.org/abs/2609.01542}
}
```
