# 11 — Async and modules

This is the last teaching lesson of the track, and it covers the two places
where your typed code meets the outside world: **time**, in the form of
promises and async iteration, and **module boundaries**, where somebody else's
JavaScript arrives with no types at all.

Neither topic is hard in the way lesson 09 was hard. What makes them worth a
lesson is that both are where sloppiness is invisible. `Promise<User>` and
`User` look almost the same in a signature and behave completely differently at
a call site. Two `await`s in a row look almost the same as `Promise.all` and are
twice as slow. A `.d.ts` file you wrote is a *claim* about code the compiler
never sees — and nothing will tell you when it stops being true.

The challenge is the track capstone: a typed, concurrency-limited task runner
that pulls in generics, discriminated unions, `unknown` in a `catch`, and
everything you know about promises.

## Concept — promises are a type, and so is a module

**An `async` function always returns a promise**, so its return type is always
`Promise<something>`:

```ts
async function loadUser(id: string): Promise<User> {
  const response = await fetch(`/users/${id}`);
  return response.json() as User;   // ...and lesson 10 has opinions about that cast
}
```

Inside the body you `return` a plain `User` and TypeScript wraps it. A `throw`
inside an async function becomes a *rejection* rather than a synchronous
exception — the same value, delivered down a different path, and the reason
`try`/`catch` around a call without `await` catches nothing.

`Awaited<T>` (lesson 08) unwraps the promise again, and `await` does it at
runtime.

**Concurrency is a typing question too.** These two are not the same program:

```ts
const a = await loadA();       // sequential: b starts when a is done
const b = await loadB();

const [a, b] = await Promise.all([loadA(), loadB()]);   // concurrent
```

`Promise.all` over a *tuple* of promises resolves to a tuple of their values, in
order, with each element's type preserved — a small masterpiece of type
modelling that you get for free. Its siblings are worth knowing by name:
`allSettled` (never rejects; gives you a per-item status), `race` (first to
settle, win or lose), `any` (first to *fulfil*).

**Async iteration** is for sequences that arrive over time — paginated APIs,
streams, queues:

```ts
async function* ticks(): AsyncGenerator<number> {
  yield 1;
  yield 2;
}

for await (const tick of ticks()) {
  console.log(tick);
}
```

`AsyncGenerator<T>` is what an `async function*` returns; `AsyncIterable<T>` is
the wider type to *accept*, because everything iterable-over-time is one.

**Modules and declaration files.** Every file with a top-level `import` or
`export` is a module with its own scope. When you import a JavaScript file that
has no types, TypeScript looks for a **declaration file** beside it —
`legacy.js` → `legacy.d.ts` — and uses that as the truth:

```ts
// legacy.d.ts - description only, no bodies, nothing emitted
export declare function slugify(title: string): string;
export declare const LEGACY_VERSION: string;
```

That is exactly what every `@types/*` package on npm is: a pile of `.d.ts` files
describing somebody else's JavaScript. Nothing verifies them against the
implementation — a `.d.ts` is a promise made by whoever wrote it.

Two smaller module details you will meet immediately. `import type { X } from
"./x"` imports a type and guarantees the import disappears at build time, which
matters under `isolatedModules` (on in this course) and avoids accidental
runtime dependencies. And module *resolution* — how `./legacy.js` becomes a file
on disk — is controlled by `moduleResolution`, set to `"bundler"` here, which is
why extensions are optional in your imports and why the `.js` extension in a
TypeScript import is not a typo but the ESM convention.

## Exercise 1 — a promise in the signature

Edit `ex1/solution.ts`. Make `loadLesson` asynchronous:

- `await loadLesson("04_unions_narrowing")` → `{ slug: "04_unions_narrowing",
  title: "Unions" }`
- `loadLesson("99_nope")` **rejects** with an `Error` whose message is exactly
  `unknown lesson: 99_nope`

The type gate checks the declared return type is `Promise<Lesson>` and that a
number is still not a slug.

```
uv run dojo test typescript 11_async_and_modules ex1
```

## Exercise 2 — two tasks, one wait

Edit `ex2/solution.ts`. Make `bothOf` generic and concurrent:

```ts
const [slow, fast] = await bothOf(
  async () => { await delay(30); return "slow-value"; },
  async () => { await delay(1);  return 42; },
);
// ["slow-value", 42] - argument order, not completion order
```

The gate records which task *finished* first, so an implementation that awaits
the first task before starting the second is detected and fails. The resolved
type must be the tuple `[A, B]`, not `unknown[]`.

```
uv run dojo test typescript 11_async_and_modules ex2
```

## Exercise 3 — async iteration

Edit `ex3/solution.ts`. Implement both halves:

- `pages(items, size)` is an async generator yielding chunks:
  `collect(pages(["a", "b", "c"], 2))` → `[["a", "b"], ["c"]]`
- an empty input yields nothing; a size bigger than the input yields one short
  page; a size below 1 yields nothing at all rather than looping forever
- `collect(source)` drains **any** async sequence into an array, keeping its
  element type

```
uv run dojo test typescript 11_async_and_modules ex3
```

## Exercise 4 — describe an untyped module

This exercise has **two** files to edit.

`ex4/legacy.js` is plain JavaScript that already works — do not change it. Open
it and read what it exports. Then:

1. Edit `ex4/legacy.d.ts` so it describes *both* exports. One is already there;
   the other is missing.
2. Edit `ex4/solution.ts` to import the missing one and implement
   `lessonSlug(index, title)`:
   - `lessonSlug(4, "Unions and Narrowing")` → `"04_unions_and_narrowing"`
   - `lessonSlug(11, "Async & Modules!")` → `"11_async_modules"`
   - `version` re-exports `LEGACY_VERSION`, which is `"1.4.2"`

The index is padded to two digits; the title is passed through `slugify`.

```
uv run dojo test typescript 11_async_and_modules ex4
```

## Challenge — the capstone: a typed task runner (hard)

Edit `challenge/solution.ts`. Finish `TaskResult<T>` and implement
`runTasks(tasks, limit)`:

1. Every task is a `() => Promise<T>`. The result array has **one entry per
   task, in input order**, regardless of which finished first.
2. Never more than `limit` tasks in flight at once — and it must genuinely run
   them in parallel, not one at a time.
3. A task that rejects becomes `{ ok: false, error: <message> }` and does **not**
   stop the others. Use the `Error`'s `message`; a thrown non-`Error` is
   stringified.
4. A `limit` below 1 (or not a whole number) rejects with an `Error` whose
   message is exactly `runTasks: limit must be at least 1`.

Honest difficulty note: this is the hardest exercise in the track. Rules 1 and 2
interact — the trick is a small pool of workers each pulling the next index — and
rule 3 needs lesson 02's `unknown` catch handling. Take the hints in order; they
are written for exactly this.

```
uv run dojo test typescript 11_async_and_modules challenge
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/11_async_and_modules. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { loadLesson } from "./ex1/solution";
import { bothOf } from "./ex2/solution";
import { collect, pages } from "./ex3/solution";
import { lessonSlug, version } from "./ex4/solution";
import { runTasks } from "./challenge/solution";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

describe("11_async_and_modules", () => {
  test("ex1 - loadLesson() resolves or rejects", async () => {
    await expect(
      loadLesson("04_unions_narrowing"),
      "a known slug resolves to its lesson object",
    ).resolves.toEqual({ slug: "04_unions_narrowing", title: "Unions" });
    await expect(
      loadLesson("99_nope"),
      "an unknown slug REJECTS with that exact message - it does not resolve to undefined",
    ).rejects.toThrow("unknown lesson: 99_nope");
  });

  test("ex2 - bothOf() runs its two tasks concurrently", async () => {
    const finished: string[] = [];
    const slow = async () => {
      await delay(30);
      finished.push("slow");
      return "slow-value";
    };
    const fast = async () => {
      await delay(1);
      finished.push("fast");
      return 42;
    };
    const result = await bothOf(slow, fast);
    expect(result, "the tuple is in ARGUMENT order, not completion order").toEqual([
      "slow-value",
      42,
    ]);
    expect(
      finished,
      "the fast task finished first, which only happens if both were started " +
        "before either was awaited - `await a(); await b();` fails here (README ex2)",
    ).toEqual(["fast", "slow"]);
  });

  test("ex3 - pages() yields chunks and collect() drains them", async () => {
    expect(
      await collect(pages(["a", "b", "c"], 2)),
      "three items in pages of two: [['a','b'], ['c']]",
    ).toEqual([["a", "b"], ["c"]]);
    expect(await collect(pages([], 2)), "no items means no pages at all").toEqual([]);
    expect(
      await collect(pages(["a", "b"], 5)),
      "a page bigger than the input yields one short page",
    ).toEqual([["a", "b"]]);
    expect(
      await collect(pages(["a"], 0)),
      "a page size below 1 yields nothing rather than looping forever",
    ).toEqual([]);
  });

  test("ex4 - lessonSlug() uses the module you described", async () => {
    expect(
      lessonSlug(4, "Unions and Narrowing"),
      "two digits, an underscore, then the slugified title",
    ).toBe("04_unions_and_narrowing");
    expect(lessonSlug(11, "Async & Modules!"), "punctuation collapses into single underscores").toBe(
      "11_async_modules",
    );
    expect(version, "the version constant comes straight from legacy.js").toBe("1.4.2");
  });

  test("challenge - runTasks() keeps order, limits concurrency, survives failures", async () => {
    let running = 0;
    let peak = 0;
    const task = (label: string, ms: number) => async () => {
      running += 1;
      peak = Math.max(peak, running);
      await delay(ms);
      running -= 1;
      return label;
    };
    const results = await runTasks(
      [task("a", 20), task("b", 5), task("c", 5), task("d", 1), task("e", 1)],
      2,
    );
    expect(
      results,
      "one result per task, in INPUT order, whatever order they finished in",
    ).toEqual([
      { ok: true, value: "a" },
      { ok: true, value: "b" },
      { ok: true, value: "c" },
      { ok: true, value: "d" },
      { ok: true, value: "e" },
    ]);
    expect(peak, "never more than `limit` tasks in flight at once").toBeLessThanOrEqual(2);
    expect(peak, "and it really did run them in parallel - a peak of 1 means sequential").toBe(2);

    const mixed = await runTasks(
      [
        async () => "fine",
        async () => {
          throw new Error("boom");
        },
        async () => {
          throw "just a string";
        },
      ],
      3,
    );
    expect(
      mixed,
      "a rejected task becomes a failure RESULT - the other tasks still finish, " +
        "and a thrown non-Error is stringified (README challenge)",
    ).toEqual([
      { ok: true, value: "fine" },
      { ok: false, error: "boom" },
      { ok: false, error: "just a string" },
    ]);

    await expect(
      runTasks([async () => "x"], 0),
      "a limit below 1 is a caller mistake: reject with that exact message",
    ).rejects.toThrow("runTasks: limit must be at least 1");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/11_async_and_modules. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { loadLesson } from "./ex1/solution";
import { bothOf } from "./ex2/solution";
import { collect, pages } from "./ex3/solution";
import { LEGACY_VERSION, slugify } from "./ex4/legacy.js";
import { lessonSlug } from "./ex4/solution";
import type { TaskResult } from "./challenge/solution";
import { runTasks } from "./challenge/solution";

describe("11_async_and_modules", () => {
  test("ex1 - loadLesson() is declared to return a promise", () => {
    expectTypeOf(loadLesson).returns.toEqualTypeOf<Promise<Lesson>>();
    // @ts-expect-error - a slug is a string.
    loadLesson(4);
  });

  test("ex2 - bothOf() resolves to a tuple of the two task results", () => {
    expectTypeOf(
      bothOf(
        () => Promise.resolve(1),
        () => Promise.resolve("x"),
      ),
    ).toEqualTypeOf<Promise<[number, string]>>();
    // @ts-expect-error - the tasks are functions returning promises, not promises.
    bothOf(Promise.resolve(1), Promise.resolve("x"));
  });

  test("ex3 - collect() keeps the element type of the sequence", () => {
    expectTypeOf(collect(pages(["a"], 1))).toEqualTypeOf<Promise<string[][]>>();
    async function numbers(): Promise<number[]> {
      return collect(
        (async function* () {
          yield 1;
        })(),
      );
    }
    expectTypeOf(numbers).returns.toEqualTypeOf<Promise<number[]>>();
  });

  test("ex4 - the declaration file describes both exports", () => {
    expectTypeOf(slugify).toEqualTypeOf<(title: string) => string>();
    expectTypeOf(LEGACY_VERSION).toEqualTypeOf<string>();
    expectTypeOf(lessonSlug).parameters.toEqualTypeOf<[index: number, title: string]>();
    // @ts-expect-error - slugify was declared to take a string.
    slugify(42);
  });

  test("challenge - TaskResult<T> narrows on ok", () => {
    function inspect(result: TaskResult<string>): void {
      if (result.ok) {
        expectTypeOf(result.value).toEqualTypeOf<string>();
      } else {
        expectTypeOf(result.error).toEqualTypeOf<string>();
      }
    }
    inspect({ ok: true, value: "x" });
    expectTypeOf(runTasks([async () => 1], 2)).toEqualTypeOf<Promise<TaskResult<number>[]>>();
  });
});
```

In plain English:

- **ex1** awaits a resolution and a rejection (note `.resolves` and `.rejects` —
  and note the `await` in front of each `expect`, without which a failure is
  silently swallowed). The type gate pins the return type to `Promise<Lesson>`.
- **ex2** checks the tuple's contents *and* the order in which the two tasks
  finished, which is how it detects a sequential implementation.
- **ex3** checks four chunkings including both degenerate cases, and the type
  gate proves `collect` is generic by feeding it a different element type.
- **ex4** checks two slugs and the re-exported version; the type gate reads the
  declaration file directly and requires `slugify(42)` to be an error.
- **challenge** checks the ordering, the concurrency peak (both that it never
  exceeds the limit *and* that it reaches it), the mixed success/failure run, and
  the bad-limit rejection.

## The teaching point

Two habits close out the track.

The first is treating `Promise<T>` as a real part of a signature rather than an
implementation detail. The most common async bug in TypeScript is a forgotten
`await`, which turns a `User` into a `Promise<User>` — and the compiler *will*
catch it, if your return types are annotated. The second most common is
accidental sequencing: two awaited calls that had no reason to wait for each
other. Neither is exotic, and both are cheap to avoid once you are reading the
types.

The second is respecting the boundary. A `.d.ts` file, a cast on a `fetch`
result, an `any` from an untyped library — each is a place where the compiler
stops checking and starts trusting you. That is not a flaw in TypeScript; it is
the deal. The professional habit is to make those places few, obvious, and
narrow: one validated entry point per boundary, and real types everywhere
inside.

Next: the interview part. **i1_interview_concepts** is a 50-question bank with
model answers, **i2_interview_drills** puts you in the chair for six timed
tasks, and **i3_interview_rapidfire** brings the highest-frequency concepts back
one more time — and keeps bringing them back through `dojo review`.
