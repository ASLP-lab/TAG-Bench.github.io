<div align="center">

# TAG-Bench · 音频探索页面

**每一种声音，都有它的时刻。**

**TAG-Bench: Benchmarking Temporal Audio Grounding in Large Audio Language Models** 的交互式数据展示页面。

[论文](https://arxiv.org/abs/2609.01542v2) · [English](README.md) · [简体中文](README_zh.md)

</div>

探索 **8 类任务、1,750 条音频时间定位查询**，试听 **16 个完整录音**，同步查看标注、波形与频谱。页面完全在浏览器中运行，可直接部署到 GitHub Pages。

## 展示内容

| 视图 | 可探索的内容 |
| --- | --- |
| 任务分布 | 从单个词汇，到长上下文中的语义与声音描述，共八类任务 |
| 交互散点图 | 音频时长与目标覆盖率、目标数量的关系；支持按任务、时长及单/多目标筛选 |
| 时长与目标数量分布 | 录音有多长，每条查询需要找到多少个目标 |
| 短 / 长上下文对照 | 同一段 60 秒音频分别出现在短录音与 19–20 分钟长录音中的两组对照 |
| 试听工作台 | 搜索 16 个样例、播放单个或全部目标、放大时间轴、切换波形与频谱 |
| 数据查看与导出 | 分页查看查询统计、导出筛选后的 CSV、检查原始标注、分享具体样例链接 |

界面支持 **英文和简体中文切换**。切换语言时，数据集中的原始英文查询保持原样。

## 本地打开

可以直接打开 [index.html](index.html)，也可以在项目目录运行：

```bash
python3 scripts/serve.py --port 8000
```

访问 **http://localhost:8000**。该预览服务只依赖 Python 标准库，支持浏览器通过分段请求跳转长音频。浏览页面无需安装依赖、构建、API Key、模型推理或外部 CDN。精选录音共约 **40 MiB**，按需加载。

通过 URL 参数可以直接打开某个样例：

```text
?sample=tagbench-1583&lang=zh#listen
```

## 部署到 GitHub Pages

1. 新建 GitHub 仓库，上传本目录中的文件，包括 `assets/` 和 `.github/workflows/pages.yml`。
2. 在 **Settings → Pages → Build and deployment** 中，将来源选择为 **GitHub Actions**。
3. 推送到 `main` 或 `master`，或在 Actions 中手动运行 **Validate and publish demo**。
4. 打开已完成工作流显示的部署链接。

工作流会校验数据，仅打包 `index.html`、`.nojekyll` 和 `assets/`，随后部署。Pull Request 只校验，不发布。页面使用相对资源路径，兼容 GitHub 仓库子路径，无需写死仓库地址。

## 精选音频

每类任务各选一个单目标和一个多目标样例，用于展示不同定位特点。这些样例经过挑选，并非随机抽样。

| 任务 | 单目标 | 多目标 |
| --- | --- | --- |
| 词汇 | `0005` · WELL | `0126` · 两次 LOBSTERS |
| 声音事件 | `0287` · 雨落帐篷 | `0534` · 18 次金属碰撞 |
| 声音描述 | `0673` · 门的开与关 | `0653` · 五个水滴区间 |
| 语义 | `1098` · 积极的学习环境 | `1131` · 游戏设计的借鉴 |
| 粗粒度语义 | `1151` · 播客名称 | `1241` · 服务犬幼犬训练 |
| 情绪 | `0887` · 喜悦与热情 | `0910` · 聊游戏时的愉悦 |
| 长音频 · 语义 | `1376` · 两种主唱角色的区别 | `1370` · 比赛为什么改期 |
| 长音频 · 声音描述 | `1583` · 20 分钟录音中的门声 | `1563` · 长录音中的水滴 |

完整 ID 均带有 `tagbench-` 前缀。编号来自源 JSONL 的**从 1 开始的行号**，与文件的 SHA-256 指纹绑定。

门声对照 `0673` / `1583` 的偏移为 720 秒；水滴对照 `0653` / `1563` 的偏移为 600 秒。资源构建脚本逐字节核对原始 PCM，确保完整短录音确实嵌入对应长音频，并校验查询文本和目标时间戳的平移关系。

## 数据与可视化口径

- 全量统计来自指定 `TAGBench.jsonl` 和 WAV 文件头：**1,750 条查询、149.52936 小时音频、1,363 个单目标和 387 个多目标样例**。当前快照包含 1,750 个不同的音频文件。
- 目标数量采用**原始标注区间数**。其中两条数据存在相接区间，展示时保持原始数量；评估程序计算区间并集指标时可能合并这些区间。
- 覆盖率为录音范围内的目标区间并集总时长，除以实际录音时长。八条标注因小数舍入，比实际 WAV 末尾多出 2–4 毫秒；计算覆盖率时以录音边界为限，原始标注不修改。
- 精选音频均保留**完整录音**，转为 32 kHz、64 kbps 的单声道 MP3，没有裁剪或平移。最长为 20 分钟。
- 波形使用 3,000 个峰值分箱，各录音分别归一化。频谱由 8 kHz PCM 计算，显示 **0–4 kHz**，采用 512 点 Hann 窗和 128 点步长；每个显示列先对线性功率取平均，再显示相对于该录音峰值的 −65 至 0 dB。不同录音的图像不用于比较绝对响度。
- 项目只包含数据摘要、精选标注、压缩录音及页面资源，不包含模型预测结果或完整源数据集。

准确的源文件指纹与处理参数见 [dataset-summary.json](assets/dataset-summary.json) 和 [examples.json](assets/examples.json)。

## 重新生成资源

只有重新生成资源时需要 Python 3.10+、NumPy、Pillow，以及位于 `PATH` 中的 `ffmpeg`。源数据和 WAV 可以一直保存在仓库外。

```bash
python3 -m pip install -r requirements-build.txt
python3 scripts/build_data.py \
  --source /path/to/TAGBench/TAGBench.jsonl \
  --audio-root /path/to/TAGBench/wavs
python3 scripts/check_site.py
```

样例 ID、源音频文件名和中英文标题位于 [scripts/selection.json](scripts/selection.json)。构建时会核对源文件名，以发现选中行的重排或变动。`--bitrate 48k` 可以减小音频体积，`--bitrate 96k` 会增加体积。仅打包公开页面时运行：

```bash
python3 scripts/package_site.py
```

输出为 `_site/`，已被 Git 忽略。常规校验只依赖 Python 标准库：

```bash
python3 scripts/check_site.py
node --check assets/app.js
```

## 引用

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
