# 01 — Primitives and inference

In lesson 00 you annotated a parameter because the compiler refused to guess
what it was, and you annotated a return type because the compiler had guessed
something useless. Those are the two halves of every day you will ever spend
in TypeScript: deciding where to write a type down, and trusting inference
everywhere else.

The temptation, coming from a language like C# or Java, is to annotate
everything. Resist it. A codebase where every local variable carries a type is
not safer — it is louder, and every annotation is one more thing that can drift
out of date. The idiom is to annotate the *boundaries*: parameters, exported
return types, anything crossing a module edge, anything you want the compiler
to check your body against. Inside a function, let it work.

This lesson is about the types you will meet a hundred times a day — numbers,
strings, arrays — and about the two array-shaped types people reach for far too
rarely: **tuples**, when the length and the meaning of each slot are fixed, and
**`readonly` arrays**, when a function promises not to touch what it was given.
Both of them turn "I hope everyone remembers" into "the compiler will tell you".

## Concept — what TypeScript already knows

Every expression has a type whether you wrote one or not. Hover a variable in
your editor and you are reading inference:

```ts
const slug = "04_unions_narrowing";  // type: "04_unions_narrowing"
let title = "Unions";                // type: string
const counts = [3, 4, 4, 6];         // type: number[]
```

Look at the first two. `const slug` cannot be reassigned, so TypeScript infers
the *literal* type `"04_unions_narrowing"` — the type whose only value is that
exact string. `let title` can be reassigned, so it widens to `string`. That
difference does nothing for you today and everything for you in lesson 05,
where literal types become how you model a fixed set of options.

Now the arrays. `counts` is `number[]`: any number of numbers, and every
position means the same thing. That is exactly right for a list of scores and
exactly wrong for a pair:

```ts
function bounds(): number[] {
  return [1, 10];
}

const [low, high] = bounds();
const oops = bounds()[7];   // number, says TypeScript. undefined, says the runtime.
```

A **tuple** fixes the length and gives each slot a meaning:

```ts
function bounds(): [low: number, high: number] {
  return [1, 10];
}

bounds()[7];   // Tuple type '[low: number, high: number]' has no element at index '7'.
```

The labels (`low:`, `high:`) are documentation the compiler carries around for
you; they change nothing about assignability. What changes is that the length
is now part of the type, and destructuring gets real names in the tooltip.

The other under-used shape is `readonly`:

```ts
function total(values: readonly number[]): number {
  values.sort();          // Property 'sort' does not exist on type 'readonly number[]'.
  return values.reduce((a, b) => a + b, 0);
}
```

Read the parameter as a promise made by the *function*: "I will not mutate
this". Because it promises less, it accepts more — a `readonly number[]`
parameter takes both frozen and ordinary arrays, so widening a parameter to
`readonly` never breaks a caller. It is the rare change that is strictly free.

One JavaScript trap you need for exercise 3, because TypeScript will not save
you from it: `Array.prototype.sort` mutates the array it is called on, and with
no comparator it compares elements *as strings*.

```ts
[10, 9, 1].sort();              // [1, 10, 9]   - "10" sorts before "9"
[10, 9, 1].sort((a, b) => a - b);  // [1, 9, 10]
```

## Exercise 1 — a return type that is true

Edit `ex1/solution.ts`. Implement `averageScore(scores)` — the arithmetic mean
of a list of numbers:

- `averageScore([10, 20, 30])` → `20`
- `averageScore([1, 2])` → `1.5` (no rounding, no flooring)
- `averageScore([])` → `0`

The empty case is the one worth thinking about: `0 / 0` is `NaN`, and `NaN`
is not `0`. The parameter is annotated for you; the return type is not, and
while the body only throws TypeScript infers `never`. Write the annotation
that makes the gate's `expectTypeOf(...).returns` assertion true.

```
uv run dojo test typescript 01_primitives_and_inference ex1
```

## Exercise 2 — a pair is not an array

Edit `ex2/solution.ts`. Implement `minMax(values)`, returning the smallest and
largest values in that order:

- `minMax([3, 9, 4])` → `[3, 9]`
- `minMax([7])` → `[7, 7]`
- `minMax([-5, -1, -9])` → `[-9, -1]`

The gate never calls it with an empty array, so you do not need a case for
that. What you do need is the right *return type*: two numbers, min first, max
second. Slot labels are encouraged. Watch the negatives — they catch anyone who
seeded their accumulators from `0`.

```
uv run dojo test typescript 01_primitives_and_inference ex2
```

## Exercise 3 — sort a copy, accept a promise

Edit `ex3/solution.ts`. Implement `sortedCopy(values)`, which returns the
values sorted ascending **without modifying the array it was given**:

- `sortedCopy([10, 9, 1])` → `[1, 9, 10]`, and the argument still reads
  `[10, 9, 1]` afterwards.

Two things are wrong with the stub. The body throws, and the parameter is
declared `number[]` while the type gate hands it a `readonly number[]`. Fix
both. The return type stays `number[]` — the copy you hand back is yours, and
the caller may do as it likes with it.

```
uv run dojo test typescript 01_primitives_and_inference ex3
```

## Exercise 4 — an array of pairs

Edit `ex4/solution.ts`. Implement `zip(names, scores)`, pairing each name with
the score at the same index:

- `zip(["ada", "eli"], [90, 80])` → `[["ada", 90], ["eli", 80]]`
- `zip(["ada", "eli", "grace"], [90])` → `[["ada", 90]]` — stop at the shorter
  input, drop the rest
- `zip([], [])` → `[]`

The interesting part is the return type. Build it from the inside out: a pair
is `[string, number]`, and you are returning a list of those. Declaring your
accumulator with that type is what makes `push([name, score])` typecheck
instead of inferring something looser.

```
uv run dojo test typescript 01_primitives_and_inference ex4
```

## Challenge — splitEvery (moderate)

Edit `challenge/solution.ts`. Implement `splitEvery(values, size)`, which cuts
a list into chunks of `size`:

- `splitEvery([1, 2, 3, 4, 5], 2)` → `[[1, 2], [3, 4], [5]]` — the last chunk
  may be short
- `splitEvery([1, 2, 3, 4], 2)` → `[[1, 2], [3, 4]]` — no trailing empty chunk
- `splitEvery([1, 2, 3], 0)` → `[]`
- `splitEvery([1, 2, 3], 2.5)` → `[]`

Any `size` that is not a positive whole number is nonsense and produces `[]`.
The honest difficulty note: the loop is four lines, and the two nonsense cases
are where people lose the exercise — a `size` of `0` writes an infinite loop if
you do not guard it.

```
uv run dojo test typescript 01_primitives_and_inference challenge
```

## Review — firstAndLast

Edit `review1/solution.ts`. Implement `firstAndLast(values)` returning the
first and last entries of a list of strings as a two-slot tuple:

- `firstAndLast(["a", "b", "c"])` → `["a", "c"]`
- `firstAndLast(["only"])` → `["only", "only"]`

Same two ideas as ex2 and ex3 — a labelled tuple out, a `readonly` array in.
Review exercises are not part of lesson completion; the spaced-review scheduler
brings this one back in three days, then a week, then three weeks.

```
uv run dojo test typescript 01_primitives_and_inference review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/01_primitives_and_inference. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { averageScore } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { sortedCopy } from "./ex3/solution";
import { zip } from "./ex4/solution";
import { splitEvery } from "./challenge/solution";
import { firstAndLast } from "./review1/solution";

describe("01_primitives_and_inference", () => {
  test("ex1 - averageScore() divides, and survives an empty list", () => {
    expect(
      averageScore([10, 20, 30]),
      "the mean of 10, 20 and 30 is 20 - sum divided by count, no rounding",
    ).toBe(20);
    expect(
      averageScore([1, 2]),
      "1.5 is the answer: do not round, do not floor - reread README ex1",
    ).toBe(1.5);
    expect(
      averageScore([]),
      "an empty list has no mean, so this course says 0 - 0/0 is NaN and NaN " +
        "is not 0, so you need a guard before the division",
    ).toBe(0);
  });

  test("ex2 - minMax() returns exactly two numbers, smallest first", () => {
    expect(
      minMax([3, 9, 4]),
      "minMax([3, 9, 4]) is [3, 9] - min in slot 0, max in slot 1",
    ).toEqual([3, 9]);
    expect(
      minMax([7]),
      "a one-element list is its own min and its own max - no special case needed " +
        "if you seed both accumulators from values[0]",
    ).toEqual([7, 7]);
    expect(
      minMax([-5, -1, -9]),
      "negatives are the test of whether you seeded from 0 instead of values[0]",
    ).toEqual([-9, -1]);
  });

  test("ex3 - sortedCopy() sorts numerically and leaves the input alone", () => {
    const original = [10, 9, 1];
    expect(
      sortedCopy(original),
      "the default sort compares as strings, so [10, 9, 1] comes back [1, 10, 9] - " +
        "pass a numeric comparator (README ex3)",
    ).toEqual([1, 9, 10]);
    expect(
      original,
      "sort() mutates the array it is called on: copy first, sort the copy",
    ).toEqual([10, 9, 1]);
  });

  test("ex4 - zip() pairs up to the shorter input", () => {
    expect(
      zip(["ada", "eli"], [90, 80]),
      "zip pairs element by element: [['ada', 90], ['eli', 80]]",
    ).toEqual([
      ["ada", 90],
      ["eli", 80],
    ]);
    expect(
      zip(["ada", "eli", "grace"], [90]),
      "extra names have no score, so they are dropped - stop at the shorter length",
    ).toEqual([["ada", 90]]);
    expect(zip([], []), "two empty inputs zip to an empty array, not undefined").toEqual([]);
  });

  test("challenge - splitEvery() chunks, including the short last chunk", () => {
    expect(
      splitEvery([1, 2, 3, 4, 5], 2),
      "the final chunk is allowed to be short: [[1,2],[3,4],[5]]",
    ).toEqual([[1, 2], [3, 4], [5]]);
    expect(
      splitEvery([1, 2, 3, 4], 2),
      "an input that divides evenly produces no trailing empty chunk",
    ).toEqual([[1, 2], [3, 4]]);
    expect(
      splitEvery([1, 2, 3], 0),
      "a size of 0 would loop forever, so the agreed answer is [] - reread the prompt",
    ).toEqual([]);
    expect(
      splitEvery([1, 2, 3], 2.5),
      "a fractional size is nonsense too, and the prompt says nonsense means []",
    ).toEqual([]);
  });

  test("review1 - firstAndLast() reads both ends of the array", () => {
    expect(
      firstAndLast(["a", "b", "c"]),
      "first is 'a', last is 'c' - index 0 and index length-1",
    ).toEqual(["a", "c"]);
    expect(
      firstAndLast(["only"]),
      "with one element the two slots are the same string - that is not a bug",
    ).toEqual(["only", "only"]);
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/01_primitives_and_inference. Quoted verbatim in README.md.
// Graded by tsc, not by running it: every assertion here is about the types
// your code declares.
import { describe, expectTypeOf, test } from "vitest";

import { averageScore } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { sortedCopy } from "./ex3/solution";
import { zip } from "./ex4/solution";
import { splitEvery } from "./challenge/solution";
import { firstAndLast } from "./review1/solution";

describe("01_primitives_and_inference", () => {
  test("ex1 - averageScore() is declared to return a number", () => {
    expectTypeOf(averageScore).returns.toEqualTypeOf<number>();
    // @ts-expect-error - scores are numbers; a list of strings must not compile.
    averageScore(["10", "20"]);
  });

  test("ex2 - minMax() returns a two-slot tuple, not number[]", () => {
    expectTypeOf(minMax([1, 2])).toEqualTypeOf<[min: number, max: number]>();
    // @ts-expect-error - a two-element tuple has no index 2.
    minMax([1, 2])[2];
  });

  test("ex3 - sortedCopy() accepts a readonly array and returns a mutable one", () => {
    const frozen: readonly number[] = [3, 1, 2];
    expectTypeOf(sortedCopy).parameters.toEqualTypeOf<[values: readonly number[]]>();
    expectTypeOf(sortedCopy(frozen)).toEqualTypeOf<number[]>();
  });

  test("ex4 - zip() returns an array of [string, number] pairs", () => {
    expectTypeOf(zip(["a"], [1])).toEqualTypeOf<[string, number][]>();
    // @ts-expect-error - the second argument is a list of numbers, not strings.
    zip(["a"], ["b"]);
  });

  test("challenge - splitEvery() takes a readonly array and returns number[][]", () => {
    const frozen: readonly number[] = [1, 2, 3];
    expectTypeOf(splitEvery(frozen, 2)).toEqualTypeOf<number[][]>();
  });

  test("review1 - firstAndLast() is a readonly-in, tuple-out function", () => {
    const frozen: readonly string[] = ["a", "b"];
    expectTypeOf(firstAndLast(frozen)).toEqualTypeOf<[first: string, last: string]>();
  });
});
```

In plain English:

- **ex1** checks three averages, including the empty list, and then insists the
  declared return type is `number` rather than the `never` the stub infers. The
  `@ts-expect-error` line passes only if `averageScore(["10", "20"])` *fails* to
  compile — proof you did not widen the parameter to `any` to make an error go
  away.
- **ex2** checks the values and then the shape: `toEqualTypeOf<[min: number,
  max: number]>()` fails for `number[]`, and the index-2 probe proves the length
  is part of your type.
- **ex3** asserts the sorted values, then asserts the *original array is
  unchanged* — that second `expect` is the whole exercise. The type gate then
  requires the parameter to be exactly `readonly number[]` and the result to be
  a mutable `number[]`.
- **ex4** checks pairing, truncation and the empty case, then pins the return
  type to `[string, number][]`.
- **challenge** covers the short last chunk, the even split, and the two
  nonsense sizes.
- **review1** is ex2 and ex3 combined in a smaller shape.

Remember the quirk from lesson 00: `tsc` typechecks a whole file at once, so an
unfinished ex4 can put a type error in the same file as ex1. The per-exercise
verdict line printed by `dojo test` is still exact — read that, not the noise.

## The teaching point

Real code loses more time to mutation than to type errors. A function that
sorts its argument in place is fine on the day it is written and a two-hour
debugging session the day someone calls it inside a `map`. `readonly number[]`
is how you say "I will not do that to you" in a way that is checked, and the
cost of saying it is one word.

Tuples are the same trade in a different direction. `[number, number]` instead
of `number[]` costs you nothing at runtime — it is the same array — and buys
you a compiler that knows `result[2]` is a mistake, plus destructuring that
reads like English. The habit to build is noticing when a "list" is really a
fixed-size record: coordinates, ranges, key/value pairs, `useState`-style
returns.

Next: **02_functions**, where parameters get optional, defaults get inferred,
and one function learns to have two signatures.
