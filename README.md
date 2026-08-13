# Projects

Source for [chaoui-ahmed.github.io](https://chaoui-ahmed.github.io). Technical write-ups
of my machine learning and systems projects.

Each entry states the problem, what I built, and what the results actually showed,
including the projects where the result was negative. Every figure quoted is
reproducible from committed code in the linked repository.

- **KV-Cache Compression for LLM Inference**: Expected Attention vs KVzip vs Finch across
  text and vision-language workloads
- **Predictive Uncertainty via Deep Ensembles**: reproduction of Lakshminarayanan et al.
  (2017), including the claim that doesn't hold
- **Multimodal Match Prediction & Market Benchmarking**: parity with the bookmaker closing
  line, validated by closing-line value against a random control
- **Internal Assistant for Support Tickets**: DGSITN, Ville d'Épinal: fully on-premises
  RAG over internal documents with a GLPI integration, built under a digital-sovereignty
  constraint
- **Public Assistant on epinal.fr**: the citizen-facing counterpart on Dialogflow CX,
  with an event-driven Google Cloud pipeline that keeps its knowledge base current

Separate from [ahmedchaoui.com](https://ahmedchaoui.com), which covers background and
education.

## Running locally

A single self-contained `index.html`, no build step, no dependencies.

```bash
python3 -m http.server 8000
```

## License

MIT, see [LICENSE](LICENSE).
