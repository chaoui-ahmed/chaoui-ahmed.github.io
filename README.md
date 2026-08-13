# Projects

Source for [chaoui-ahmed.github.io](https://chaoui-ahmed.github.io) — technical write-ups
of my machine learning and systems projects.

Each entry states the problem, what I built, and what the results actually showed,
including the projects where the result was negative. Every figure quoted is
reproducible from committed code in the linked repository.

- **KV-Cache Compression for LLM Inference** — Expected Attention vs KVzip vs Finch across
  text and vision-language workloads
- **Predictive Uncertainty via Deep Ensembles** — reproduction of Lakshminarayanan et al.
  (2017), including the claim that doesn't hold
- **Multimodal Match Prediction & Market Benchmarking** — parity with the bookmaker closing
  line, validated by closing-line value against a random control
- **Municipal LLM & RAG Assistant** — internship work at DGSITG, City of Épinal

Separate from [ahmedchaoui.com](https://ahmedchaoui.com), which covers background and
education.

## Running locally

A single self-contained `index.html` — no build step, no dependencies.

```bash
python3 -m http.server 8000
```

## License

MIT — see [LICENSE](LICENSE).
