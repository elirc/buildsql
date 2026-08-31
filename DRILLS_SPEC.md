# Drill Sets (Volume 2) — Specification

Volume 2 triples the dojo's practice volume: every track gains a **"Drill
sets" part** — 24 drill lessons per new track, 60 for SQL, **8 core exercises
each**, no challenges, no review variants. All slugs are already in the
manifests (`d01_*`–`d24_*` per track; `55_*`–`114_*` for SQL); manifests are
frozen — content agents never edit curriculum files.

## What a drill lesson is

A problem set, not a lecture. The numbered lessons taught the concept; a
drill lesson makes it automatic. It uses the exact same anatomy as every
other lesson (README.md, reading.md, per-exercise hints.md + `.reference/`,
stubs that fail as shipped, gates quoted verbatim in the README) and passes
the exact same `dojo verify <track> <slug>` — but the prose is leaner:

- **README**: a 2–3 sentence cold open naming what this set practices and
  which lessons it draws on ("These eight problems drill narrowing — lessons
  04 and 10; redo those first if this set feels like guessing"), then one
  compact subsection per exercise (the problem, exact file to edit, exact
  command), then the gate quoted verbatim. No concept section — the concept
  lives in the source lessons.
- **reading.md**: `## Notes` (a short map of the set: the skill being
  drilled and the pattern that unites the problems, ≥25 words), then per
  exercise (≥25 words each): **what this problem was really testing, the
  classic mistake, and one sentence of the model answer's reasoning** — this
  is the "explanations" layer, write it well. `## Further reading` ≥3 links
  into primary docs.
- **hints.md**: 2 tiers per exercise is enough for drills (3 where genuinely
  hard). Hint 1 names the concept; Hint 2 the approach. Never the answer.

## Difficulty and design rules

1. Exercises ramp: ex1–ex3 direct application, ex4–ex6 add a twist or
   combine two ideas, ex7–ex8 are the "interview hard" versions.
2. Every problem is self-contained — no exercise depends on another
   exercise's solution.
3. Problems must be FRESH: never restate an existing lesson's exercise with
   renamed variables. New scenarios, new traps, new data slices.
4. Prompts stay unambiguous about output (exact columns/return
   shapes/ordering), because the gates compare literally.
5. Only concepts taught somewhere in the track may be required (drills sit
   after the full course, so anything the track teaches is fair game — and
   mixing earlier topics in is encouraged in ex7–ex8 and the `mixed`
   gauntlet lessons).
6. Assertion messages keep teaching: which check failed, the evidence, what
   to reread.
7. The final `*_mixed_*` / `*_gauntlet` lessons are cumulative: each
   exercise combines 2–3 topics from across the whole track.

## Per-track mechanics (unchanged from Volume 1 — follow the AUTHORING.md files)

- **JS tracks** (`tracks/AUTHORING.md`): gate file(s) per lesson import
  `./exN/solution`; test titles start with `exN` + non-alphanumeric and
  contain **no apostrophes or quotes** (verify's regex stops at the first
  quote). TS drills keep grading types (`gate.test-d.ts`, expectTypeOf,
  `@ts-expect-error`). React drills grade the accessible DOM via RTL;
  injected fetchers/spy props; fake timers for anything timed. Node drills
  stay deterministic (fake timers, injected clocks, deferreds; supertest,
  no fixed ports; temp dirs for fs).
- **.NET tracks** (`tracks/csharp/AUTHORING.md`, `tracks/dotnet/AUTHORING.md`):
  slug → folder/namespace via `source_folder` (`d04_di_lifetimes` →
  `D04_DiLifetimes`); gate methods named `ExN_Something` (underscore
  required); stubs compile (`throw new NotImplementedException()`);
  the whole solution must always build. dotnet drills route under
  `/d0N/...` prefixes and register via the module convention; SQLite
  in-memory per test; use the existing `Teach` helpers.
- **SQL**: correctness gates only (family A, `shared_lesson_db`,
  `expected.sql` + `.reference/solution.sql`, stub `SELECT 1;`).
  Scale-independent always: no full-volume counts, ids valid at
  DOJO_SCALE=0.1, `events.ts` spans only ~3.5 days at 0.1 scale (counting
  back from 2023-11-14 22:13 UTC), no equality probes on `orders.total`.
  Ground every number in `docs/dataset_facts.md`.
- **Prose encoding**: ASCII-safe in SQL and C# tracks (no emoji/arrows);
  other tracks may use them but plain ASCII is preferred.

## Verification (per agent, non-negotiable)

Verify each lesson as you finish it (`uv run dojo verify <track> <slug>`),
and finish your assignment with every assigned lesson green: lint ok,
reference passes, pristine stubs fail. `DOJO_NO_PROGRESS=1` on every ad-hoc
test run. SQL agents: never hold a connection to `dojo_template` while any
gate runs; verify only your own lessons, never the whole track.

## File ownership

An agent touches ONLY its assigned lesson slugs' files (lesson dirs, plus
for .NET tracks the matching `src/**/D*` folders and `tests/Gates/D*Tests.cs`
files). Manifests, shared configs, other lessons, other tracks: hands off.
Multiple agents work the same repo concurrently — stay in your lane.
