# Core Sources — Verified Reference

**Date:** 2026-11-27. PINAPLP = SIGNAL.
All endpoints verified by live request. Fixtures in `research/fixtures/<source>/`.

---

## 1. arXiv

- **Endpoint:** `https://export.arxiv.org/api/query?search_query=...&start=0&max_results=N&sortBy=submittedDate&sortOrder=descending` (Atom XML). RSS: `https://rss.arxiv.org/rss/<category>` (e.g. cs.AI, cs.LG, math, astro-ph).
- **Auth:** None required.
- **Rate limit:** 1 request per 3 seconds recommended (polite). No hard limit documented.
- **Licence/terms:** Authors retain copyright; most under CC BY or arXiv non-exclusive license. API metadata public. Text/data mining permitted (non-commercial research). Bulk access via S3 (`s3://arxiv/`).
- **Field map:**
  - title → `<title>`
  - url → `<id>` (http://arxiv.org/abs/...)
  - date → `<published>`
  - abstract → `<summary>`
  - attention metric → **none in API** (use OpenAlex `cited_by_count` or arXiv download stats)
  - categories → `<category term="...">`
- **Fixtures:** `fixtures/arxiv/sample1.xml`, `sample2.xml`, `sample3.xml` (3 samples, verified 200 + parses).
- **Note:** arXiv API does not expose license; use OpenAlex `license_id` or scrape abstract page.

## 2. bioRxiv

- **Endpoint:** `https://api.biorxiv.org/details/biorxiv/{date1}/{date2}/{cursor}/json` (JSON). RSS: `https://www.biorxiv.org/rss/` (main feed, returns HTML — **RSS is effectively dead/unusable**). Category RSS (e.g. `/rss/neuroscience`) returns 404.
- **Auth:** None required.
- **Rate limit:** Not documented; be polite (~1 req/sec).
- **Licence/terms:** Authors choose CC (CC BY, CC BY-NC, CC BY-ND, CC BY-NC-ND, CC0, or no reuse). Text & data mining explicitly permitted. Preprints citable via DOI.
- **Field map:**
  - title → `title`
  - url → `doi` (https://doi.org/10.1101/...)
  - date → `date`
  - abstract → `abstract`
  - attention metric → **none direct** (use OpenAlex citation counts)
  - license → `license` (e.g. `cc_by_nc_nd`, `cc_by_nc`, `cc_by`)
  - category → `category`
- **Fixtures:** `fixtures/biorxiv/sample1.json`, `sample2.json`, `rss_dead.html` (3 samples).
- **Known doubt settled:** bioRxiv RSS URLs are **dead** (return HTML/404). Use the JSON API instead. `connect.biorxiv.org/rss` also dead.

## 3. Hacker News (Firebase + Algolia)

- **Firebase API:** `https://hacker-news.firebaseio.com/v0/` (REST JSON, no auth, no rate limit). Endpoints: `/topstories`, `/newstories`, `/beststories`, `/askstories`, `/showstories`, `/jobstories`, `/item/<id>`, `/user/<id>`, `/maxitem`, `/updates`.
- **Algolia search:** `https://hn.algolia.com/api/v1/search?query=...&tags=story&hitsPerPage=N` (returns hits with `points`, `num_comments`, `url`, `title`, `created_at`).
- **Auth:** None for reads.
- **Rate limit:** None stated (Firebase). Algolia: standard limits (be polite).
- **Licence/terms:** MIT (docs). Data public.
- **Field map:**
  - title → `title`
  - url → `url`
  - date → `time` (unix) / `created_at`
  - abstract → `text` (HTML)
  - attention metric → `score` (upvotes) + `descendants` (comment count)
- **Fixtures:** `fixtures/hackernews/topstories.json`, `item.json`, `algolia.json`, `algolia200.json` (4 samples).

## 4. Reddit

- **API:** `https://www.reddit.com/dev/api/` (REST, OAuth2 required for most endpoints). Public JSON endpoints (e.g. `/r/subreddit/hot.json`) currently **blocked by network security** (403/429) without auth.
- **Auth:** OAuth2 (script/web app types). `X-Modhash` CSRF token for non-OAuth. `raw_json=1` to opt out of HTML entity encoding.
- **Rate limit:** ~10 req/min unauthenticated (observed 429), 60–100 req/min OAuth (documented). Reddit changed limits in 2023.
- **Licence/terms:** Reddit API ToS restricts commercial use and data redistribution.
- **Field map:**
  - title → `title`
  - url → `url`
  - date → `created_utc`
  - abstract → `selftext`
  - attention metric → `score` (upvotes) + `num_comments` + `upvote_ratio`
- **Fixtures:** `fixtures/reddit/hot.json` (blocked response), `blocked.html`, `api_docs.html` (3 samples).
- **Known doubt settled:** Reddit's current rate limits are ~10 req/min unauthenticated (observed 429), 60–100 req/min OAuth. Unauthenticated public JSON is blocked by network security.

## 5. OpenAlex

- **Endpoint:** `https://api.openalex.org/` (REST JSON). Works, authors, sources, institutions, topics, etc.
- **Auth:** None required (optional API key for higher limits: $1/day budget). Polite pool: add `mailto` param or User-Agent with email.
- **Rate limit:** 100k requests/day (shared free budget). With API key: $1/day budget.
- **Licence/terms:** Data is CC0 (open). Metadata freely usable.
- **Field map:**
  - title → `title`
  - url → `doi` / `landing_page_url`
  - date → `publication_date`
  - abstract → `abstract_inverted_index` (reconstruct by sorting positions)
  - attention metric → `cited_by_count`
  - license → `license` / `license_id` (per location)
- **Fixtures:** `fixtures/openalex/works.json`, `arxiv_works.json`, `topics.json` (3 samples).

## 6. EurekAlert

- **Endpoint:** No public API or RSS. Website only (`www.eurekalert.org`). Latest news releases at `/news-releases` (web). RSS (`/rss.xml`) returns 404 "Content not found" (RSS removed).
- **Auth:** None for public releases; reporter/PIO account for embargoed content.
- **Rate limit:** Not documented; be polite (1 req/sec, no bulk scraping).
- **Licence/terms:** Content redistribution restricted — "refrain from duplicating EurekAlert! content on other websites in a wholesale or content aggregation fashion without expressed permission." Must not aggregate wholesale.
- **Field map:**
  - title → page title
  - url → page URL
  - date → publication date
  - abstract → release body
  - attention metric → **none available**
- **Fixtures:** `fixtures/eurekalert/rss_404.html`, `help.html`, `home.html` (3 samples).
- **Note:** EurekAlert is NOT a viable automated source for PINAPLP due to no API/RSS and restrictive ToS. Use as manual reference only.