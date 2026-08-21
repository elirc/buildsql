# Authoring a JavaScript-track lesson (typescript · node · react)

Read `BUILD_SPEC.md` §7 (exercise anatomy), §8 (hints) and §12 (quality bar)
first — they apply verbatim. This file covers only what is specific to the
three vitest-graded tracks. The .NET tracks have their own guides at
`tracks/csharp/AUTHORING.md` and `tracks/dotnet/AUTHORING.md`.

`tracks/typescript/lessons/00_hello_dojo/` is the worked example. Copy its
shape.

## File layout

Unlike the .NET tracks, everything for a lesson lives in one directory —
prose, gates and code together, because that is where the bundler wants them:

```
tracks/typescript/lessons/04_unions_narrowing/
├── README.md
├── reading.md
├── gate.test.ts        runtime gate  (react: gate.test.tsx)
├── gate.test-d.ts      type gate     (typescript track only, optional)
├── ex1/
│   ├── solution.ts     learner stub - compiles, fails the gate
│   ├── hints.md        ## Hint 1 / ## Hint 2 / ## Hint 3
│   └── .reference/solution.ts
├── ex2/  ex3/  challenge/  review1/    (same shape)
```

One `npm install`, at `tracks/`, serves all three tracks; each track dir has
only a `tsconfig.json` and a `vitest.config.ts`. Node resolution walks up from
the track dir into `tracks/node_modules`, so nothing else needs configuring.

## How gates reach the learner's code

A relative import at the top of the gate file, no extension:

```ts
import { describe, expect, test } from "vitest";

import { parseEvent } from "./ex1/solution";
```

Vite resolves `./ex1/solution` to `solution.ts` (or `.tsx`), and
`moduleResolution: "bundler"` in `tracks/tsconfig.base.json` means `tsc` agrees.

## Test naming — load-bearing

Every test title **must start with the exercise directory name**, followed by
a non-alphanumeric character:

```ts
test("ex2 - narrows the union before touching .radius", () => { ... });
test("challenge - handles the empty case", () => { ... });
test("review1 - the same idea, a different shape", () => { ... });
```

`dojo test typescript 04 ex2` becomes `vitest -t "ex2"`, and the harness maps
vitest's JSON report back to an exercise by lowercasing each title and
matching `ex\d+|challenge|review\d+` at the front. `ex2 - ...` works;
`ex2narrows` does not. Wrap the tests in one `describe(<slug>)` for readable
output.

If an exercise dir appears in more than one gate file (a runtime gate *and* a
type gate), the results are ANDed: every gate for that exercise must pass.

## Assertions that teach

vitest's `expect` takes a message as its second argument. Use it on every
assertion — it is the one line the learner reads first:

```ts
expect(
  area(shape),
  "the discriminant has to be checked before .radius is read - reread README ex2",
).toBe(12.56);
```

Per BUILD_SPEC §12: say which check failed, what the evidence means, and which
section to reread. vitest supplies the diff; you supply the sentence.

## Type gates (typescript track)

`tracks/typescript/vitest.config.ts` has `typecheck.enabled`, with
`typecheck.include` set to `lessons/**/gate.test-d.ts`. Put `expectTypeOf`
assertions and `@ts-expect-error` probes there:

```ts
import { describe, expectTypeOf, test } from "vitest";

import { pick } from "./ex3/solution";

describe("08_utility_types", () => {
  test("ex3 - pick() preserves the value types", () => {
    expectTypeOf(pick({ a: 1, b: "x" }, ["a"])).toEqualTypeOf<{ a: number }>();
    // @ts-expect-error - "c" is not a key of the object
    pick({ a: 1 }, ["c"]);
  });
});
```

`@ts-expect-error` is an assertion in reverse: it passes only if the next line
*fails* to compile, which is how you prove a type is still narrow.

Two things to know and to warn learners about in the README:

- `tsc` checks a whole file at once, so an unfinished ex3 surfaces its type
  error even on a run filtered to `ex1`. The per-exercise verdict line printed
  by `dojo test` is still exact.
- A stub must still *compile*. The idiom is a body that throws, which infers
  `never` and satisfies any annotation — and, when the exercise is about the
  return type, deliberately leaves the annotation off so the type gate has
  something to catch.

## React gates

`environment: "jsdom"`, `@testing-library/react`, and `vitest.setup.ts` already
registers jest-dom's matchers and an `afterEach(cleanup)`. Assert on the
accessible DOM — roles, labels, visible text — never on props, state or
implementation:

```tsx
render(<Counter />);
await userEvent.click(screen.getByRole("button", { name: /increment/i }));
expect(
  screen.getByRole("status"),
  "the count shown to the user should be 1 after one click - reread README ex1",
).toHaveTextContent("1");
```

Learner components live at `exN/solution.tsx` and default- or named-export a
component. There is no dev server and no bundler in this course: jsdom only.

## Node gates

`environment: "node"`, real Node APIs. `supertest` and `express@5` are
installed for the HTTP lessons — the learner exports the app, the gate drives
it:

```ts
import request from "supertest";
import { app } from "./ex1/solution";

const response = await request(app).get("/orders/1");
expect(response.status, "...").toBe(200);
```

Use temp directories from `node:os`/`node:fs` for the fs lessons and clean up
in `afterEach`; never write inside the repo.

## Stubs

A stub must **compile** and must **fail** its gate:

```ts
// 04_unions_narrowing / ex1 - <one line>.
// See lessons/04_unions_narrowing/README.md, "Exercise 1".

export function area(shape: Shape): number {
  throw new Error("ex1: area() is not implemented yet - edit this file.");
}
```

## `.reference/` and how verify works

`exN/.reference/solution.ts` mirrors the learner file of the same name in
`exN/`. `dojo verify <track> <slug>` backs the learner files up to a temp dir,
copies the references over them, runs the real gates (all must pass), restores
the stubs in a `finally` — with an `atexit` hook armed so even a crash puts
the tree back — and reruns the gates with the stubs (all must fail).

## Prose requirements (lint-enforced)

- `README.md` must quote **every** test declaration line verbatim. In practice:
  paste each whole gate file into a fenced ```ts block.
- `reading.md` needs `## Notes` (≥25 words), one `## exN` section per manifest
  exercise (≥25 words each, including `challenge` / `review1` where they
  exist), and `## Further reading` with **≥3 links** — prefer
  `typescriptlang.org`, `react.dev`, `nodejs.org`, `developer.mozilla.org`.
- Every exercise dir needs `hints.md` with exactly 2 or 3 `## Hint N` sections.
  Hint 3 must still leave one decision to the learner.
- Every exercise dir needs a non-empty `.reference/`.

## Updating the manifest

`tracks/<track>/curriculum.py` is the contract `dojo status` renders and
`dojo verify` lints. Change the exercise count there in the same commit as the
directory, or verify fails with "manifest exercise 'ex4' has no directory".

## Running it

```
uv run dojo test typescript 04_unions_narrowing        # whole lesson
uv run dojo test ts 04 ex2                             # one exercise, aliases
uv run dojo verify typescript 04_unions_narrowing      # lint + reference + pristine
uv run dojo verify typescript                          # every authored lesson
uv run dojo setup typescript                           # npm install in tracks/
```

Verify sets `DOJO_NO_PROGRESS=1` for you. When you run `dojo test` by hand
while authoring, set it yourself so you do not pollute the learner's
`data/progress.json`.
