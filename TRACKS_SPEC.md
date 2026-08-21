# Dojo Tracks — Multi-Track Expansion Specification

The SQL Dojo (see `BUILD_SPEC.md`) grows into a **multi-track dojo**: the same
self-directed, gate-graded course model applied to five new tracks —
**TypeScript, Node, React, C#, and ASP.NET Core (".NET")** — each with a
comprehensive **full-stack interview-prep part**. The SQL course also gains an
interview-prep part. One learner (Eli), one machine, everything local and
deterministic.

This document is the contract between the orchestrator and the implementing
agents. `BUILD_SPEC.md` §12 (lesson authoring quality bar), §7 (exercise
anatomy), and §8 (hints) apply to every track verbatim unless overridden here.

---

## 1. Philosophy (unchanged)

1. The learner writes every line themselves. Grading is automated; solving is human.
2. Failure messages teach: what failed, the evidence, what to reread.
3. Isolation: one exercise cannot break another.
4. Deterministic and offline. No network calls at exercise time.
5. Practice volume and retention are first-class: hints, challenges, spaced review.
6. **New:** interview readiness is a first-class outcome. Every track ends in an
   interview part whose most important drills feed the spaced-review scheduler,
   so the highest-frequency interview concepts come back again and again.

## 2. Toolchains (verified installed on the target machine)

- Node **v22.16**, npm 10.9 — grades `typescript`, `node`, `react` tracks via **vitest**.
- .NET SDK **10.0.302** — grades `csharp`, `dotnet` tracks via **xUnit** (`dotnet test`).
- Python 3.11 + uv — the harness (`dojo` CLI) stays Python and orchestrates everything.
- Docker/PostgreSQL — **SQL track only**. New tracks must never require Docker.

## 3. Repository layout

```
buildsql/
├── dojo/                      # harness package (extended, stays the single CLI)
│   ├── tracks.py              # NEW: track registry + Track dataclass
│   ├── runners.py             # NEW: VitestRunner, DotnetRunner (subprocess + result parsing)
│   ├── curriculum.py          # SQL manifest (kept as-is) + gains interview lessons
│   └── ...                    # existing modules untouched in behavior
├── lessons/                   # SQL track (existing, untouched except new interview lessons)
└── tracks/
    ├── package.json           # ONE npm install for all three JS tracks
    ├── tsconfig.base.json
    ├── typescript/
    │   ├── curriculum.py      # this track's manifest (imported by dojo.tracks)
    │   ├── vitest.config.ts
    │   ├── tsconfig.json
    │   └── lessons/NN_slug/
    │       ├── README.md
    │       ├── reading.md
    │       ├── gate.test.ts   # one describe/test block per exercise, quoted in README
    │       └── exN/
    │           ├── solution.ts     # learner stub (compiles, fails the gate)
    │           ├── hints.md        # ## Hint 1..3
    │           └── .reference/solution.ts
    ├── node/                  # same shape as typescript/
    ├── react/                 # same shape; solution.tsx; RTL + jsdom
    ├── csharp/
    │   ├── curriculum.py
    │   ├── CSharpDojo.sln
    │   ├── src/Lessons/Lessons.csproj        # net10.0 classlib; learner-edited files
    │   │   └── L03_Methods/Ex1.cs            # namespace CSharpDojo.L03_Methods
    │   ├── tests/Gates/Gates.csproj          # xUnit; one class per lesson
    │   │   └── L03_MethodsTests.cs
    │   └── lessons/NN_slug/                  # README.md, reading.md, exN/hints.md,
    │       └── exN/.reference/Ex1.cs         # reference copies of the learner files
    └── dotnet/                # same shape as csharp; src/Api is an ASP.NET Core app
```

Conventions:

- **Prose and hints always live under `tracks/<t>/lessons/NN_slug/`** in the
  same files as the SQL course (README.md, reading.md, exN/hints.md,
  exN/.reference/). The *code* the learner edits lives where the toolchain
  needs it (same dir for JS tracks; `src/Lessons`/`src/Api` for .NET tracks,
  with the lesson dir's `exN/.reference/` mirroring the learner files).
- Every lesson dir's README states exactly which file(s) to edit and the exact
  `dojo` command to run.
- JS lesson gate files import the learner's `exN/solution.ts` by relative path.
- C#/.NET: each lesson's learner files live in one folder/namespace
  (`L07_Interfaces`); the gate class covers that namespace. Learner files ship
  as compiling stubs (`throw new NotImplementedException()` bodies) so the
  solution always builds.

## 4. Track registry and CLI (harness work)

`dojo/tracks.py` defines:

```python
@dataclass(frozen=True)
class Track:
    name: str            # "typescript"
    aliases: tuple       # ("ts",)
    root: Path           # ROOT / "tracks" / "typescript"
    runner: str          # "vitest" | "dotnet" | "sql"
    title: str
```

Registered tracks: `sql` (default, existing behavior byte-for-byte), `typescript`
(`ts`), `node`, `react`, `csharp` (`cs`), `dotnet` (`net`).

CLI (backward compatible — bare SQL usage keeps working):

| command | behavior |
|---|---|
| `dojo tracks` | list tracks with per-track completion % |
| `dojo test <track> <lesson> [ex]` | grade via that track's runner; `dojo test 08_inner_joins` still means SQL |
| `dojo hint/read <track> <lesson> [ex]` | same resolution rule; reading/hints machinery reused as-is |
| `dojo status [track]` | no arg: all tracks (SQL tree + one tree per track); with arg: that track only |
| `dojo next [track]` | no arg: first incomplete exercise **per track** (one line each); with arg: detail for that track |
| `dojo review [run]` | spans all tracks (review IDs are track-prefixed) |
| `dojo verify [track] [lesson]` | track-aware verify (see §7) |
| `dojo doctor` | existing checks + node/npm present, `tracks/node_modules` installed, dotnet SDK present, both .NET solutions build |
| `dojo setup <track>` | one-time toolchain prep: `npm install` in `tracks/` (JS tracks) or `dotnet build` (C#/.NET) |

Resolution rule: if argv[1] matches a track name/alias → that track; otherwise
SQL track (unchanged). Lesson-slug prefix matching works per track as today.

**Progress IDs:** SQL keeps existing IDs (`08_inner_joins::test_ex2` — no
migration). New tracks prefix: `typescript/03_unions_narrowing::ex2`. Review
scheduling, hints, and readings reuse `dojo/progress.py` unchanged.

**Runners** (`dojo/runners.py`):

- `VitestRunner`: `npx vitest run <lesson>/gate.test.ts -t "<exN>"` with the
  JSON reporter; parse pass/fail per test; stream vitest's own output through
  (it is the teaching failure message); record progress. Uses the track's
  `vitest.config.ts`. TS track runs vitest with `--typecheck` so
  `expectTypeOf` assertions grade type-level work.
- `DotnetRunner`: `dotnet test tests/Gates --filter FullyQualifiedName~L03_`
  (narrowed further to `~L03_.*Ex2` for a single exercise); parse results
  (trx or console); stream output; record progress.
- Both must return nonzero on failure, and must map results back to exercise
  IDs so the reading prompt (`dojo/reading.py`) fires after grading exactly as
  it does for SQL.

## 5. Gate families for the new tracks

- **J. Behavior gate** (all JS tracks + C#): the gate calls the learner's
  exported function/class/component and asserts behavior with expect(). Failure
  output = vitest/xUnit diff plus a one-line teaching message baked into the
  assertion (`expect(x, "COALESCE-style: return the first non-null — reread
  §ex2").toBe(...)` / xUnit `Assert.True(cond, "…")`).
- **T. Type gate** (TypeScript track): `expectTypeOf` assertions +
  `// @ts-expect-error` probes prove the learner's *types* are right, not just
  runtime values. Most TS lessons mix J + T in one gate.
- **R. Component gate** (React): RTL render + user-event interactions +
  jsdom; assert on the accessible DOM (roles/labels), never implementation.
- **W. API gate** (dotnet, some node lessons): boot the app in-process
  (WebApplicationFactory / supertest against the learner's express app),
  hit endpoints, assert status/body/headers. EF Core lessons use SQLite
  in-memory; node persistence lessons use in-memory stores.
- Stubs as shipped must FAIL their gate; references must PASS (verified, §7).

## 6. Curricula

Lesson counts are the contract; exercise splits (3–4 core each, `C` =
challenge) may be tuned ±1 by the authoring agent. Every Part-marked
"fundamentals" lesson ships a **review variant** exactly like SQL Parts 1–2.
Interview lessons are described in §6.7.

### 6.1 typescript (12 + 3 interview)

00_hello_dojo (toolchain + gameplay; first typed function) ·
01_primitives_and_inference (annotations vs inference, arrays, tuples, readonly) ·
02_functions (signatures, optional/default params, overloads, void/never) ·
03_objects_interfaces (interface vs type alias, optional/readonly props, index signatures) ·
04_unions_narrowing (unions, typeof/in/instanceof narrowing, discriminated unions, exhaustiveness via never) ·
05_literals_enums (literal types, as const, enums vs union-of-literals) ·
06_generics_1 (generic functions/interfaces, why any loses) ·
07_generics_2 (constraints, keyof, defaults, generic classes) ·
08_utility_types (Partial/Required/Pick/Omit/Record/ReturnType/Parameters/Awaited — implement some from scratch) ·
09_mapped_conditional (mapped types, conditional types, infer, distributivity) ·
10_guards_assertions (user-defined type guards, assertion functions, unknown vs any, satisfies) ·
11_async_and_modules (typing promises, async iteration, declaration files, module resolution) ·
capstone folded into 11's challenge.

### 6.2 node (12 + 3 interview)

00_hello_dojo ·
01_modules (ESM/CJS interop, exports, import.meta) ·
02_event_loop (microtasks vs macrotasks, ordering drills graded as functions returning predicted sequences, timers, setImmediate) ·
03_async_patterns (callbacks→promisify→async/await, Promise.all/allSettled/race/any, concurrency limiting) ·
04_events_errors (EventEmitter, error-first conventions, unhandled rejections, custom error classes, operational vs programmer errors) ·
05_fs_path (fs/promises, path portability, JSON pipelines) ·
06_buffers_streams (Buffer, Readable/Writable, backpressure concept) ·
07_streams_2 (Transform, pipeline(), composing) ·
08_http_core (http.createServer from scratch: routing, query, body parsing — no framework) ·
09_express_fundamentals (routing, params, middleware order) ·
10_middleware_validation (custom middleware, central error handler, zod validation) ·
11_rest_capstone (small in-memory REST API graded end-to-end with supertest).

### 6.3 react (12 + 3 interview)

00_hello_dojo ·
01_components_jsx (function components, JSX rules, fragments) ·
02_props_composition (props, children, composition vs configuration) ·
03_state_events (useState, event handlers, updater form, batching) ·
04_lists_conditional (rendering lists, keys and why index-keys bite, conditionals) ·
05_forms (controlled inputs, select/checkbox, minimal validation) ·
06_effects (useEffect, deps array honestly explained, cleanup, fetch-on-mount) ·
07_data_fetching (loading/error states, race protection with cleanup/AbortController) ·
08_refs_dom (useRef for DOM + mutable refs, forwardRef) ·
09_context_reducer (prop drilling → context; useReducer for multi-field state) ·
10_custom_hooks (extracting logic: useLocalStorage, useDebounce, rules of hooks) ·
11_performance_patterns (memo/useMemo/useCallback — when they matter and when they don't; lifting state; capstone component).

### 6.4 csharp (14 + 3 interview)

00_hello_dojo ·
01_types_variables (value vs reference types, var, casting, string interpolation, nullable annotations) ·
02_control_flow_methods (expressions, loops, params: ref/out/params, optional args, expression-bodied) ·
03_classes_objects (fields, constructors, properties, init, static, access modifiers) ·
04_inheritance_polymorphism (virtual/override, abstract, sealed, base, upcasting) ·
05_interfaces (contracts, explicit implementation, default interface methods, composition over inheritance) ·
06_structs_records (value semantics, records, with-expressions, equality) ·
07_generics (constraints, variance in interfaces, generic methods) ·
08_collections (List/Dictionary/HashSet/Queue/Stack, IEnumerable vs ICollection, iterators/yield) ·
09_delegates_events_lambdas (Action/Func, events, closures) ·
10_linq_1 (Where/Select/OrderBy, deferred execution — the SQL callback lesson) ·
11_linq_2 (GroupBy/Join/Aggregate/SelectMany, method vs query syntax) ·
12_exceptions (try/catch/finally, custom exceptions, when to throw vs return, using/IDisposable) ·
13_async_await (Task, async/await, WhenAll, cancellation tokens, common deadlock/async-void pitfalls, pattern matching finale).

### 6.5 dotnet (10 + 3 interview)

00_hello_dojo (minimal API up + first endpoint + WebApplicationFactory gate tour) ·
01_routing_endpoints (route params, groups, results: Ok/NotFound/Created, TypedResults) ·
02_dependency_injection (lifetimes: singleton/scoped/transient — with a gate that catches captive dependencies; interfaces + registration) ·
03_middleware (pipeline order, custom middleware, short-circuiting) ·
04_configuration_options (appsettings, IOptions, environments) ·
05_efcore_basics (DbContext, migrations conceptually, CRUD against SQLite in-memory) ·
06_efcore_relationships (one-to-many/many-to-many, Include, projection, tracking vs no-tracking) ·
07_rest_crud (full resource: validation, status codes, DTOs vs entities) ·
08_errors_logging (ProblemDetails, exception middleware, ILogger) ·
09_auth_and_testing (JWT bearer basics, [Authorize], integration-testing an authed endpoint; capstone).

### 6.6 SQL interview part (existing track)

Two new lessons appended to `dojo/curriculum.py` as
"Part 9 — Interview prep": `53_interview_concepts`, `54_interview_drills`
(shape per §6.7, graded with the existing SQL gate machinery,
`shared_lesson_db`, correctness gates only — no perf gates).

### 6.7 Interview part (every track, the last part of its curriculum)

Three lessons, slugs `i1_interview_concepts`, `i2_interview_drills`,
`i3_interview_rapidfire` (SQL uses numeric slugs per §6.6, two lessons,
with rapid-fire folded into drills as review variants):

- **i1_interview_concepts** — the question bank. `reading.md` carries a
  comprehensive, organized Q&A bank: **50+ questions with model answers** for
  this track, each tagged ⭐ / ⭐⭐ / ⭐⭐⭐ by interview frequency, grouped by
  topic, cross-referenced to the lesson that teaches it ("weak here → redo
  06_generics_1"). Answers are written the way a strong candidate would
  actually say them: 3–6 sentences, one concrete example, the classic
  follow-up question named. README explains how to self-test (cover answers,
  say it out loud, then check). 3–4 graded exercises spot-check the concepts
  that can be checked in code (e.g. TS: "make this discriminated union
  exhaustive"; C#: "fix the async-void bug"; React: "fix the stale-closure
  counter"; Node: "predict this event-loop output"; .NET: "fix the captive
  dependency"; SQL: "the NOT IN NULL trap, cold").
- **i2_interview_drills** — 5–6 graded exercises replicating the classic
  hands-on tasks interviewers actually give for this stack, hardest-first
  ordering not required but each prompt written as an interviewer would say
  it, with a time-box suggestion. One challenge that is a real 45-minute-style
  task.
- **i3_interview_rapidfire** — 3–4 review-marked exercises (plus `review1`)
  covering the ⭐⭐⭐ concepts *again* in fresh form. **All interview lessons
  ship review variants**, so `dojo review` keeps resurfacing the most
  important material at 3→7→21→60 day intervals. This is the "repeat the most
  important ones" mechanism — the ladder does the repetition.

The concepts must be **full-stack interview real**: cover what actually gets
asked for mid-level full-stack roles (e.g. TS: `any` vs `unknown`, structural
typing, generics; React: reconciliation/keys, useEffect deps, memo; Node:
event loop, streams vs buffering, error handling; C#: value/reference,
IDisposable, async pitfalls; .NET: DI lifetimes, middleware order, EF
tracking; SQL: JOIN semantics, NULL traps, indexes, N+1).

## 7. Verify (non-negotiable, per track)

`dojo verify <track> [lesson]` for new tracks, mirroring `BUILD_SPEC.md` §13:

1. **Lint** (no toolchain needed): manifest ↔ lesson dirs agree; README
   exists and quotes each gate; reading.md has `## Notes` (≥25 words),
   per-exercise sections (≥25 words), `## Further reading` with ≥3 links
   (official docs: typescriptlang.org, react.dev, nodejs.org, learn.microsoft.com);
   hints.md has 2–3 tiers; every exercise has `.reference/`.
2. **Reference pass**: copy `.reference/` files over the learner files in a
   temp copy of the track tree (JS) or via a temp overlay + restore (C#/.NET:
   copy learner files aside, drop references in, run, restore in a finally),
   run the real gates: all must pass.
3. **Pristine fail**: with shipped stubs, every core/challenge/review gate
   must fail.
4. `DOJO_NO_PROGRESS=1` throughout. Exit nonzero on any failure; per-lesson table.

## 8. Quality bar

`BUILD_SPEC.md` §12 applies to every README (cold open → concept with a
worked example → exercises with exact file + command → the gate quoted
verbatim → the teaching point; second person; no bullet walls; worked
examples never solve the exercises). reading.md carries the theory and the
per-exercise "what this was really testing". Hints per §8 of BUILD_SPEC.
Cross-track callbacks are encouraged (LINQ ↔ SQL lesson 10/11; React keys ↔
SQL primary keys; TS unions ↔ SQL NULL three-valued logic).

## 9. Build order

- **T1 — Harness + scaffolds** (one agent): dojo/tracks.py, runners.py, CLI
  wiring, `tracks/` skeletons (package.json with pinned deps, vitest+ts
  configs, both .NET solutions building), per-track curriculum manifests
  (full slug lists from §6, so `dojo status` renders every track immediately),
  verify+doctor+setup, **one fully-working demo lesson in typescript
  (00_hello_dojo) and one in csharp (00_hello_dojo)** proving the whole loop
  (test/hint/read/status/next/verify) end-to-end. Harness unit tests for
  runners (parse fixtures) and track resolution. Acceptance: `dojo tracks`,
  `dojo status`, `dojo verify typescript`, `dojo verify csharp` all green;
  SQL behavior unchanged (`dojo test 01_select_basics ex1` still resolves).
- **T2 — Content** (six agents in parallel, one per track + one for SQL
  interview part): author every lesson in §6 for your track, including the
  interview part; run `dojo verify <track>` and iterate to green. Never touch
  files outside your track (SQL agent: only `lessons/53_*`, `lessons/54_*`,
  and the Part 9 entries in `dojo/curriculum.py`).
- **T3 — Integration** (orchestrator): full verify across tracks, README
  rewrite (course map for all tracks), `docs/interview-prep.md` cross-track
  index, commit.

## 10. Non-goals

No web UI, no accounts, no LLM calls at runtime, no bundlers/dev-servers for
the React track (jsdom only), no real databases for new tracks, no Docker for
new tracks, no cryptographic answer-hiding.
