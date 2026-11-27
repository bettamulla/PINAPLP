# GOAL: SIGNAL becomes a working "deep cut" intelligence app

Repo: PINAPLP (Next.js 14, Drizzle, Postgres, Anthropic SDK).
Thesis: the edge is DIFFERENT news, not more news. Surface the obscure, strange and
insightful (preprints, niche communities, specialist blogs), weighted against what the
mainstream is shouting. Mainstream headlines stay as a compact top layer. A commonplace
book (clip, annotate, resurface, link old notes to new finds) is the retention core.
Single user. Minimal, dark, fast.

## Operating protocol (non-negotiable)
1. Loop: first unticked item -> implement -> run `npm run verify` -> fix -> tick ->
   append to PROGRESS.md -> `git commit` -> next.
2. VERIFICATION IS FIXED. `npm run verify` = `tsc --noEmit && npm run lint && vitest run
   && node scripts/clean-build.mjs`. Never redefine it, weaken it, skip it, or substitute
   `npm run build`. Never delete or loosen a test to make it pass.
3. Run commands with the shell tool directly. Never print a tool call as text. Report
   only the real exit code and the last 30 lines. Without real output, say "unverified".
4. Never ask questions. Decide, log in DECISIONS.md, continue.
5. Blocked on a key or account only I can supply: write the adapter with fixtures,
   log in BLOCKERS.md, move on. Never fake live data. Demo data only behind
   DEMO_MODE, visibly labelled "DEMO".
6. Do not edit research/. Another agent owns it. Read it; build from its fixtures.
7. Stop ONLY when every box is ticked and `npm run verify` exits 0. Then print
   "GOAL MET". A passing build alone is not completion.

## Inputs (read first)
- research/sources-core.md, research/sources.json, research/fixtures/ (real responses)
- research/baselines.json: use ONLY preprint and community percentiles as seed
  references. Compute attentionPercentile at runtime from a rolling 30-day window of
  stored items, per sourceClass.
- Where no item-level attention signal exists (blog, press, mainstream) attention is
  null. Score obscurity from cross-source coverage. Never invent a number.

## Decisions already made
- Auth: single hardcoded owner login (env credentials, signed session cookie).
  Remove Clerk. Every query is still scoped by the owner id, with tests.
- Scheduling: Vercel Cron routes secured by CRON_SECRET. Remove Inngest.
- LLM: one provider module, per-stage routing, caching, rate-limit handling.
  Cheap stages (dedup, pre-filter) may use Groq/Gemini free tiers. Insight scoring
  and analysis use Claude (model from env ANTHROPIC_MODEL). Structured outputs (zod).
- Real embeddings (key via env) replace the hash pseudo-embedding. pgvector index.
- Spaced repetition: ts-fsrs package (MIT), replacing src/lib/spaced-repetition.ts.
- bioRxiv: no RSS. Use api.biorxiv.org/details/biorxiv/{from}/{to}/{cursor}/json.
- Reddit: OAuth only. Build behind env keys; if absent skip cleanly, log BLOCKERS.md.
- EurekAlert dropped. arXiv licence comes from OpenAlex.
- Perplexity-style Perspectives and source-reliability scoring: deferred. Do not build.
- Deferred, do not build: concept graph, quiz, weekly synthesis, jargon decoder.
- Lazy initialisation only: no env reads or client construction at module import.

## Checklist

### 0. Baseline
- [x] `npm run verify` exists and runs tsc, lint, vitest (at least one real test), clean build
- [x] scripts/clean-build.mjs: sets every key in .env.example to "" and runs `next build`
- [x] .gitignore covers .env*, !.env.example, *.lnk, .next, node_modules; track
      .env.example, package-lock.json, drizzle.config.ts, postcss.config.js, next-env.d.ts
- [x] `git ls-files | grep -i env` shows only .env.example; no secret in history
- [x] .env.example lists every variable used

### 1. Platform swaps
- [ ] Remove Clerk; owner login with env credentials; middleware protects all pages
- [ ] Remove Inngest; replace with Vercel Cron routes + vercel.json; CRON_SECRET check
- [ ] Tests: unauthenticated requests are rejected; cron without secret is rejected

### 2. Schema (Drizzle migrations)
- [ ] sources: sourceClass (mainstream|preprint|community|blog|press), evidenceTier, strange
- [ ] articles: attention (jsonb, nullable), attentionPercentile (nullable), obscurityScore,
      insightScore, deepCutScore, evidenceTier, rubric (jsonb), licence
- [ ] clips: quote, note, tags, embedding, FSRS fields; clipLinks (clipId, articleId,
      similarity, createdAt)
- [ ] predictions, predictionRevisions, predictionResolutions
- [ ] Migrations apply cleanly on a fresh database

### 3. Source adapters (src/lib/sources/*): typed, zod-validated, retrying, rate-limited,
env-guarded, unit-tested against research/fixtures
- [ ] arXiv (rss.arxiv.org; max 1 request / 3 s)
- [ ] bioRxiv JSON API; store the licence
- [ ] Hacker News (Firebase + Algolia; points and comments as attention)
- [ ] OpenAlex (citation counts as attention for papers; licences)
- [ ] Reddit (OAuth, skipped cleanly without keys)
- [ ] Generic RSS from research/sources.json, editable in Settings
- [ ] Dedup: canonical URL + title/embedding similarity

### 4. Scoring pipeline (cheap filters first, Claude last)
- [ ] attentionPercentile per sourceClass from the rolling window; null-safe
- [ ] obscurity = 1 - attentionPercentile; coverage-based when attention is null
- [ ] Claude insight rubric (0-5 each): novelty, mechanism clarity, surprise,
      evidence strength, cross-domain relevance. Structured output.
- [ ] evidenceTier: preprint | peer-reviewed | press-release | blog | community
- [ ] deepCut = insight x obscurity x tierMultiplier, with a hard insight floor
- [ ] Per-run token/cost cap in config; results cached
- [ ] Tests: low-insight/high-obscurity junk never outranks strong items

### 5. Daily briefing
- [ ] Compact mainstream top layer (3-5) + Deep Cut of the day + 3-5 runners-up
- [ ] Per story: whatHappened, whyItMatters, underlyingPrinciple, secondOrderQuestion,
      whatHappensNext, confidence (fact/analysis/speculation), evidenceTier, link, date
- [ ] Steelman step: user argues the opposing side before the analysis is revealed
- [ ] Vercel Cron job + "Generate now"; idempotent per day
- [ ] "Does this seem wrong?" feedback stored per story

### 6. Commonplace book
- [ ] Select text in any article -> clip with source, note, tags
- [ ] Embeddings on clips; search across clips
- [ ] Resurfacing via ts-fsrs; keyboard-driven evening review; ratings persisted
- [ ] Linking: a new article surfaces related old clips ("connects to your note from <date>")
- [ ] Dormant-clip rediscovery (untouched 90+ days), diversified by source

### 7. Wire the UI (no mock data outside DEMO_MODE)
- [ ] Today, Briefings, Storylines, Predictions, Knowledge, Assistant, Settings, Search
- [ ] Storylines: embedding clustering; never merge on shared keywords alone; follow/mute
- [ ] Predictions: create, revise with history, resolve with evidence, Brier score,
      calibration dashboard from real rows; weekly "what I got wrong" review
- [ ] Assistant: RAG over clips, articles, briefings; streaming; inline [n] citations
- [ ] Empty, loading and error states everywhere; dark theme polished

### 8. Production readiness
- [ ] Owner-scoping tests: every query filters by owner id
- [ ] No secret reaches client code (grep check inside verify)
- [ ] Error handling and retries on external calls; structured logging
- [ ] DEPLOY.md: Vercel steps, env vars, cron schedule
- [ ] Final `npm run verify` green; PROGRESS.md complete; print "GOAL MET"
