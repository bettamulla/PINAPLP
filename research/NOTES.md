# NOTES — Data Goal Decisions

**Date:** 2026-11-27.

## Decisions
1. Created research/ in Documents (harness cwd) as primary; mirrored to PINAPLP/research/.
2. Used curl (TLS verified, follows redirects) for feed verification (Python urllib had SSL cert issues).
3. Used feed posting frequency (posts/day) as per-item attention proxy for blog/press/mainstream, but marked "unavailable" (no per-item metric in RSS). HN Algolia URL search returned 0 hits for sample blog article, confirming HN mentions are sparse.
4. Preprint attention: OpenAlex cited_by_count (250 samples from latest arXiv listings, including zeros — 82% are 0).
5. Community attention: HN Algolia date-bucketed random draw (800 stories, p50=2.0, not top-ranked biased sample).
6. Reddit is blocked (403) without OAuth; documented as OAuth-gated. Not a viable automated source.
7. EurekAlert has no RSS/API; documented as manual-reference only.
8. bioRxiv RSS is dead (404/HTML); use JSON API.
9. arXiv license not in API; use OpenAlex or abstract page scrape. 25+ records in licenses.md.
10. Obscurity score defined as proposed metric (no standard exists).
11. Commonplace book reframes PINAPLP's knowledge feature.
12. check.mjs uses __dirname for robust path resolution.
13. Fixtures require 3+ files per source dir; all 6 sources have 3+.
14. Strange feeds: 31 verified (zoology, materials, math, history of tech, independent researchers), excluding arXiv/HN/large outlets.

## Counts (match sources.json)
- Total feeds: 76 (66 niche + 10 mainstream)
- Niche: 66 (>=30)
- Mainstream: 10 (>=10)
- Strange (small, non-arxiv, non-HN): 31 (>=25)
- By class: preprint 2, community 6, blog 23, press 8, mainstream 10
- Baselines: 5 classes (preprint, community, blog, press, mainstream)
- Fixtures: 6 source dirs, 41 files, all parse

## Sync
- Primary: C:\Users\Raekw\OneDrive\Documents\research\
- Mirror: C:\Users\Raekw\PINAPLP\research\ (robocopy after changes)