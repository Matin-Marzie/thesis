# CLAUDE.md — thesis-matin

Personalized language-learning app (React Native / Node.js / PostgreSQL / Python) + LaTeX dissertation for Ionian University.

---

## Repo layout

| Path | What lives there |
|---|---|
| `frontend/` | Expo 54 / React Native 0.81 app (TypeScript) |
| `backend/` | Node.js 20 + Express, ESM (`"type":"module"`), PostgreSQL via `pg` |
| `reels-service/` | Python FastAPI micro-service for video ingestion |
| `database/` | Raw SQL schema and seed scripts |
| `manuscript/` | LaTeX thesis — Ionian University `ioniothesis` class |

---

## Code rules

- Backend uses `"type": "module"` — always `import/export`, never `require/module.exports`.
- Before adding any React Native package, check Expo SDK 54 compatibility. Prefer the `expo-*` variant when one exists.
- PostgreSQL queries go through the `pg` pool; never concatenate user input into SQL strings.
- Never commit `.env` files — they exist in `.gitignore`; use `.env.example` to document variables.
- Tests live next to source in `__tests__/`; run with `npm test` (Jest + experimental VM modules).
- Keep `docker-compose.yml` as the single source of truth for local service wiring.

---

## Manuscript rules

### Compilation
- Compile order: `pdflatex thesis` → `bibtex thesis` → `pdflatex thesis` → `pdflatex thesis`. One pass is never enough after bibliography changes.
- Greek passages require an explicit `\selectlanguage{greek}` … `\selectlanguage{english}` wrapper.
- Chapter files belong in `manuscript/chapters/`, back-matter in `manuscript/backmatter/`.
- The thesis uses `\bibliographystyle{plain}` (numeric, sorted alphabetically by author). Do not switch to author-year (`apalike`, `natbib`) without updating every `\cite{}` call.
- `manuscript/backmatter/bibliography.tex` still contains a template `\bibitem{reference}` — remove it entirely; BibTeX generates the real list from `references.bib`.

### Placeholder audit — known open items

The manuscript has many `[PLACEHOLDER]` tokens and skeleton sections that must be filled before submission. Track them explicitly:

| File | Status | Remaining action |
|---|---|---|
| `chapters/-abstract.tex` | Done | None |
| `chapters/-abstract_greek.tex` | Draft written | Expand each section into full paragraphs; verify Greek phrasing |
| `chapters/-acknowledgments.tex` | Done | Fill `[SUPERVISOR NAME]` and `[MONTH]` |
| `backmatter/abbreviations.tex` | Done | None |
| `backmatter/glossary.tex` | Done | None |
| `backmatter/bibliography.tex` | Done | None |
| `title_pages.tex` | Done | Fill `[MONTH] 2026` (×2) and matching `[MONTH]` in acknowledgments |

Do not leave any `[BRACKET-PLACEHOLDER]` in the final PDF. Search for `\[` in the compiled PDF or `grep -r '\[' manuscript/` to catch stragglers.

### Factual consistency — the backend is Node.js, not Python

The abstract currently states "The application is built with a React Native frontend, a **Python-based backend**". This is wrong. The primary backend is Node.js/Express (`backend/`). Python is used only in `reels-service/` for video ingestion. Fix this claim wherever it appears in the manuscript.

### Chapter 1 — Introduction

Current state: rough notes and section stubs.

- Replace "Language is very important for Communication." with a proper opening paragraph that establishes the research gap (passive consumption of Reels vs. active vocabulary retention) and cites the market-size figure from the related work.
- Each section must end with a forward reference to where the topic is developed ("This is discussed in Chapter 2, Section X").
- The "Thesis organisation" section must list every chapter and one sentence summarising its content.

### Chapter 2 — Literature Review

Current state: partially written; several subsections are stubs or have duplicated paragraphs.

- **Duplicate paragraph**: the paragraph beginning "In this proposed application, authenticity will be central…" appears twice (lines 19 and 21). Remove one instance.
- **Typo in section heading**: "Drilling and masquaradilng as gamification" — fix to "Drilling and masquerading as gamification".
- **Empty subsections**: "Drilling and masquerading as gamification", "Lack of advanced proficiency development", and "Ignoring sociocultural theory of Vygotsky" have no body text. Either fill them or remove the subsection heading.
- **Forward reference stub**: "As we are going to discuss in the next section..." must be replaced with a concrete sentence before submission.
- The Vygotsky section must introduce the Zone of Proximal Development and explain how the recommendation engine's difficulty-bracketing maps to it — this is the theoretical backbone of the entire system.
- Every limitation identified in Chapter 2 must have a corresponding response in Chapter 3 (methodology) and Chapter 5 (evaluation). If a gap is named here but never addressed, either address it or remove it.

### Chapter 3 — Methodology

Current state: all prior content was commented out; only four placeholder section titles remain.

- The commented-out draft (multi-stage recommendation pipeline, cosine similarity, re-ranking) contains the real architecture. Uncomment and expand it — do not rewrite from scratch.
- "Technology Stack" must document the actual stack: Expo 54 / React Native frontend, Node.js + Express backend, PostgreSQL, Python reels-service. Match what is in the repo.
- The recommendation engine section must explain all three stages: preprocessing (Ebbinghaus filtering on `user_words` table), cosine similarity scoring, and re-ranking/blending. If any stage is not yet implemented, say so explicitly and label it as future work.
- Include a system architecture diagram (`\includegraphics`) showing how frontend, backend, database, and reels-service interact. A missing figure is a common examiner complaint.

### Chapter 4 — Implementation Details

Current state: five placeholder section titles with no body text.

- Every section must reference actual file paths or module names from the repo (e.g., "The recommendation pipeline is implemented in `reels-service/main.py`").
- The Wordle and Word-of-Wonders subsections must describe the personalisation mechanism — how a word's mastery level in `user_words` determines whether it appears in a game round.
- "Complexity Analysis" must give concrete Big-O bounds for at least the recommendation algorithm and the grid generation. Do not include this section if it cannot be backed with analysis.

### Chapter 5 — Evaluation & Results

Current state: three placeholder section titles.

- If no user study was conducted, state that explicitly and replace the UX section with a heuristic evaluation or expert review.
- Performance benchmarks (latency, DB query time) must be measured against the running Docker stack, not estimated.
- "Pedagogical Effectiveness" cannot be written without data. If data is unavailable, scope the section to a design-level argument referencing the theoretical framework from Chapter 2.

### Chapter 6 — Conclusions & Future Work

Current state: three placeholder section titles.

- "Summary of Contributions" must enumerate exactly what was built and what claims were validated — one bullet per contribution, each traceable to a chapter.
- "Limitations" must be honest: if the recommendation engine is only partially implemented, say so.
- "Future Directions" proposals (VR, multi-language, real-time AI interaction) are already listed as comments in `references.bib` — move them here, not there.

### Section and chapter title conventions

Titles are noun phrases. That is the rule. Everything else follows from it.

**Banned patterns — never use:**
- `The [Noun] of X` openers — drop "The … of": `The Role of Short-Form Media` → `Short-Form Media in SLA`
- `The [Proper noun]` — drop the article: `The Ebbinghaus Forgetting Curve` → `Spaced Repetition and Memory Retention`
- Gerunds as topic labels — `Identifying X` → `X`; `Implementing X` → `X Implementation` or just `X`
- `X as a Y` metaphor constructions — `…as a Learning Vehicle`, `…as an Attention Medium` → just name the thing
- Literary or popular-science framing — `The Paradox of…`, `The Landscape of…`, `The Battle of…`
- Questions — section headings are never questions
- `Summary of X` / `X of the Study` / `X and Context` — drop the redundant qualifier: `Summary of Contributions` → `Contributions`; `Limitations of the Study` → `Limitations`

**Required patterns:**
- Noun phrase: `Recommendation Engine Design`, `Database Schema`, `Spaced Repetition and Memory Retention`
- `Noun in/of Context` when the context adds precision: `Short-Form Media in Second Language Acquisition`
- `X and Y` for genuinely parallel topics: `Problem Statement and Research Questions`
- Chapter titles use `and`, never `&`
- Title case throughout: every content word capitalised

### Writing quality baseline

- Write in academic English. Do not use contractions, first-person singular ("I think"), or informal connectors ("Also, …", "So, …").
- Every claim about user behaviour, learning theory, or market data requires a citation. No citation-free factual assertions.
- Spell out every abbreviation on first use: "Mobile-Assisted Language Learning (MALL)", then "MALL" thereafter. The abbreviations page must mirror what is in the text.
- Section and subsection headings are title-cased in this thesis style — match the pattern already used in Chapter 2.

---

## Bibliography — the critical section

These rules are the most important ones in this file. Get them right.

### Verification mandate

**Every entry in `references.bib` must be verified against the actual source before it is used in the manuscript.** Several current entries are marked `% generated by chatgpt` — this means the metadata (author names, journal name, volume, pages, DOI, URL) was hallucinated and may be wrong. Before citing any such entry:

1. Open the URL or search the title on Google Scholar / Semantic Scholar.
2. Confirm author names, year, journal/venue, volume, and pages match the real publication.
3. If the source does not exist or cannot be located, remove the entry and the corresponding `\cite{}` call from the text.
4. Replace the `% generated by chatgpt` comment with either nothing or a one-line factual note about the source.

Never add a new entry that you have not verified yourself. Never generate or guess DOIs, ISBNs, or URLs — leave the field absent if unknown.

### BibTeX key naming

Use the format `AuthorYEARkeyword` in lowercase camelCase:

```
gilmore2007authentic
karasimos2022battle
duolingo2025courses
```

Avoid mixed-case anomalies like `LiuDong2024AuthenticLanguageModelsClassrooms` — these are hard to type and inconsistent.

### Entry types

| Source type | BibTeX type |
|---|---|
| Journal article | `@article` — must have `journal`, `volume`, `number`, `pages` |
| Conference paper | `@inproceedings` — must have `booktitle`, `pages` |
| Book | `@book` — must have `publisher` |
| Web page / press release / report | `@misc` — must have `url` and `note={Accessed: YYYY-MM-DD}` |
| Tech report | `@techreport` |

Do not use `@article` for web pages or press releases — use `@misc`.

### The `.bib` file is not a notebook

Lines 185–199 of `references.bib` contain non-BibTeX plaintext (expansion ideas, Greek comments, bullet lists). This breaks BibTeX parsers unpredictably. All content in `references.bib` must be either a valid BibTeX entry or a `%`-prefixed comment. Strip prose notes and move them to `manuscript/chapters/` where they belong.

### Citing in text

- Every `\cite{key}` must have a matching entry in `references.bib`. Orphan keys silently drop the citation number and corrupt the reference list.
- Every entry in `references.bib` that is not cited anywhere is dead weight — remove it before submission.
- Do not pad the bibliography with loosely related works. Cite only what you actually discuss in the text.

### Market-size and statistics citations

Numbers like "USD 5.8 billion in 2025" or "14.2 million downloads" change yearly and are often misquoted. Always include the exact report name, publisher, and access date in the `@misc` entry. If a statistic came from a secondary source (e.g., a blog citing a report), cite the primary report, not the blog.

### AI-assistance disclosure

If your university requires disclosure of AI-assisted writing, handle it in the Acknowledgments chapter — not as inline comments in `.bib` files. Clean all `% generated by chatgpt` markers out of the final submission.

---

## Git hygiene

- Commit messages follow `type(scope): description` — e.g., `fix(wordle): correct grid overflow`, `docs(manuscript): expand related work section`.
- The main branch is `main`. Work in feature branches; merge via PR.
- Do not force-push `main`.
