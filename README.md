# 🇵🇭 Iskolar AI

**Ask in English or Taglish, get Philippine scholarships that fit you, with a link to every official page.**

> "Incoming college ako, BS Engineering. Anong scholarship pwede?"

Iskolar AI is a small retrieval-augmented generation (RAG) app. It searches a hand-checked list of Philippine scholarships, gives the best matches to an LLM, and the LLM answers **only from those matches**, citing each one as [1], [2]. If nothing fits, it says so instead of making something up.

## Why

Scholarship info in the Philippines is scattered across agency sites, Facebook pages and blog posts that go out of date. Students end up asking in group chats. This puts the official sources in one place and lets you ask the way you'd ask a friend.

## How it works

```
question ──► search (MiniSearch + Taglish synonyms + level filter)
                │  top 6 scholarships, numbered
                ▼
            LLM with strict rules: answer only from <sources>, cite [n]
                │
                ▼
answer + source links (sent before the answer starts streaming)
```

- **Data:** [`data/scholarships.json`](data/scholarships.json). Every entry has an `official_url`, `source_urls` and a `last_checked` date. Details the official page doesn't state are left `null`, never guessed.
- **Search:** keyword search with fuzzy matching, plus everyday words mapped to the data (`kolehiyo` → college, `OFW` → OWWA, `baon` → stipend). When a question names a level (SHS, college, grad school, TESDA), programs for other levels are dropped.
- **No database needed.** The dataset is small enough to search in memory, so it runs free on Vercel's hobby plan.
- **Model:** Gemini (free tier) by default, or any model through Vercel AI Gateway.

## Run it

```bash
git clone https://github.com/CharlieJamesGwapo/ph-scholarship-ai.git
cd ph-scholarship-ai
npm install
cp .env.example .env.local   # add a GOOGLE_GENERATIVE_AI_API_KEY
npm run dev                  # http://localhost:3000
```

The scholarship list below the chat works without any API key.

```bash
npm test          # search, prompt and streaming tests (no API key needed)
npm run typecheck
```

## Add or fix a scholarship

Data quality is the whole point, so changes need a source:

1. Edit `data/scholarships.json`.
2. Use the provider's **own** page (agency, LGU, foundation or school site, or their official Facebook page). Blogs and aggregator sites aren't accepted as sources.
3. Copy what the page says. If it doesn't state an amount or deadline, leave it `null`.
4. Set `last_checked` to today and open a PR.

## Disclaimer

Not affiliated with CHED, DOST, TESDA, OWWA or any provider listed. Programs, amounts and deadlines change every school year, so always confirm on the official page before applying.

## Support

If this helped you or someone you know, **star the repo** so more students find it, or [sponsor the maintainer](https://github.com/sponsors/CharlieJamesGwapo). Need Philippine data for your own project? See [ph-public-api](https://github.com/CharlieJamesGwapo/ph-public-api).

MIT License.
