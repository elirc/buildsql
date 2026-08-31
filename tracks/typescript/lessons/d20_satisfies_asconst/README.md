# d20 - satisfies and as const (drill set)

Eight problems on the two operators that decide how much the compiler is
allowed to forget: `as const`, which stops widening, and `satisfies`, which
checks a value against a type *without* replacing what was inferred. They drill
lessons **10_guards_assertions** (its `satisfies` exercise) and
**05_literals_enums**; go back if "widening" is still a word rather than a
behaviour.

Most of these exercises are declarations, so the type gate is where they are
graded: `gate.test-d.ts` covers all eight, and `gate.test.ts` covers the three
that have a function to run. Nearly every stub is the *annotated* version -
`const X: Shape = {...}` - which is the habit this whole set exists to break.

## ex1 - freeze a config object

`RETRY` holds `{ attempts: 3, backoffMs: 250, jitter: false }` and its type is
exactly

```ts
{ readonly attempts: 3; readonly backoffMs: 250; readonly jitter: false }
```

- `RETRY.attempts` is the literal `3`, not `number`
- `RETRY.attempts = 4` is a compile error

The values in the stub are already right. The type is not.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex1
```

## ex2 - return a pair, not an array

`minMax(values)` returns the smallest and largest values as a **readonly pair**:
its return type is `readonly [number, number]`, not `number[]`.

- `minMax([3, 1, 2])` -> `[1, 3]`, `minMax([5])` -> `[5, 5]`
- `minMax([])` -> `[Infinity, -Infinity]` - `Math.min()` with no arguments is
  `Infinity`, and `Math.max()` is `-Infinity`. That is the documented empty
  case, not a special branch.

Do not write the return type out by hand; get it from the returned expression.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex2
```

## ex3 - check without erasing

`PALETTE` holds three colours - `primary`, `danger`, `muted` - and each value
is a hex string. Two things have to be true at once:

- `keyof typeof PALETTE` is `"primary" | "danger" | "muted"`, so `PALETTE.accent`
  is a compile error
- every value is checked against `` `#${string}` ``, so a colour written as
  `"0055ff"` would be rejected at the declaration

An annotation of `Record<string, string>` gives you the second half and throws
away the first. There is an operator that gives you both.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex3
```

## ex4 - a route table that publishes its paths

`ROUTES` is a list of three entries:

```
{ path: "/",      method: "GET" }
{ path: "/users", method: "GET" }
{ path: "/users", method: "POST" }
```

checked against `readonly { path: string; method: "GET" | "POST" }[]`, and
frozen so that the literals survive. Two types are derived from it:

- `RoutePath` -> `"/" | "/users"`
- `RouteMethod` -> `"GET" | "POST"`

`(typeof ROUTES)["length"]` is `3`, and `ROUTES[0].path = "/other"` is a
compile error.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex4
```

## ex5 - satisfies against as

`Settings` is `{ mode: "strict" | "lenient"; retries: number; tags: readonly string[] }`.

`CONFIG` holds `{ mode: "strict", retries: 3, tags: ["core"] }` and must be
checked against `Settings` **without** taking `Settings` as its type:

- `CONFIG.mode` is the literal `"strict"`, so `CONFIG.mode = "lenient"` is a
  compile error
- `CONFIG.retries` is `number` - the target type asked for `number`, so nothing
  is preserved there

The stub uses `as Settings`. That is a type assertion: it changes the type and
performs almost no checking - and it is the habit this exercise is aimed at.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex5
```

## ex6 - as const on the callee side

`tupleOf(values)` returns its argument unchanged, but its type parameter is
declared `const`, so a literal passed to it is inferred as a readonly tuple of
literals - without the caller writing `as const`.

- `tupleOf([1, "a"])` -> type `readonly [1, "a"]`
- `tupleOf(["ready"])` -> type `readonly ["ready"]`
- `tupleOf([])` -> type `readonly []`

At runtime it just hands the values back.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex6
```

## ex7 - derive two unions from one table

`PLANS` describes three plans:

```
free:  { seats: 1,   features: ["basic"] }
pro:   { seats: 10,  features: ["basic", "api"] }
scale: { seats: 100, features: ["basic", "api", "sso"] }
```

frozen, and checked against
`Record<string, { seats: number; features: readonly string[] }>`. Two types
come out of it:

- `PlanName` -> `"free" | "pro" | "scale"`
- `Feature` -> `"basic" | "api" | "sso"` - every feature named anywhere in the
  table, deduplicated

`PLANS.pro.seats` is the literal `10`, and `PLANS.enterprise` is a compile
error. The two derived types are already written in the stub; making them true
is the exercise.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex7
```

## ex8 - a flag spec that types its own defaults

`FLAGS` describes a command-line interface:

```
verbose: { kind: "boolean", default: false }
retries: { kind: "number",  default: 3 }
out:     { kind: "string",  default: "dist" }
```

frozen, and checked against
`Record<string, { kind: "boolean" | "number" | "string"; default: boolean | number | string }>`.

From it:

- `FlagName` -> `"verbose" | "retries" | "out"`
- `Flags` -> `{ verbose: boolean; retries: number; out: string }` - one member
  per flag, with the type chosen by that flag's `kind`
- `defaults()` returns `{ verbose: false, retries: 3, out: "dist" }` typed as
  `Flags`

`Flags` is a mapped type over `FlagName` whose value is a conditional on each
flag's `kind`. `FlagName` and `Flags` are declared in the stub; the declaration
of `FLAGS` and the body of `defaults()` are yours.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d20_satisfies_asconst ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Runtime gate for typescript/d20_satisfies_asconst. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { minMax } from "./ex2/solution";
import { tupleOf } from "./ex6/solution";
import { defaults } from "./ex8/solution";

describe("d20_satisfies_asconst", () => {
  test("ex2 - minMax() returns the pair in order", () => {
    expect(minMax([3, 1, 2]), "smallest first, largest second").toEqual([1, 3]);
    expect(minMax([5]), "one element is both ends").toEqual([5, 5]);
    expect(minMax([-4, -9]), "negatives sort the same way").toEqual([-9, -4]);
    expect(minMax([]), "Math.min() with no arguments is Infinity and Math.max() is " +
      "-Infinity, which is the documented empty case here (README ex2)").toEqual([
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]);
  });

  test("ex6 - tupleOf() hands the values straight back", () => {
    expect(tupleOf([1, "a"]), "the same values, in the same order").toEqual([1, "a"]);
    expect(tupleOf([]), "an empty list is a legal tuple").toEqual([]);
    expect(tupleOf(["only"]), "and so is a single element").toEqual(["only"]);
  });

  test("ex8 - defaults() reads the defaults out of the spec", () => {
    expect(defaults(), "one entry per flag, each holding the default from FLAGS").toEqual({
      verbose: false,
      retries: 3,
      out: "dist",
    });
    expect(defaults().retries, "read through, not retyped - a number stays a number").toBe(3);
    expect(Object.keys(defaults()).sort(), "exactly the three flags").toEqual([
      "out",
      "retries",
      "verbose",
    ]);
  });
});
```

This is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d20_satisfies_asconst. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { RETRY } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { PALETTE } from "./ex3/solution";
import type { RouteMethod, RoutePath } from "./ex4/solution";
import { ROUTES } from "./ex4/solution";
import { CONFIG } from "./ex5/solution";
import { tupleOf } from "./ex6/solution";
import type { Feature, PlanName } from "./ex7/solution";
import { PLANS } from "./ex7/solution";
import type { FlagName, Flags } from "./ex8/solution";

describe("d20_satisfies_asconst", () => {
  test("ex1 - RETRY is frozen at the type level", () => {
    expectTypeOf<typeof RETRY>().toEqualTypeOf<{
      readonly attempts: 3;
      readonly backoffMs: 250;
      readonly jitter: false;
    }>();
    expectTypeOf(RETRY.attempts).toEqualTypeOf<3>();
    // @ts-expect-error - every member is readonly after a const assertion.
    RETRY.attempts = 4;
  });

  test("ex2 - minMax() returns a readonly pair, not an array", () => {
    expectTypeOf(minMax([1, 2])).toEqualTypeOf<readonly [number, number]>();
    const pair = minMax([1, 2]);
    expectTypeOf(pair[0]).toEqualTypeOf<number>();
    // @ts-expect-error - the pair a const assertion produces cannot be written to.
    pair[0] = 9;
  });

  test("ex3 - PALETTE keeps its own keys", () => {
    expectTypeOf<keyof typeof PALETTE>().toEqualTypeOf<"primary" | "danger" | "muted">();
    // @ts-expect-error - accent is not one of the three colours.
    PALETTE.accent;
  });

  test("ex4 - the route table publishes its own paths", () => {
    expectTypeOf<RoutePath>().toEqualTypeOf<"/" | "/users">();
    expectTypeOf<RouteMethod>().toEqualTypeOf<"GET" | "POST">();
    expectTypeOf<(typeof ROUTES)["length"]>().toEqualTypeOf<3>();
    // @ts-expect-error - the table is readonly all the way down.
    ROUTES[0].path = "/other";
  });

  test("ex5 - CONFIG is checked without being widened", () => {
    expectTypeOf(CONFIG.mode).toEqualTypeOf<"strict">();
    expectTypeOf(CONFIG.retries).toEqualTypeOf<number>();
    // @ts-expect-error - mode is the literal strict, so lenient no longer fits.
    CONFIG.mode = "lenient";
  });

  test("ex6 - tupleOf() infers a tuple of literals", () => {
    expectTypeOf(tupleOf([1, "a"])).toEqualTypeOf<readonly [1, "a"]>();
    expectTypeOf(tupleOf(["ready"])).toEqualTypeOf<readonly ["ready"]>();
    expectTypeOf(tupleOf([])).toEqualTypeOf<readonly []>();
  });

  test("ex7 - the plan table publishes its names and its features", () => {
    expectTypeOf<PlanName>().toEqualTypeOf<"free" | "pro" | "scale">();
    expectTypeOf<Feature>().toEqualTypeOf<"basic" | "api" | "sso">();
    expectTypeOf(PLANS.pro.seats).toEqualTypeOf<10>();
    // @ts-expect-error - enterprise is not a plan.
    PLANS.enterprise;
  });

  test("ex8 - Flags is derived from the spec, one member per flag", () => {
    expectTypeOf<FlagName>().toEqualTypeOf<"verbose" | "retries" | "out">();
    expectTypeOf<Flags>().toEqualTypeOf<{ verbose: boolean; retries: number; out: string }>();
  });
});
```

An exercise is green only when both gates agree about it.
