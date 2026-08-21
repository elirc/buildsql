# The Dojo

**Six self-directed, gate-graded courses sharing one harness: SQL,
TypeScript, Node.js, React, C#, and ASP.NET Core — plus a full-stack
interview-prep part at the end of every track.**

**130 lessons. 715 graded exercises.** Every exercise is real code you write
yourself — real SQL against a real PostgreSQL 16 database, real TypeScript
graded down to the *types*, real React graded through the accessible DOM,
real C# and ASP.NET Core graded by xUnit through an in-process test server.
An automated gate grades your work and — when you fail — teaches: it shows
the evidence and points you at what to reread. Nothing autocompletes.
Nothing is multiple-choice.

| track | alias | lessons | graded exercises | graded by |
|---|---|---:|---:|---|
| `sql` | (default) | 55 | 299 | pytest + PostgreSQL 16 in Docker |
| `typescript` | `ts` | 15 | 83 | vitest, incl. type-level gates (`expectTypeOf`) |
| `node` | | 15 | 82 | vitest + supertest |
| `react` | | 15 | 83 | vitest + Testing Library (jsdom) |
| `csharp` | `cs` | 17 | 97 | xUnit (`dotnet test`) |
| `dotnet` | `net` | 13 | 71 | xUnit + WebApplicationFactory, EF Core on SQLite |

Every command takes a track as its first word; with no track you get SQL, so
every command you already know still means what it always meant.

```bash
uv run dojo next typescript          # what to work on there
uv run dojo test cs 03_classes ex2   # grade one exercise (aliases work)
uv run dojo status                   # every track at once
```

## Setup (once)

The harness is Python: `uv venv && uv pip install -e ".[dev]"`, then
`cp .env.example .env`. After that, each track family has one prerequisite:

- **SQL** — Docker Desktop. `uv run dojo up` starts PostgreSQL 16,
  `uv run dojo seed` builds the template database (~5 minutes, one time).
- **TypeScript / Node / React** — Node 20+. `uv run dojo setup typescript`
  runs one `npm install` in `tracks/` that covers all three tracks.
- **C# / ASP.NET Core** — .NET SDK 10. `uv run dojo setup csharp` (or
  `dotnet`) builds the solution.

`uv run dojo doctor` diagnoses all of it. Start anywhere: `uv run dojo next
<track>` points at that track's lesson 00, which is a guided tour of the
whole loop.

## The gameplay loop

1. `uv run dojo next <track>` — tells you what to work on and which file to edit.
2. Read the lesson's `README.md`, top to bottom.
3. Edit the exercise's solution file (`solution.sql`, `solution.ts(x)`, or
   the named `.cs` file — `dojo next` always prints the exact path).
4. `uv run dojo test <track> <lesson> <exN>` — the gate grades you.
5. Red? Read the failure — it's written to teach. Stuck?
   `uv run dojo hint <track> <lesson> <exN>` reveals one hint tier at a time.
6. **Either way, take the reading.** After grading, the dojo offers the
   theory behind that exact problem — press Enter to open it inline, `s` to
   skip, `uv run dojo read <track> <lesson> [ex]` any time,
   `--no-read`/`DOJO_NO_READING=1` to silence the prompt.
7. Green? `dojo next` again.

Isolation is absolute in every track: SQL runs against a fresh throwaway
clone of the seeded template; JS and .NET gates run against your working
tree with per-test sandboxes (temp dirs, in-memory SQLite, in-process HTTP).
You cannot break anything, ever.

## Commands

| command | what it does |
|---|---|
| `dojo tracks` | list all six tracks with per-track completion |
| `dojo next [track]` | first incomplete exercise (no track: one line per track) |
| `dojo test <track> <lesson> [ex]` | grade a lesson or one exercise |
| `dojo hint <track> <lesson> <ex>` | reveal the next hint tier |
| `dojo read <track> <lesson> [ex]` | the theory behind one exercise, or the lesson's notes |
| `dojo status [track]` | progress dashboard (no track: everything) |
| `dojo review` / `dojo review run` | list / run due spaced reviews — across all tracks |
| `dojo setup <track>` | one-time toolchain prep (npm install / dotnet build) |
| `dojo doctor` | diagnose your setup, all toolchains |
| `dojo verify [track] [lesson]` | author/CI: prove every exercise is solvable |
| `dojo up` / `down` / `seed` / `lab` / `plan` / `reset-baseline` | SQL track: database lifecycle, sandbox psql, EXPLAIN, speed baselines |

(Prefix everything with `uv run`, or activate the venv.)

## The curricula

**SQL (55)** — Part 0 orientation; Parts 1–2 fundamentals and intermediate
querying (SELECT through windows, CTEs, JSONB); Part 3 modifying data and
transactions; Part 4 schema design; Part 5 performance and indexing (gates
check rows, plan shape, **and speed** vs your machine's own baseline);
Part 6 capstone; Parts 7–8 advanced patterns (LATERAL, DISTINCT ON,
GROUPING SETS, query rewrites, keyset pagination); Part 9 interview prep.

**TypeScript (15)** — inference and annotations, functions, objects and
interfaces, unions and narrowing, literals, generics (two lessons), utility
types, mapped and conditional types, guards and assertions, async and
declaration files — every lesson gated on both runtime behavior *and* the
types themselves — then interview prep.

**Node (15)** — modules, the event loop (graded output-prediction drills),
async patterns, events and errors, fs and path, buffers and streams (two
lessons), HTTP from scratch, Express 5, middleware and validation, and a
REST capstone graded end-to-end — then interview prep.

**React (15)** — components and JSX, props and composition, state and
events, lists and keys, forms, effects done honestly, data fetching with
race protection, refs, context and reducers, custom hooks, and performance
patterns — all graded through the accessible DOM, never implementation
details — then interview prep.

**C# (17)** — types and variables, control flow, classes, inheritance,
interfaces, structs and records, generics, collections, delegates and
lambdas, LINQ (two lessons that explicitly bridge to your SQL), exceptions,
and deterministic async/await — then interview prep.

**ASP.NET Core (13)** — minimal APIs, routing, dependency injection (with a
gate that catches captive dependencies), middleware order, configuration,
EF Core on SQLite (including a gate that fails hidden N+1 queries),
REST CRUD, errors and logging, JWT auth and integration testing — then
interview prep.

## Interview prep

Every track ends with it, and it is the part built for repetition: a 50+
question bank with model answers tagged ⭐ to ⭐⭐⭐ by interview frequency,
interviewer-voiced graded drills with time-boxes (each track has a
45-minute realistic take-home), and rapid-fire re-tests of the ⭐⭐⭐
concepts — all wired into the spaced-review ladder (3 → 7 → 21 → 60 days)
so the most-asked material keeps coming back until it's reflex. The full
guide, including a pre-interview schedule, is
[docs/interview-prep.md](docs/interview-prep.md).

## The reading

Every lesson ships `reading.md` beside its `README.md`: the mental model
(`## Notes`), one section per exercise on what that problem was *really*
testing, and `## Further reading` links into primary documentation (the
PostgreSQL manual, the TypeScript handbook, react.dev, nodejs.org,
learn.microsoft.com). Read it after you attempt a problem, not before —
failing first and reading second is the version of studying that sticks.
`dojo status` counts readings opened; it is the one number worth maximising.

## The dataset (SQL track)

50,000 customers, 10,000 products, 500,000 orders, 1M order items, 1M
reviews, 3M clickstream events, and a 500-person staff org chart —
deterministic (fixed seeds, fixed timestamps), so your numbers match the
lessons' numbers on any machine. Tour it in [docs/dataset.md](docs/dataset.md);
exact figures live in [docs/dataset_facts.md](docs/dataset_facts.md).

## Honesty model

Hints, reference queries, and author solutions (`.reference/`) sit in plain
sight in the lesson directories. Nothing is encrypted — this course belongs
to you, and the CLI just makes the honest path the convenient path:
`dojo hint` reveals hints progressively and notes how many you used (no
penalty). You're here to learn, not to beat a proctor.

## Troubleshooting

- **`Cannot reach PostgreSQL`** — `uv run dojo up`, wait a few seconds,
  retry. Is Docker Desktop running? (SQL track only — no other track needs
  Docker.)
- **`Template 'dojo_template' missing`** — `uv run dojo seed`.
- **JS gates fail with a module error** — `uv run dojo setup typescript`
  (one install covers typescript/node/react).
- **C#/.NET gates won't build** — `uv run dojo setup csharp` /
  `uv run dojo setup dotnet`; `uv run dojo doctor` names what's missing.
- **Hangs connecting on Windows/Docker Desktop** — keep
  `POSTGRES_HOST=127.0.0.1` in `.env` (IPv6 `localhost` can hang).
- **SQL speed gates feel unfair after a hardware change** —
  `uv run dojo reset-baseline`.
- **Port in use** — change `POSTGRES_PORT` in `.env`.
- **Start truly over** — `docker compose down -v`, then `dojo up` +
  `dojo seed`. Progress lives in `data/progress.json`; delete it to reset
  every track's dashboard.
