# IPSKILL content authoring spec (expansion volumes)

You are writing new curriculum sectors ("lessons") for an existing learning app.
Everything you write is *prose the learner reads* and *exercises they solve*. It
must match the voice and depth of the existing packs. Read real examples first
(see "Ground yourself in the style" below) — do not guess the style.

## Where your output goes

Write exactly ONE file: `content-src/<volume>/<name>.json` (path given in your task).

Shape:

```json
{
  "track": "<track id>",
  "lessons": [ Lesson, Lesson, ... ]
}
```

`Lesson`:

```json
{
  "slug": "v3a01_window_frames",
  "title": "V3·A1 — Window frames and running totals",
  "summary": "<180-320 chars of plain prose, no markdown headers>",
  "briefing": "<markdown, 900-1800 words>",
  "explanation": "<markdown, 900-1600 words>",
  "fullReadme": "<markdown, 1200-2500 words>",
  "fullReading": "<markdown, 1200-2500 words>",
  "exercises": [ Mission, ... ]
}
```

Do NOT set `id` or `order` — the merge script assigns them from `slug`.
Slugs must be unique across the whole app: prefix every slug with the unique
prefix given in your task (e.g. `v3a`), then a two-digit number, then a short
topic, e.g. `v3a01_window_frames`.

`Mission`:

```json
{
  "id": "ex1",
  "title": "Ex1",
  "kind": "core",
  "prompt": "<markdown>",
  "hints": "<markdown, 3 escalating hints>",
  "importantHints": "<markdown, 3 escalating hints, different angle from `hints`>",
  "references": { "solution.ts": "<complete working reference solution>" },
  "xp": 100
}
```

Mission rules (the validator enforces these):

- Every lesson has 8 `core` missions with ids `ex1`..`ex8`, titles `Ex1`..`Ex8`, xp `100`.
- Then exactly 1 `challenge` mission: id `challenge`, title `Challenge`, xp `250`.
- Then exactly 1 `review` mission: id `review1`, title `Review 1`, xp `140`.
- 10 missions per lesson, in that order.
- `prompt`, `hints`, `importantHints` are non-empty markdown; `references` has at
  least one non-empty entry.

## Reference-answer file names by track

- `sql` → `solution.sql` (add `expected.sql` when the exercise has a result set)
- `typescript`, `node` → `solution.ts`
- `react` → `solution.tsx`
- `csharp`, `dotnet` → `Ex1.cs` … `Ex8.cs`, `Challenge.cs`, `Review1.cs` (match the mission)

## Ground yourself in the style (do this first, once)

```bash
node -e "
const p=JSON.parse(require('fs').readFileSync('public/content/<TRACK>.json','utf8'));
const l=p.lessons[4];
console.log(l.briefing); console.log('=== EXPLANATION'); console.log(l.explanation);
console.log('=== README'); console.log(l.fullReadme.slice(0,6000));
console.log('=== READING'); console.log(l.fullReading.slice(0,4000));
const c=l.exercises.find(e=>e.kind==='core');
console.log('=== PROMPT'); console.log(c.prompt);
console.log('=== HINTS'); console.log(c.hints);
console.log('=== IMPORTANT'); console.log(c.importantHints);
console.log('=== REF'); console.log(Object.values(c.references)[0]);
"
```

## Voice and quality bar (non-negotiable)

- Second person, calm, technical, opinionated where it helps. No hype, no emoji,
  no "In this lesson we will learn". Start where a working engineer starts:
  the problem, then the mechanism, then the trap.
- Markdown hard-wrapped around 78 columns.
- `briefing` opens with `# <title>` and motivates the topic, connecting to what a
  previous sector taught. `explanation` opens with `# Reading - <track>/<slug>`
  and is note-shaped: bolded lead-ins per idea, real mechanism, edge cases.
- `fullReadme` is the deep archive version: concepts, worked examples with code
  fences, common mistakes, an interview-answer angle, and a short "check
  yourself" question bank (8-15 prompts).
- `fullReading` is the long-form essay: how the feature actually works
  underneath, historical/API context, performance notes, and when NOT to use it.
- Exercise prompts state the file to edit, the exact function/query signature,
  concrete input → expected output examples, and end with a fenced run command
  in the existing packs' style. Difficulty rises across ex1..ex8; the challenge
  combines two or three ideas; the review mission re-tests the sector's ideas
  from a different angle.
- `hints` = 3 escalating hints (`## Hint 1/2/3`): first reframes the problem,
  second shows a related but non-identical snippet, third narrates the shape of
  the answer while leaving a decision to the learner. `importantHints` is a
  second, *different* escalation — a different entry point, not a paraphrase.
- Reference answers must be complete, correct, idiomatic and runnable, with a
  one-line header comment naming the sector and mission.
- No filler, no repetition across lessons, no "TODO", no placeholder text.
  Every exercise must be genuinely different from every other one you write.

## Writing the file

Write the JSON with a script rather than by hand-escaping: put each lesson's
prose in heredoc files under a scratch dir and assemble with node, or build a
`.mjs` that holds the strings as template literals and writes JSON. Validate at
the end:

```bash
node -e "const d=JSON.parse(require('fs').readFileSync('<your file>','utf8'));
console.log(d.track, d.lessons.length, d.lessons.map(l=>l.exercises.length).join(','));"
```

Every lesson you deliver must be complete. Fewer complete lessons beats more
half-written ones — but the target in your task is the goal, so pace yourself.
