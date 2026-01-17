# LLMark-Site

LLMark-Site is the community-driven comparison and discovery platform for **LLMark benchmarks**.

The goal of this repository is simple:

> **Help users find the best local LLM for their hardware (especially VRAM-limited GPUs).**

This repository does **not** contain the benchmark runner itself. The core benchmarking tool lives in the main **LLMark** repository.

---

## What is LLMark-Site?

LLMark-Site provides:

* A public collection of LLMark benchmark results (JSON)
* A comparison website with powerful filtering
* Hardware-centric model recommendations ("best fit for your GPU")
* A simple way for the community to share benchmarks

Instead of asking *"Which model is best overall?"*, LLMark-Site answers:

> **"Which model is best for *my* GPU and VRAM?"**

---

## Comparison Philosophy

LLMark-Site focuses on **real-world usability**, not artificial leaderboards.

Key principles:

* **VRAM-first filtering** (peak VRAM matters more than averages)
* No single "best model" — only **best fits**
* Transparent scoring and weighting
* Honest handling of unknown or estimated context sizes

---

## Submitting Benchmarks

### Automatic Upload (recommended)

LLMark can upload benchmark results directly to LLMark-Site without requiring GitHub knowledge.

* No account required

---

## Related Projects

* **LLMark** – Benchmark runner and judge
* **LLMark-Site** – Comparison and community data

---

## Disclaimer

Benchmark results depend heavily on hardware, drivers, context length, and quantization.

LLMark-Site aims to be transparent and practical, not absolute.
