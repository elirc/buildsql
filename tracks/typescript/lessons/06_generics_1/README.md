# 06 — Generics, part 1

You have now written the same function twice. Lesson 01's `zip` paired strings
with numbers; the version in this lesson pairs anything with anything, and the
body is identical. That duplication — one algorithm, many element types — is
the problem generics exist to solve.

There are two bad answers to it, and you should be able to say why both are bad
in an interview. The first is copy-paste: `zipStrings`, `zipNumbers`,
`zipUsers`. The second is `any`: one function, no checking, and every caller
back in untyped JavaScript. Generics are the third answer — one function that
*remembers* what it was given, and hands the right type back to each caller.

A generic is not a type. It is a type with a hole in it, filled in at the call
site, usually without anyone writing it down.

## Concept — a parameter for a type

```ts
function atAny(items: unknown[], index: number): unknown {
  return items[index];
}

const name = atAny(["ada", "eli"], 0);
name.toUpperCase();   // 'name' is of type 'unknown'
```

The function is honest — it really does not know what is in that array — and
useless, because the caller who *did* know has been made to forget. Now with a
type parameter:

```ts
function at<T>(items: readonly T[], index: number): T {
  return items[index];
}

const name = at(["ada", "eli"], 0);   // string
const score = at([90, 80], 1);        // number
```

`<T>` declares a type parameter, used in the rest of the signature like any
other type. Notice what you did *not* write at the call sites: no `<string>`,
no `<number>`. TypeScript **infers** the type argument from the value you
passed, which is why generics feel invisible when they are done well.

You can supply it explicitly when inference has nothing to work from:

```ts
const nothing = at<string>([], 0);   // string
```

**Naming.** `T` is conventional for one type parameter, `T`/`U` for a pair,
`K`/`V` for key/value. Longer names (`TItem`, `TResult`) are common in library
code and read better once the signature grows past two.

**Generic interfaces** put the hole in a type instead of a function:

```ts
interface Cell<T> {
  readonly value: T;
  replace<U>(next: U): Cell<U>;
}
```

Two different type parameters live there. `T` belongs to the interface — fixed
when someone writes `Cell<string>` — and `U` belongs to the method, decided
fresh at every call. Telling those apart is exercise 3, and it is the thing
people find genuinely confusing the first time.

**Why not `any`?** Because `any` is not a type, it is an off switch. It
disables checking for the value *and everything it touches*:

```ts
function firstAnyAny(items: any[]): any {
  return items[0];
}
const n = firstAnyAny([1, 2]);
n.toUpperCase();      // compiles. Explodes at runtime.
n.definitely.nope();  // also compiles.
```

`unknown` is the safe version of the same idea — you cannot touch it until you
narrow it — but it still throws away what the caller knew. A generic keeps it.
"`any` vs `unknown` vs a generic" is one of the most common TypeScript
interview questions, and the answer is: `any` opts out, `unknown` defers, a
generic *remembers*.

## Exercise 1 — the head of any list

Edit `ex1/solution.ts`. Make `first` generic and implement it:

- `first([10, 20])` → `10`, typed `number | undefined`
- `first(["only"])` → `"only"`, typed `string | undefined`
- `first([])` → `undefined`

The empty case is what puts `| undefined` in the return type, and the type gate
checks that a list of objects comes back as `{ id: number } | undefined` — the
element type, not `unknown`.

```
uv run dojo test typescript 06_generics_1 ex1
```

## Exercise 2 — two type parameters

Edit `ex2/solution.ts`. Make `mapArray` generic in both directions and
implement it:

```ts
mapArray([1, 2, 3], (n) => n * 2);          // [2, 4, 6]
mapArray(["a", "bb"], (s, i) => `${i}:${s}`);  // ["0:a", "1:bb"]
mapArray([], (x) => x);                     // []
```

The callback receives the element and its index. The type gate checks that
`mapArray([1, 2], (n) => n.toFixed(1))` is `string[]` — which only works if the
callback's parameter was inferred as `number` and its return type flowed
through to the result.

```
uv run dojo test typescript 06_generics_1 ex2
```

## Exercise 3 — a generic interface with a generic method

Edit `ex3/solution.ts`. Give `Box` a type parameter, add a `map` method, and
implement the `box` factory:

- `box(2).value` → `2`
- `box(2).map((n) => n * 3).value` → `6`
- `box("hello").map((s) => s.length).value` → `5` — a `Box<string>` became a
  `Box<number>`
- `map` returns a **new** box; the original still holds its original value

The method's type parameter is not the interface's. Write
`map<U>(transform: (value: T) => U): Box<U>` and read it out loud until it
sounds obvious.

```
uv run dojo test typescript 06_generics_1 ex3
```

## Exercise 4 — zip, one last time

Edit `ex4/solution.ts`. Make `zipPairs` generic in both element types:

- `zipPairs(["ada", "eli"], [90, 80])` → `[["ada", 90], ["eli", 80]]`
- `zipPairs([true, false], ["yes", "no"])` → `[[true, "yes"], [false, "no"]]`
- `zipPairs([1, 2, 3], ["only"])` → `[[1, "only"]]` — still stops at the shorter
  input

The body is the one you wrote in lesson 01. Only the signature changes, which
is exactly the point.

```
uv run dojo test typescript 06_generics_1 ex4
```

## Challenge — uniqueBy (moderate)

Edit `challenge/solution.ts`. Implement `uniqueBy(items, key)`, which removes
duplicates according to a key the caller computes:

```ts
uniqueBy(
  [{ id: "a", name: "Ada" }, { id: "b", name: "Eli" }, { id: "a", name: "Ada again" }],
  (learner) => learner.id,
);
// [{ id: "a", name: "Ada" }, { id: "b", name: "Eli" }]
```

- the **first** item with a given key survives; later duplicates are dropped
- input order is preserved
- `uniqueBy(["a", "A", "b"], (s) => s.toLowerCase())` → `["a", "b"]`

Honest difficulty note: one type parameter, not two — the elements go in and
the same elements come out. A `Set` makes the body five lines.

```
uv run dojo test typescript 06_generics_1 challenge
```

## Review — lastOr

Edit `review1/solution.ts`. Implement `lastOr(items, fallback)`:

- `lastOr([1, 2, 3], 0)` → `3`
- `lastOr(["x"], "fallback")` → `"x"`
- `lastOr([], "fallback")` → `"fallback"`

Both parameters share one type parameter, so `lastOr([1, 2], "none")` must not
compile — and the return type has no `| undefined` in it at all.

```
uv run dojo test typescript 06_generics_1 review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/06_generics_1. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { first } from "./ex1/solution";
import { mapArray } from "./ex2/solution";
import { box } from "./ex3/solution";
import { zipPairs } from "./ex4/solution";
import { uniqueBy } from "./challenge/solution";
import { lastOr } from "./review1/solution";

describe("06_generics_1", () => {
  test("ex1 - first() returns the head, or undefined", () => {
    expect(first([10, 20]), "the first element of [10, 20] is 10").toBe(10);
    expect(first(["only"]), "one element means that element").toBe("only");
    expect(
      first([]),
      "an empty list has no first element, so the answer is undefined - and " +
        "that has to be part of the declared return type (README ex1)",
    ).toBeUndefined();
  });

  test("ex2 - mapArray() transforms every element", () => {
    expect(
      mapArray([1, 2, 3], (n) => n * 2),
      "each element is passed through the callback, in order",
    ).toEqual([2, 4, 6]);
    expect(
      mapArray(["a", "bb"], (s, i) => `${i}:${s}`),
      "the callback's second argument is the index",
    ).toEqual(["0:a", "1:bb"]);
    expect(mapArray([], (x) => x), "an empty list maps to an empty list").toEqual([]);
  });

  test("ex3 - box() holds a value and map() changes its type", () => {
    expect(box(2).value, "the box hands back what it was given").toBe(2);
    expect(box(2).map((n) => n * 3).value, "map applies the transform: 2 * 3 = 6").toBe(6);
    expect(
      box("hello").map((s) => s.length).value,
      "a box of string maps to a box of number - the element type is not fixed",
    ).toBe(5);
    const original = box("keep");
    original.map((s) => s.toUpperCase());
    expect(original.value, "map returns a NEW box; the original is untouched").toBe("keep");
  });

  test("ex4 - zipPairs() works for any two element types", () => {
    expect(
      zipPairs(["ada", "eli"], [90, 80]),
      "the classic case: names with scores",
    ).toEqual([
      ["ada", 90],
      ["eli", 80],
    ]);
    expect(
      zipPairs([true, false], ["yes", "no"]),
      "booleans with strings works too - nothing in the body cares",
    ).toEqual([
      [true, "yes"],
      [false, "no"],
    ]);
    expect(zipPairs([1, 2, 3], ["only"]), "still stops at the shorter input").toEqual([
      [1, "only"],
    ]);
  });

  test("challenge - uniqueBy() keeps the first item per key", () => {
    const learners = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Eli" },
      { id: "a", name: "Ada again" },
    ];
    expect(
      uniqueBy(learners, (learner) => learner.id),
      "the FIRST item with each key survives, in input order - so 'Ada', not " +
        "'Ada again' (README challenge)",
    ).toEqual([
      { id: "a", name: "Ada" },
      { id: "b", name: "Eli" },
    ]);
    expect(
      uniqueBy(["a", "A", "b"], (s) => s.toLowerCase()),
      "the key function decides what 'the same' means: 'A' collides with 'a'",
    ).toEqual(["a", "b"]);
    expect(uniqueBy([], (x) => String(x)), "an empty list stays empty").toEqual([]);
  });

  test("review1 - lastOr() falls back instead of returning undefined", () => {
    expect(lastOr([1, 2, 3], 0), "the last element of [1, 2, 3] is 3").toBe(3);
    expect(lastOr(["x"], "fallback"), "one element is also the last one").toBe("x");
    expect(
      lastOr([], "fallback"),
      "an empty list yields the fallback the caller supplied, not undefined",
    ).toBe("fallback");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/06_generics_1. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { first } from "./ex1/solution";
import { mapArray } from "./ex2/solution";
import type { Box } from "./ex3/solution";
import { box } from "./ex3/solution";
import { zipPairs } from "./ex4/solution";
import { uniqueBy } from "./challenge/solution";
import { lastOr } from "./review1/solution";

describe("06_generics_1", () => {
  test("ex1 - first() remembers the element type", () => {
    expectTypeOf(first([1, 2])).toEqualTypeOf<number | undefined>();
    expectTypeOf(first(["a"])).toEqualTypeOf<string | undefined>();
    expectTypeOf(first([{ id: 1 }])).toEqualTypeOf<{ id: number } | undefined>();
  });

  test("ex2 - mapArray() infers both ends", () => {
    expectTypeOf(mapArray([1, 2], (n) => n.toFixed(1))).toEqualTypeOf<string[]>();
    expectTypeOf(mapArray(["a"], (s) => s.length)).toEqualTypeOf<number[]>();
    // @ts-expect-error - the callback receives a number, so .toUpperCase is not on it.
    mapArray([1, 2], (n) => n.toUpperCase());
  });

  test("ex3 - Box carries its element type through map()", () => {
    expectTypeOf(box(2).value).toEqualTypeOf<number>();
    expectTypeOf(box(2).map((n) => String(n)).value).toEqualTypeOf<string>();
    expectTypeOf(box("x").map((s) => s.length)).toEqualTypeOf<Box<number>>();
    // @ts-expect-error - the boxed value is a number, so .trim() is not available.
    box(2).map((n) => n.trim());
  });

  test("ex4 - zipPairs() pairs two independent types", () => {
    expectTypeOf(zipPairs(["a"], [1])).toEqualTypeOf<[string, number][]>();
    expectTypeOf(zipPairs([true], [{ id: 1 }])).toEqualTypeOf<[boolean, { id: number }][]>();
  });

  test("challenge - uniqueBy() returns the same element type it took", () => {
    const learners = [{ id: "a" }];
    expectTypeOf(uniqueBy(learners, (l) => l.id)).toEqualTypeOf<{ id: string }[]>();
    // @ts-expect-error - the key function must produce a string.
    uniqueBy(learners, (l) => l.id.length);
  });

  test("review1 - lastOr() ties the fallback to the element type", () => {
    expectTypeOf(lastOr([1, 2], 0)).toEqualTypeOf<number>();
    expectTypeOf(lastOr(["a"], "z")).toEqualTypeOf<string>();
    // @ts-expect-error - the fallback has to be the same type as the elements.
    lastOr([1, 2], "none");
  });
});
```

In plain English:

- **ex1** checks three values and then three *inferred* types. The last one —
  `{ id: number } | undefined` — is the one `unknown` cannot produce.
- **ex2** checks the mapping and the index argument, then proves inference flows
  both ways: in from the array, out from the callback. The `@ts-expect-error`
  line proves the callback's parameter really is `number`.
- **ex3** checks that `map` transforms the value, that it produces a new box, and
  at the type level that `Box<string>.map(s => s.length)` is a `Box<number>`.
- **ex4** zips three different pairs of types with one implementation.
- **challenge** checks first-wins deduplication, a case-insensitive key, and the
  empty list; the type gate proves the element type survives the round trip.
- **review1** proves the fallback is tied to the element type —
  `lastOr([1, 2], "none")` must not compile.

## The teaching point

The test for whether a generic is pulling its weight is simple: does a type
parameter appear at least twice in the signature? `first<T>(items: readonly
T[]): T | undefined` uses `T` in the input and the output, so it carries
information from one to the other. A function whose type parameter appears only
once — `function log<T>(value: T): void` — is a generic doing nothing that
`unknown` would not do, and it is a small code smell.

The second thing to take away is that generics are a *caller* feature. Nothing
inside `uniqueBy` benefits from `T`; the body could not care less. Everything
about it is for the person calling it, who gets back exactly the type they put
in, without a cast, and gets a compile error when their key function returns
the wrong thing. That is the deal you are making every time you write angle
brackets: a little more work in the signature, so that every call site needs
none.

Next: **07_generics_2**, where type parameters get constraints, `keyof` turns
property names into types, and a generic class holds state.
