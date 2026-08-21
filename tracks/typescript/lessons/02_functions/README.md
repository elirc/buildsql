# 02 — Functions

A function signature is the smallest contract in your codebase and the one you
write most often. Every argument you accept is a promise about what callers may
send; every return type is a promise about what they get back. Lesson 01 was
about the types of values. This one is about the types of the things that move
values around.

JavaScript is unusually permissive here — call a three-parameter function with
one argument and it hands you `undefined` for the rest, call it with nine and it
ignores the extras. TypeScript takes those same runtime rules and makes you say
which of them you meant: this parameter is optional, that one has a default,
this function takes any number of scores, that one takes a callback and ignores
whatever the callback returns.

By the end of this lesson one of your functions will have two signatures at
once, which is the moment TypeScript stops looking like "JavaScript with
annotations" and starts looking like a type system with opinions.

## Concept — the four shapes of a parameter list

**Optional and default.** A parameter with `?` may be omitted, and is
`T | undefined` inside the body. A parameter with a default may also be
omitted, and is just `T` inside the body, because the default filled it in:

```ts
function heading(title: string, level?: number) {
  //  level: number | undefined  - you must handle the undefined case
}

function heading2(title: string, level = 1) {
  //  level: number  - inference read the default, and the call site sees level?: number
}
```

Both are optional at the call site. Only one of them saves you from writing
`level ?? 1` in the body, and it also documents the fallback in the signature
where readers look first. Note what you do *not* write: `level: number = 1` is
legal but redundant, because `1` is already a `number`.

**Rest.** One parameter, any number of arguments, collected into an array:

```ts
function join(separator: string, ...parts: string[]): string {
  return parts.join(separator);
}

join("-", "a", "b", "c");     // "a-b-c"
join("-", ...["a", "b"]);     // spreading works too
```

A rest parameter has to come last, and there can only be one of them.

**Callbacks.** A function type is written as an arrow with no body, and it is
just another type — you can put it in a parameter list, an alias, or an array:

```ts
type Visitor = (name: string, index: number) => void;
```

`void` as a return type deserves a paragraph of its own, because it does *not*
mean "returns `undefined`". It means "I will ignore whatever you return", so a
callback returning a number is perfectly assignable to a `=> void` type. That
is why `names.forEach((n) => list.push(n))` compiles even though `push` returns
the new length. If `void` meant `undefined`, half the JavaScript you have ever
written would stop typechecking.

**Overloads.** Sometimes one function genuinely has two contracts, and the
return type depends on which one you used. Declare the signatures, then one
implementation:

```ts
function unwrap(value: string): string[];
function unwrap(value: number): number[];
function unwrap(value: string | number): string[] | number[] {
  return typeof value === "string" ? [...value] : [value];
}

unwrap("hi");   // string[]
unwrap(7);      // number[]
```

The implementation signature is invisible to callers — only the two overloads
above it exist as far as the outside world is concerned — and it has to be
loose enough to cover both. That is your first sight of a **union type**,
`string | number`: a value that is one thing or the other. Lesson 04 is
entirely about them; for now, `typeof value === "string"` inside the body is
enough to tell the compiler which one you have.

Last piece of vocabulary: **`never`**, the return type of a function that never
returns normally.

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

Annotating it `never` rather than `void` is not decoration. It tells the
compiler that any code path calling `fail(...)` ends there, which is how a
`string`-returning function can call it in a guard clause without TypeScript
complaining that the function might fall through.

## Exercise 1 — a default the caller can override

Edit `ex1/solution.ts`. Implement `progressLine(done, total)`, which renders a
one-line progress summary:

- `progressLine(3)` → `"3/12 (25%)"` — twelve is the default lesson count
- `progressLine(1, 3)` → `"1/3 (33%)"`
- `progressLine(2, 3)` → `"2/3 (67%)"`
- `progressLine(0, 5)` → `"0/5 (0%)"`

The percentage is `done / total` as a percentage, rounded to the nearest whole
number. The stub declares `total` as required; the gate calls the function with
one argument, so that has to change. The type gate checks that `total` ends up
*optional*, not that you deleted it.

```
uv run dojo test typescript 02_functions ex1
```

## Exercise 2 — as many scores as you like

Edit `ex2/solution.ts`. Implement `bestOf(...scores)`, returning the highest
score it was given:

- `bestOf(4, 9, 2)` → `9`
- `bestOf(5)` → `5`
- `bestOf()` → `0` — no scores yet, so no progress yet
- `bestOf(...[1, 8, 3])` → `8`

Scores in this course are never negative, which is what makes `0` a sensible
answer for the empty call. The stub takes an *array*; the gate passes separate
arguments. One character of syntax stands between those two worlds.

```
uv run dojo test typescript 02_functions ex2
```

## Exercise 3 — a function that takes a function

Edit `ex3/solution.ts`. Implement `forEachTrack(names, visit)`, which calls
`visit` once per name, in order, passing the name and its index:

- `forEachTrack(["typescript", "node", "react"], cb)` calls `cb("typescript", 0)`,
  then `cb("node", 1)`, then `cb("react", 2)`
- an empty list never calls `visit` at all
- `forEachTrack` itself returns nothing

The stub's callback type accepts a name only. Widen it. Do not reach for
`names.forEach(visit)` without reading what that hands your callback as a third
argument — the gate does not care, but a reviewer will.

```
uv run dojo test typescript 02_functions ex3
```

## Exercise 4 — one name, two signatures

Edit `ex4/solution.ts`. Implement `duplicate(value)` so that:

- `duplicate("ab")` → `"abab"` (a `string`)
- `duplicate("")` → `""`
- `duplicate(2)` → `4` (a `number`)
- `duplicate(0)` → `0`

And so that `duplicate("ab")` is *typed* `string` while `duplicate(2)` is typed
`number`. A single signature returning `string | number` would pass the runtime
gate and fail the type gate, which is the entire point of the exercise: callers
should not have to narrow a result whose type you already know.

Booleans have no `duplicate`, and the type gate proves it.

```
uv run dojo test typescript 02_functions ex4
```

## Challenge — retry (moderate)

Edit `challenge/solution.ts`. Implement `retry(attempts, action)`:

- it calls `action()` and returns its result the first time it does not throw
- if `action` throws, it tries again, up to `attempts` times in total
- if every attempt throws, it rethrows the error from the **last** attempt
- if `attempts` is less than 1, it throws an `Error` whose message is exactly
  `retry: attempts must be at least 1`

The gate counts calls, so an off-by-one is visible immediately. Honest
difficulty note: the loop is short, but `useUnknownInCatchVariables` is on in
this course, so the caught value is `unknown` — store it and rethrow it as-is
rather than assuming it is an `Error`.

```
uv run dojo test typescript 02_functions challenge
```

## Review — padCell

Edit `review1/solution.ts`. Implement `padCell(text, width, filler)`, padding
`text` on the right until it is `width` characters wide:

- `padCell("hi")` → `"hi......"` (width `8`, filler `"."`)
- `padCell("hi", 5)` → `"hi..."`
- `padCell("hi", 5, "-")` → `"hi---"`
- `padCell("overlong", 4)` → `"overlong"` — never truncate

```
uv run dojo test typescript 02_functions review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/02_functions. Quoted verbatim in README.md.
import { describe, expect, test, vi } from "vitest";

import { progressLine } from "./ex1/solution";
import { bestOf } from "./ex2/solution";
import { forEachTrack } from "./ex3/solution";
import { duplicate } from "./ex4/solution";
import { retry } from "./challenge/solution";
import { padCell } from "./review1/solution";

describe("02_functions", () => {
  test("ex1 - progressLine() defaults the total to 12", () => {
    expect(
      progressLine(3),
      "called with one argument, total has to fall back to 12: '3/12 (25%)'",
    ).toBe("3/12 (25%)");
    expect(
      progressLine(1, 3),
      "a third is 33%, not 33.333 and not 34 - Math.round, applied once",
    ).toBe("1/3 (33%)");
    expect(
      progressLine(2, 3),
      "two thirds rounds up to 67% - proof you rounded rather than truncated",
    ).toBe("2/3 (67%)");
    expect(progressLine(0, 5), "zero done is 0%, not NaN%").toBe("0/5 (0%)");
  });

  test("ex2 - bestOf() takes its scores as separate arguments", () => {
    expect(
      bestOf(4, 9, 2),
      "bestOf(4, 9, 2) is 9 - a rest parameter, not an array parameter",
    ).toBe(9);
    expect(bestOf(5), "one argument still works: the best of [5] is 5").toBe(5);
    expect(
      bestOf(),
      "no arguments at all means no scores yet, and the agreed answer is 0",
    ).toBe(0);
    expect(
      bestOf(...[1, 8, 3]),
      "spreading an array into a rest parameter is the same call - 8",
    ).toBe(8);
  });

  test("ex3 - forEachTrack() hands the callback a name and an index", () => {
    const seen: string[] = [];
    forEachTrack(["typescript", "node", "react"], (name, index) => {
      seen.push(`${index}:${name}`);
    });
    expect(
      seen,
      "the callback is called once per name, in order, with the index second",
    ).toEqual(["0:typescript", "1:node", "2:react"]);

    const visit = vi.fn();
    forEachTrack([], visit);
    expect(visit, "an empty list means the callback is never called").not.toHaveBeenCalled();
    expect(
      forEachTrack(["x"], () => {}),
      "forEachTrack returns nothing at all - its job is the side effect",
    ).toBeUndefined();
  });

  test("ex4 - duplicate() doubles a number and repeats a string", () => {
    expect(duplicate("ab"), 'duplicate("ab") concatenates: "abab"').toBe("abab");
    expect(duplicate(""), "an empty string duplicates to an empty string").toBe("");
    expect(duplicate(2), "duplicate(2) multiplies: 4, the number, not the string '22'").toBe(4);
    expect(duplicate(0), "0 doubled is 0 - check your branch, not your falsiness").toBe(0);
  });

  test("challenge - retry() re-runs a flaky action and gives up honestly", () => {
    let calls = 0;
    const flaky = () => {
      calls += 1;
      if (calls < 3) {
        throw new Error(`attempt ${calls} failed`);
      }
      return "ok";
    };
    expect(retry(5, flaky), "the third attempt succeeds, so retry returns 'ok'").toBe("ok");
    expect(calls, "retry stops as soon as the action succeeds - three calls, not five").toBe(3);

    let always = 0;
    expect(
      () =>
        retry(3, () => {
          always += 1;
          throw new Error(`boom ${always}`);
        }),
      "when every attempt fails, rethrow the LAST error rather than a new one",
    ).toThrow("boom 3");
    expect(always, "three attempts means the action ran exactly three times").toBe(3);

    expect(
      () => retry(0, () => "never"),
      "zero attempts is a caller mistake: throw with that exact message",
    ).toThrow("retry: attempts must be at least 1");
  });

  test("review1 - padCell() pads to a width with a filler", () => {
    expect(padCell("hi"), "the defaults are width 8 and filler '.'").toBe("hi......");
    expect(padCell("hi", 5), "one override, one default: 'hi...'").toBe("hi...");
    expect(padCell("hi", 5, "-"), "both overridden: 'hi---'").toBe("hi---");
    expect(
      padCell("overlong", 4),
      "text at least as wide as the cell comes back untouched - no truncation",
    ).toBe("overlong");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/02_functions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { progressLine } from "./ex1/solution";
import { bestOf } from "./ex2/solution";
import { forEachTrack } from "./ex3/solution";
import { duplicate } from "./ex4/solution";
import { retry } from "./challenge/solution";
import { padCell } from "./review1/solution";

describe("02_functions", () => {
  test("ex1 - progressLine() has an optional second parameter", () => {
    expectTypeOf(progressLine).parameters.toEqualTypeOf<[done: number, total?: number]>();
    expectTypeOf(progressLine).returns.toEqualTypeOf<string>();
  });

  test("ex2 - bestOf() is variadic", () => {
    expectTypeOf(bestOf(1, 2, 3)).toEqualTypeOf<number>();
    expectTypeOf(bestOf()).toEqualTypeOf<number>();
    // @ts-expect-error - every argument is a score, so a string is not one.
    bestOf(1, "2");
  });

  test("ex3 - forEachTrack() hands its callback (name, index)", () => {
    const seen: string[] = [];
    forEachTrack(["a"], (name, index) => {
      expectTypeOf(name).toEqualTypeOf<string>();
      expectTypeOf(index).toEqualTypeOf<number>();
    });
    // A `=> void` callback may return anything; push returns a number and that
    // is still assignable. This line has to compile.
    forEachTrack(["a"], (name) => seen.push(name));
    expectTypeOf(forEachTrack).returns.toEqualTypeOf<void>();
    // @ts-expect-error - the first callback parameter is a name, not a number.
    forEachTrack(["a"], (n: number) => String(n));
  });

  test("ex4 - duplicate() keeps the argument type", () => {
    expectTypeOf(duplicate("ab")).toEqualTypeOf<string>();
    expectTypeOf(duplicate(2)).toEqualTypeOf<number>();
    // @ts-expect-error - only strings and numbers have an overload.
    duplicate(true);
  });

  test("challenge - retry() is (number, () => string) => string", () => {
    expectTypeOf(retry).parameters.toEqualTypeOf<[attempts: number, action: () => string]>();
    expectTypeOf(retry).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the action has to produce the string retry returns.
    retry(1, () => 42);
  });

  test("review1 - padCell() has two optional parameters", () => {
    expectTypeOf(padCell).parameters.toEqualTypeOf<
      [text: string, width?: number, filler?: string]
    >();
  });
});
```

In plain English:

- **ex1** checks four rendered lines, then asserts your parameter list is
  `[done: number, total?: number]` — a required `total` fails even if every
  string is right.
- **ex2** calls `bestOf` with three arguments, one, none, and a spread. The type
  gate's `@ts-expect-error` proves a stray `"2"` is still rejected.
- **ex3** records what your callback was handed, checks an empty list calls
  nothing, and checks the return is `undefined`. The type gate reads the
  callback's parameter types from inside the callback, and includes the
  `=> void` assignability line that must compile.
- **ex4** checks values for both overloads, then insists
  `duplicate("ab")` is exactly `string` and `duplicate(2)` is exactly `number`.
- **challenge** counts attempts, checks the rethrown error is the last one
  (`boom 3`, not `boom 1`), and checks the guard message character for
  character.
- **review1** pads with zero, one and two overrides, and refuses to truncate.

## The teaching point

The signature is where you spend your design budget. Every function in this
lesson had a version that would have "worked" — `bestOf(scores: number[])`,
`duplicate(value: string | number): string | number`, `progressLine(done, total)`
with no default — and every one of those versions pushes work onto callers.
Optional parameters remove an argument from a hundred call sites. Overloads
remove a narrowing step from every caller. A `readonly` array parameter removes
a defensive copy.

The mirror image is worth stating too: signatures are the hardest thing to
change later, because every caller depends on them. That is the real argument
for annotating exported return types by hand — not because inference is wrong,
but because an inferred public contract can be changed by an innocent edit to a
function body, and nobody will notice until a build breaks somewhere else.

Next: **03_objects_interfaces**, where types stop being about single values and
start describing the shapes your program actually passes around.
