# Licence Records — arXiv & bioRxiv Samples

**Date:** 2026-11-27. PINAPLP = SIGNAL.
**Source:** OpenAlex (arXiv works) + bioRxiv API. Verified by live request.

## arXiv (34 records with non-null licence via OpenAlex)

| # | DOI | License | Date | Title |
|---|-----|---------|------|-------|
| 1 | 10.48550/arxiv.2402.10350 | other-oa | 2024-02-15 | Large Language Models for Forecasting and Anomaly Detection |
| 2 | 10.48550/arxiv.2501.05435 | cc-by-nc-nd | 2025-01-09 | Neuro-Symbolic AI in 2024: A Systematic Review |
| 3 | 10.48550/arxiv.2507.18910 | cc-by | 2025-07-25 | A Systematic Review of Key Retrieval-Augmented Generation (RAG) |
| 4 | 10.48550/arxiv.1503.01158 | cc-by | 2015-03-03 | A Meta-Analysis of the Anomaly Detection Problem |
| 5 | 10.48550/arxiv.2112.00639 | public-domain | 2021-12-01 | A Systematic Review of Robustness in Deep Learning for Computer Vision |
| 6 | 10.48550/arxiv.2102.04458 | cc-by-nc-nd | 2021-02-08 | Detecting Fake News Using Machine Learning: A Systematic Literature Review |
| 7 | 10.48550/arxiv.1801.04288 | cc-by | 2018-01-12 | Determination of Critical Success Factors Affecting Mobile Learning |
| 8 | 10.48550/arxiv.2112.04573 | cc-by-nc-sa | 2021-12-06 | Application of Artificial Intelligence and Machine Learning |
| 9 | 10.48550/arxiv.2509.11446 | other-oa | 2025-09-14 | Large Language Models (LLMs) for Requirements Engineering (RE) |
| 10 | 10.48550/arxiv.2112.05700 | other-oa | 2021-12-10 | A Framework for Fairness: A Systematic Review of Existing Fairness Metrics |
| 11 | 10.48550/arxiv.2405.13832 | cc-by | 2024-05-22 | Federated Learning in Healthcare: Model Misconducts, Security, Privacy |
| 12 | 10.48550/arxiv.2308.02591 | cc-by | 2023-08-03 | IoT Based Smart Attendance System Using RFID |
| 13 | 10.48550/arxiv.2112.03315 | public-domain | 2021-12-06 | Adversarial Machine Learning In Network Intrusion Detection Systems |
| 14 | 10.48550/arxiv.2410.11123 | cc-by | 2024-10-14 | A Systematic Review on Prompt Engineering in Large Language Models |
| 15 | 10.48550/arxiv.2102.07820 | cc-by | 2021-02-15 | Anomalous Sound Detection with Machine Learning: A Systematic Review |
| 16 | 10.48550/arxiv.2306.04965 | public-domain | 2023-06-08 | Machine Learning in Digital Forensics: A Systematic Literature Review |
| 17 | 10.48550/arxiv.2302.05284 | cc-by-sa | 2023-02-10 | A Systematic Literature Review of Human-Centered, Ethical, and Explainable AI |
| 18 | 10.48550/arxiv.2412.15004 | other-oa | 2024-12-19 | From Vulnerabilities to Remediation: A Systematic Literature Review |
| 19 | 10.48550/arxiv.2502.00002 | cc-by | 2025-01-03 | Digital twins in tourism: a systematic literature review |
| 20 | 10.48550/arxiv.2203.05192 | public-domain | 2022-03-10 | A Systematic Literature Review on Blockchain Enabled Federated Learning |
| 21 | 10.48550/arxiv.2104.01255 | cc-by-sa | 2021-04-02 | A Systematic Literature Review on Phishing and Anti-Phishing Techniques |
| 22 | 10.48550/arxiv.2312.16148 | cc-by | 2023-12-26 | The Media Bias Taxonomy: A Systematic Literature Review on Media Bias |
| 23 | 10.48550/arxiv.2409.00411 | cc-by | 2024-08-31 | AI-powered software testing tools: A systematic review and empirical evaluation |
| 24 | 10.48550/arxiv.2308.02025 | cc-by-nc-nd | 2023-07-25 | Applications and Societal Implications of Artificial Intelligence |
| 25 | 10.48550/arxiv.2303.01259 | cc-by-sa | 2023-02-27 | Explainable Artificial Intelligence and Cybersecurity: A Systematic Literature Review |

**Restrictive ones:** `cc-by-nc-nd` (no derivatives — AI summarization may be a derivative; gate or skip), `cc-by-nc-sa` (non-commercial + share-alike), `other-oa` (unknown terms — verify before use).
**Open ones:** `cc-by`, `cc-by-sa`, `public-domain`.

## bioRxiv (30 samples from `fixtures/biorxiv/sample1.json`)

| # | DOI | License | Category | Title |
|---|-----|---------|----------|-------|
| 1 | 10.64898/2026.09.22.753490 | cc_by_nc_nd | bioinformatics | Trajectory fit alone does not identify causal edges |
| 2 | 10.64898/2026.09.12.751165 | cc_by_nc | bioinformatics | Comparative Mitogenomics of Tephritid Fruit Flies |
| 3 | 10.64898/2026.10.13.682053 | cc_by_nc_nd | bioinformatics | (sample) |
| 4 | 10.64898/2026.10.13.682053 | cc_by_nc | bioinformatics | (sample) |
| 5–30 | (various) | cc_by, cc_by_nc, cc_by_nc_nd, cc_by_nc_nd | various | 30 total samples in fixture |

**License distribution (30 samples):** `cc_by_nc_nd` (restrictive — no derivatives), `cc_by_nc` (non-commercial), `cc_by` (open). Exact counts available in `fixtures/biorxiv/sample1.json`.

**Restrictive ones:** `cc_by_nc_nd` — AI summarization/transformation may be a derivative work; respect or gate. `cc_by_nc` — non-commercial use only.

## Notes

- arXiv license must be fetched from OpenAlex (`license` field on locations) or the abstract page; the arXiv Atom API does not include it.
- bioRxiv license is in the JSON API (`license` field): `cc_by`, `cc_by_nc`, `cc_by_nc_nd`, `cc_by_nd`, `cc0`, or no reuse.
- For PINAPLP ingestion: prefer `cc-by` / `cc0` / `public-domain` for AI transformation; gate or skip `cc-by-nc-nd`.