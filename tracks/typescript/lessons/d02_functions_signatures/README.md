# d02 - Function signatures (drill set)

Eight problems on the shape of a function rather than its body - optional
parameters, defaults, rest parameters, callback types, overloads and functions
that return functions. They drill lesson **02_functions**; redo it first if the
difference between an optional parameter and a defaulted one is not automatic.

Several stubs ship with a signature that is subtly too loose. The type gate is
what marks those, so read the assertions in `gate.test-d.ts` as part of the
prompt.

## ex1 - a shelf label

`shelfLabel(title, author?)` returns `"<title> - <author>"`, or just the title
when there is no author. An author that is empty or only whitespace counts as
no author.

- `shelfLabel("Dune")` -> `"Dune"`
- `shelfLabel("Dune", "Herbert")` -> `"Dune - Herbert"`
- `shelfLabel("Dune", "   ")` -> `"Dune"`

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex1
```

## ex2 - join a path

`joinPath(...segments)` joins any number of segments with `/`. Each segment is
stripped of leading and trailing slashes first, and a segment that is then
empty is dropped entirely.

- `joinPath("books", "sci-fi", "dune")` -> `"books/sci-fi/dune"`
- `joinPath("/books/", "/dune/")` -> `"books/dune"`
- `joinPath("books", "", "dune")` -> `"books/dune"`
- `joinPath()` -> `""`

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex2
```

## ex3 - count what matches

`countMatching(values, keep)` returns how many values the predicate accepted.
The predicate is called exactly once per value, in order.

- `countMatching(["a", "bb", "ccc"], (v) => v.length > 1)` -> `2`
- `countMatching([], () => true)` -> `0`

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex3
```

## ex4 - a named formatter type, with a default

Declare `Formatter`, the type of a function from a number to a string. Then
`formatAll(values, format?)` maps every value through it, defaulting to two
decimal places.

- `formatAll([1, 2.5])` -> `["1.00", "2.50"]`
- ``formatAll([1, 2], (v) => `#${v}`)`` -> `["#1", "#2"]`

Edit `ex4/solution.ts`. The shipped `Formatter` returns `unknown` - tighten it.

```
uv run dojo test typescript d02_functions_signatures ex4
```

## ex5 - one function, two contracts

`normaliseTag` takes a tag and returns a normalised tag; take an **array** of
tags and it returns an array. Normalising means trim, lower-case, and collapse
each run of inner whitespace into a single dash.

- `normaliseTag("  Science Fiction ")` -> `"science-fiction"`
- `normaliseTag(["A B", " C "])` -> `["a-b", "c"]`

A single signature returning `string | string[]` compiles and fails the type
gate: callers would have to narrow a result they already know the shape of.
Write **overload signatures**.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex5
```

## ex6 - a counter that owns its state

`makeCounter(start?)` returns a `Counter` with three methods: `next()` hands out
the current number and advances, `peek()` shows the next number without
advancing, `reset()` returns to the start this counter was made with. The
default start is `0`.

Two counters must not share state.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex6
```

## ex7 - build a query string

`buildQuery(base, params?)` appends a query string to `base`. Keys are sorted
alphabetically, both keys and values are URL-encoded, and no params (or an empty
object) means the base is returned unchanged.

- `buildQuery("/books", { year: 1965, author: "Herbert" })` -> `"/books?author=Herbert&year=1965"`
- `buildQuery("/books", { q: "dune messiah" })` -> `"/books?q=dune%20messiah"`
- `buildQuery("/books", { draft: false })` -> `"/books?draft=false"`

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d02_functions_signatures ex7
```

## ex8 - a middleware chain

Declare `Middleware`: a function taking the current value **and** `next`, the
rest of the chain, and returning a value. Then `runMiddleware(input, middleware)`
runs them as an onion - the first entry is the outermost, and a middleware that
never calls `next` short-circuits everything after it.

With `upper = (v, next) => next(v.toUpperCase())` and
`exclaim = (v, next) => next(v) + "!"`:

- `runMiddleware("a", [])` -> `"a"`
- `runMiddleware("a", [upper, exclaim])` -> `"A!"`

Edit `ex8/solution.ts`. The shipped `Middleware` has no `next` parameter at all.

```
uv run dojo test typescript d02_functions_signatures ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d02_functions_signatures. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { shelfLabel } from "./ex1/solution";
import { joinPath } from "./ex2/solution";
import { countMatching } from "./ex3/solution";
import { formatAll } from "./ex4/solution";
import { normaliseTag } from "./ex5/solution";
import { makeCounter } from "./ex6/solution";
import { buildQuery } from "./ex7/solution";
import { runMiddleware } from "./ex8/solution";

describe("d02_functions_signatures", () => {
  test("ex1 - shelfLabel() treats the author as optional", () => {
    expect(
      shelfLabel("Dune"),
      "one argument means no author, so the label is just the title",
    ).toBe("Dune");
    expect(shelfLabel("Dune", "Herbert"), "two arguments join with a spaced dash").toBe(
      "Dune - Herbert",
    );
    expect(
      shelfLabel("Dune", ""),
      "an empty author is no author - a truthiness check covers both cases",
    ).toBe("Dune");
    expect(
      shelfLabel("Dune", "   "),
      "and so is an author made only of spaces (README ex1)",
    ).toBe("Dune");
  });

  test("ex2 - joinPath() is variadic and drops empty segments", () => {
    expect(joinPath("books", "sci-fi", "dune"), "segments joined with a slash").toBe(
      "books/sci-fi/dune",
    );
    expect(joinPath("a"), "one segment is that segment").toBe("a");
    expect(
      joinPath(),
      "no arguments at all is a legal call for a rest parameter, and the answer " +
        "is the empty string",
    ).toBe("");
    expect(
      joinPath("books", "", "dune"),
      "an empty segment must not produce a double slash",
    ).toBe("books/dune");
    expect(
      joinPath("/books/", "/dune/"),
      "leading and trailing slashes are trimmed off each segment before joining",
    ).toBe("books/dune");
    expect(
      joinPath(...["books", "sci-fi"]),
      "spreading an array into a rest parameter is the same call",
    ).toBe("books/sci-fi");
    expect(joinPath("/", "/"), "segments that are only slashes vanish entirely").toBe("");
  });

  test("ex3 - countMatching() calls its predicate once per value", () => {
    expect(
      countMatching(["a", "bb", "ccc"], (value) => value.length > 1),
      "two of the three values are longer than one character",
    ).toBe(2);
    expect(countMatching([], () => true), "no values means no matches").toBe(0);
    expect(
      countMatching(["a", "b"], () => false),
      "a predicate that never matches counts nothing, it does not return undefined",
    ).toBe(0);

    const seen: string[] = [];
    countMatching(["x", "y", "z"], (value) => {
      seen.push(value);
      return true;
    });
    expect(
      seen,
      "the predicate sees every value, in input order, exactly once - reread README ex3",
    ).toEqual(["x", "y", "z"]);
  });

  test("ex4 - formatAll() has a default formatter", () => {
    expect(
      formatAll([1, 2.5]),
      "the default formatter is two decimal places: 1.00 and 2.50",
    ).toEqual(["1.00", "2.50"]);
    expect(
      formatAll([1, 2], (value) => `#${value}`),
      "a supplied formatter replaces the default entirely",
    ).toEqual(["#1", "#2"]);
    expect(formatAll([]), "an empty list formats to an empty list").toEqual([]);
    expect(
      formatAll([0]),
      "zero is a value, not a missing one - the default still applies to it",
    ).toEqual(["0.00"]);
  });

  test("ex5 - normaliseTag() overloads on scalar and array", () => {
    expect(
      normaliseTag("  Science Fiction "),
      "trimmed, lower-cased, inner runs of whitespace become one dash",
    ).toBe("science-fiction");
    expect(normaliseTag("Dune"), "an already-clean tag comes back lower-cased").toBe("dune");
    expect(
      normaliseTag(["A B", " C ", "D   E"]),
      "an array in, an array out - same order, each element normalised",
    ).toEqual(["a-b", "c", "d-e"]);
    expect(normaliseTag([]), "an empty array normalises to an empty array").toEqual([]);
    expect(
      normaliseTag("   "),
      "a tag of nothing but whitespace normalises to the empty string",
    ).toBe("");
  });

  test("ex6 - makeCounter() closes over its own state", () => {
    const counter = makeCounter();
    expect(counter.next(), "the default start is 0, and next() hands it out first").toBe(0);
    expect(counter.next(), "the second call hands out 1").toBe(1);
    expect(
      counter.peek(),
      "peek() shows what next() would return without consuming it",
    ).toBe(2);
    expect(counter.peek(), "so calling peek() twice shows the same number twice").toBe(2);
    expect(counter.next(), "and next() still returns that number").toBe(2);

    counter.reset();
    expect(counter.next(), "reset() goes back to the start this counter was made with").toBe(0);

    const fromTen = makeCounter(10);
    expect(fromTen.next(), "a counter made at 10 starts at 10").toBe(10);
    expect(
      counter.next(),
      "two counters do not share state - each call to makeCounter() makes a new closure",
    ).toBe(1);
  });

  test("ex7 - buildQuery() appends a sorted, encoded query string", () => {
    expect(buildQuery("/books"), "no params at all means the base, unchanged").toBe("/books");
    expect(buildQuery("/books", {}), "an empty params object is the same case").toBe("/books");
    expect(
      buildQuery("/books", { year: 1965, author: "Herbert" }),
      "keys are sorted alphabetically so the same query always renders the same way",
    ).toBe("/books?author=Herbert&year=1965");
    expect(
      buildQuery("/books", { q: "dune messiah" }),
      "values are URL-encoded, so the space becomes %20",
    ).toBe("/books?q=dune%20messiah");
    expect(
      buildQuery("/books", { draft: false }),
      "false is a value, not a missing one - it must appear in the query",
    ).toBe("/books?draft=false");
    expect(
      buildQuery("/books", { "a key": "a value" }),
      "the key is encoded too, not just the value",
    ).toBe("/books?a%20key=a%20value");
  });

  test("ex8 - runMiddleware() threads a value through an onion", () => {
    const upper = (input: string, next: (value: string) => string) => next(input.toUpperCase());
    const exclaim = (input: string, next: (value: string) => string) => `${next(input)}!`;
    const block = (_input: string, _next: (value: string) => string) => "blocked";

    expect(
      runMiddleware("a", []),
      "no middleware at all returns the input untouched",
    ).toBe("a");
    expect(
      runMiddleware("a", [upper]),
      "one middleware that upper-cases on the way in",
    ).toBe("A");
    expect(
      runMiddleware("a", [upper, exclaim]),
      "the FIRST middleware is the outermost: it upper-cases on the way in, the " +
        "second appends on the way out (README ex8)",
    ).toBe("A!");
    expect(
      runMiddleware("a", [exclaim, upper]),
      "swap them and the exclamation mark is added after the upper-casing, outside it",
    ).toBe("A!");
    expect(
      runMiddleware("a", [block, upper]),
      "a middleware that never calls next() short-circuits the rest of the chain",
    ).toBe("blocked");

    const order: string[] = [];
    runMiddleware("x", [
      (input, next) => {
        order.push("in:1");
        const out = next(input);
        order.push("out:1");
        return out;
      },
      (input, next) => {
        order.push("in:2");
        const out = next(input);
        order.push("out:2");
        return out;
      },
    ]);
    expect(
      order,
      "the onion order is in:1, in:2, out:2, out:1 - not two independent calls",
    ).toEqual(["in:1", "in:2", "out:2", "out:1"]);
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d02_functions_signatures. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { shelfLabel } from "./ex1/solution";
import { joinPath } from "./ex2/solution";
import { countMatching } from "./ex3/solution";
import type { Formatter } from "./ex4/solution";
import { formatAll } from "./ex4/solution";
import { normaliseTag } from "./ex5/solution";
import type { Counter } from "./ex6/solution";
import { makeCounter } from "./ex6/solution";
import { buildQuery } from "./ex7/solution";
import type { Middleware } from "./ex8/solution";
import { runMiddleware } from "./ex8/solution";

describe("d02_functions_signatures", () => {
  test("ex1 - shelfLabel() has one required and one optional parameter", () => {
    expectTypeOf(shelfLabel).parameters.toEqualTypeOf<[title: string, author?: string]>();
    expectTypeOf(shelfLabel).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the title is required.
    shelfLabel();
  });

  test("ex2 - joinPath() takes any number of strings", () => {
    expectTypeOf(joinPath()).toEqualTypeOf<string>();
    expectTypeOf(joinPath("a", "b", "c")).toEqualTypeOf<string>();
    // @ts-expect-error - every segment is a string.
    joinPath("a", 1);
  });

  test("ex3 - countMatching() types its predicate from the element type", () => {
    countMatching(["a"], (value) => {
      expectTypeOf(value).toEqualTypeOf<string>();
      return true;
    });
    expectTypeOf(countMatching).returns.toEqualTypeOf<number>();
    // @ts-expect-error - the predicate receives a string, not a number.
    countMatching(["a"], (value: number) => value > 1);
  });

  test("ex4 - Formatter is a named function type with a default", () => {
    expectTypeOf<Formatter>().toEqualTypeOf<(value: number) => string>();
    expectTypeOf(formatAll).parameters.toEqualTypeOf<
      [values: readonly number[], format?: Formatter]
    >();
    expectTypeOf(formatAll([1])).toEqualTypeOf<string[]>();
    // @ts-expect-error - a formatter has to produce a string.
    formatAll([1], (value) => value * 2);
  });

  test("ex5 - normaliseTag() keeps the shape it was given", () => {
    expectTypeOf(normaliseTag("a")).toEqualTypeOf<string>();
    expectTypeOf(normaliseTag(["a"])).toEqualTypeOf<string[]>();
    // @ts-expect-error - only a string and an array of strings have an overload.
    normaliseTag(1);
  });

  test("ex6 - Counter is three methods, and start is optional", () => {
    expectTypeOf(makeCounter).parameters.toEqualTypeOf<[start?: number]>();
    expectTypeOf(makeCounter()).toEqualTypeOf<Counter>();
    expectTypeOf(makeCounter().next()).toEqualTypeOf<number>();
    expectTypeOf(makeCounter().peek()).toEqualTypeOf<number>();
    expectTypeOf(makeCounter().reset()).toEqualTypeOf<void>();
    // @ts-expect-error - a counter counts from a number.
    makeCounter("10");
  });

  test("ex7 - buildQuery() takes an optional bag of scalars", () => {
    expectTypeOf(buildQuery).parameters.toEqualTypeOf<
      [base: string, params?: Record<string, string | number | boolean>]
    >();
    expectTypeOf(buildQuery("/books")).toEqualTypeOf<string>();
    // @ts-expect-error - an array is not a scalar query value.
    buildQuery("/books", { tags: ["a"] });
  });

  test("ex8 - Middleware takes the value and the rest of the chain", () => {
    expectTypeOf<Middleware>().toEqualTypeOf<
      (input: string, next: (value: string) => string) => string
    >();
    expectTypeOf(runMiddleware).returns.toEqualTypeOf<string>();
    // @ts-expect-error - a middleware has to return the value, not swallow it.
    runMiddleware("a", [(input: string, next: (value: string) => string): void => void next(input)]);
  });
});
```

An exercise is green only when both gates agree about it.
