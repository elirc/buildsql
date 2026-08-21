# 05 — Literal types, `as const`, and enums

In lesson 04 you wrote `{ kind: "circle" }` and the compiler treated `"circle"`
as a type. That was not a special case for discriminated unions. In TypeScript
**every literal value is also a type** — `"circle"`, `42` and `true` each name a
type with exactly one member — and that fact is what turns a union into a
closed set of options.

This is the feature that replaces most of what other languages use enums for.
`"beginner" | "intermediate" | "advanced"` is a type with three values, no
imports, no runtime object, and full narrowing support. When a codebase says
`status: string` and then compares it to string constants in nine places, this
is the fix, and it usually takes one line.

TypeScript *also* has `enum`, one of the few features that emits real
JavaScript rather than disappearing at compile time. This lesson teaches both
and is honest about when each is worth it, because "union of literals or enum?"
is a question you will be asked and will have to answer for a real codebase.

## Concept — a value that is also a type

```ts
let track = "react";          // string    - it could be reassigned
const track2 = "react";       // "react"   - it cannot, so the literal survives
```

That is **widening**: a mutable binding widens the literal to its base type, a
`const` keeps it. It explains the error everyone hits once:

```ts
type Level = "beginner" | "advanced";

let chosen = "beginner";      // widened to string
const level: Level = chosen;  // Type 'string' is not assignable to type 'Level'
```

Three ways to fix it: use `const`, annotate `let chosen: Level = "beginner"`,
or write `chosen as const`.

**`as const` on an object or array** does the same job wholesale, and adds
`readonly`:

```ts
const sizes = { small: 1, large: 2 };
//    sizes.small: number, and reassignable

const frozen = { small: 1, large: 2 } as const;
//    frozen.small: 1, and readonly - assignment is a compile error

const tracks = ["ts", "node"] as const;
//    readonly ["ts", "node"] - a readonly tuple, not string[]
```

Nothing changes at runtime; `as const` is a *type* assertion, and the emitted
JavaScript is byte-for-byte identical. What you get is a compile-time
description precise enough to derive other types from — which is the challenge
in this lesson.

**Deriving a union from data** (a preview of lesson 07, and the reason `as
const` is worth the two words):

```ts
const SIZES = { small: 1, medium: 2, large: 3 } as const;

type Size = keyof typeof SIZES;   // "small" | "medium" | "large"
```

Read it right to left. `typeof HINT_TIERS` is "the type of that value" (this is
the *type-level* `typeof`, not the runtime operator with the same spelling);
`keyof` takes the union of that type's property names. Add a fourth tier to the
object and the type updates itself — the single-source-of-truth trick that
hand-written unions cannot give you.

**Enums.** An `enum` is a named set of constants that exists at runtime:

```ts
enum Status {
  Draft = "draft",
  Published = "published",
}

Status.Draft;                 // "draft" at runtime - a real object property
const s: Status = "draft";    // ERROR: string is not assignable to Status
```

That last line is the interesting one. A string enum is **nominal**: only its
own members are assignable to it, which is unusual in this otherwise
structurally-typed language and is genuinely useful when you want a value that
cannot be faked by any old string.

What to know about the costs, because this is the interview question:

- An enum emits JavaScript — an object with the members on it — so it is not
  free, and it cannot be tree-shaken away.
- Values arriving from `JSON.parse`, a database or a form are plain strings, and
  a plain string is not assignable to a string enum, so you need a cast or a
  validation step at every boundary.
- **Numeric** enums are worse: their members are assignable from arbitrary
  numbers in more cases than you would like, and reverse mapping puts both
  `Status[0]` and `Status.Draft` on the object.
- `const enum` (fully inlined, no emit) is banned under this course's
  `isolatedModules` setting, and by most bundlers, for good reasons.

The modern default in most codebases is a union of string literals, with enums
reserved for cases where nominal typing genuinely helps. Knowing *why* is worth
more than knowing which.

## Exercise 1 — three values, not every string

Edit `ex1/solution.ts`. Replace `type Level = string` with a union of the three
literals, and implement `nextLevel(level)`:

- `nextLevel("beginner")` → `"intermediate"`
- `nextLevel("intermediate")` → `"advanced"`
- `nextLevel("advanced")` → `"advanced"` — the top of the ladder stays put

The type gate checks that `Level` is exactly those three strings and that
`nextLevel("expert")` does not compile.

```
uv run dojo test typescript 05_literals_enums ex1
```

## Exercise 2 — freeze the lookup table

Edit `ex2/solution.ts`. Add `as const` to `TRACK_TITLES` so its properties keep
their literal types and become read-only, then implement `titleOf(track)`:

- `titleOf("typescript")` → `"TypeScript"`
- `titleOf("node")` → `"Node.js"`
- `titleOf("react")` → `"React"`

The type gate asserts that `TRACK_TITLES.typescript` is the literal type
`"TypeScript"` (not `string`) and that assigning to `TRACK_TITLES.node` is a
compile error. The body is one indexed lookup.

```
uv run dojo test typescript 05_literals_enums ex2
```

## Exercise 3 — an enum, on purpose

Edit `ex3/solution.ts`. Finish the `Status` enum — `Published = "published"` and
`Retired = "retired"` — and implement `statusLabel(status)`:

- `Status.Draft` → `"Draft (not visible)"`
- `Status.Published` → `"Published"`
- `Status.Retired` → `"Retired (archived)"`

Compare against the enum members (`case Status.Draft:`), not raw strings. The
type gate proves the nominal behaviour: `const sneaky: Status = "draft"` must
not compile, even though that is exactly the string the enum holds at runtime.

```
uv run dojo test typescript 05_literals_enums ex3
```

## Challenge — derive the union from the data (moderate)

Edit `challenge/solution.ts`. Two changes and one function:

1. Add `as const` to `HINT_TIERS`.
2. Replace `type Tier = string` with a type *derived* from the object's keys,
   using `keyof typeof` as shown in the Concept section.
3. Implement `sortTiers(tiers)`, returning a new array sorted by each tier's
   number: `sortTiers(["almost", "nudge", "approach"])` →
   `["nudge", "approach", "almost"]`.

Honest difficulty note: `keyof typeof` is formally lesson 07's material, and it
is here because `as const` without it is half a tool. The hints teach it. The
sort is lesson 01's copy-then-compare, one more time.

```
uv run dojo test typescript 05_literals_enums challenge
```

## Review — verdictIcon

Edit `review1/solution.ts`. Make `Verdict` a union of `"pass"`, `"fail"` and
`"skip"`, and implement `verdictIcon(verdict)` returning `"ok"`, `"x"` and
`"-"` respectively.

```
uv run dojo test typescript 05_literals_enums review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/05_literals_enums. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { nextLevel } from "./ex1/solution";
import { TRACK_TITLES, titleOf } from "./ex2/solution";
import { Status, statusLabel } from "./ex3/solution";
import { HINT_TIERS, sortTiers } from "./challenge/solution";
import { verdictIcon } from "./review1/solution";

describe("05_literals_enums", () => {
  test("ex1 - nextLevel() walks the ladder and stops at the top", () => {
    expect(nextLevel("beginner"), "beginner is followed by intermediate").toBe("intermediate");
    expect(nextLevel("intermediate"), "intermediate is followed by advanced").toBe("advanced");
    expect(
      nextLevel("advanced"),
      "advanced is the top of the ladder, so it stays put - reread README ex1",
    ).toBe("advanced");
  });

  test("ex2 - titleOf() looks a track up in the frozen table", () => {
    expect(titleOf("typescript"), "the table maps 'typescript' to 'TypeScript'").toBe("TypeScript");
    expect(titleOf("node"), "and 'node' to 'Node.js', dot included").toBe("Node.js");
    expect(titleOf("react"), "and 'react' to 'React'").toBe("React");
    expect(
      TRACK_TITLES.node,
      "as const changes types, not values - the object still holds real strings",
    ).toBe("Node.js");
  });

  test("ex3 - statusLabel() covers all three enum members", () => {
    expect(statusLabel(Status.Draft), "a draft is labelled 'Draft (not visible)'").toBe(
      "Draft (not visible)",
    );
    expect(statusLabel(Status.Published), "published is just 'Published'").toBe("Published");
    expect(statusLabel(Status.Retired), "retired is 'Retired (archived)'").toBe(
      "Retired (archived)",
    );
    expect(
      Status.Published,
      "a string enum member IS its string at runtime - that is why it survives " +
        "JSON and a database column",
    ).toBe("published");
  });

  test("challenge - sortTiers() orders by the tier number", () => {
    expect(
      sortTiers(["almost", "nudge", "approach"]),
      "sorted by the numbers in HINT_TIERS: nudge(1), approach(2), almost(3)",
    ).toEqual(["nudge", "approach", "almost"]);
    const input = ["approach", "nudge"] as const;
    expect(sortTiers(input), "a two-element list sorts the same way").toEqual([
      "nudge",
      "approach",
    ]);
    expect(
      HINT_TIERS.almost,
      "the numbers are still numbers at runtime; as const only changed the types",
    ).toBe(3);
  });

  test("review1 - verdictIcon() maps three verdicts to three icons", () => {
    expect(verdictIcon("pass"), "a pass shows 'ok'").toBe("ok");
    expect(verdictIcon("fail"), "a fail shows 'x'").toBe("x");
    expect(verdictIcon("skip"), "a skip shows '-'").toBe("-");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/05_literals_enums. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Level } from "./ex1/solution";
import { nextLevel } from "./ex1/solution";
import { TRACK_TITLES, titleOf } from "./ex2/solution";
import { Status, statusLabel } from "./ex3/solution";
import type { Tier } from "./challenge/solution";
import { sortTiers } from "./challenge/solution";
import type { Verdict } from "./review1/solution";

describe("05_literals_enums", () => {
  test("ex1 - Level has exactly three values", () => {
    expectTypeOf<Level>().toEqualTypeOf<"beginner" | "intermediate" | "advanced">();
    expectTypeOf(nextLevel("beginner")).toEqualTypeOf<Level>();
    // @ts-expect-error - "expert" is not a level in this course.
    nextLevel("expert");
  });

  test("ex2 - as const keeps the titles literal and readonly", () => {
    expectTypeOf(TRACK_TITLES.typescript).toEqualTypeOf<"TypeScript">();
    expectTypeOf(titleOf).parameters.toEqualTypeOf<[track: "typescript" | "node" | "react"]>();
    // @ts-expect-error - as const made every property readonly.
    TRACK_TITLES.node = "Node";
    // @ts-expect-error - "csharp" is not a track this table knows.
    titleOf("csharp");
  });

  test("ex3 - a string enum is nominal", () => {
    expectTypeOf(statusLabel).parameters.toEqualTypeOf<[status: Status]>();
    // @ts-expect-error - the raw string is not assignable to the enum type.
    const sneaky: Status = "draft";
    // @ts-expect-error - and the same is true at a call site.
    statusLabel("published");
  });

  test("challenge - Tier is derived from the object keys", () => {
    expectTypeOf<Tier>().toEqualTypeOf<"nudge" | "approach" | "almost">();
    expectTypeOf(sortTiers(["nudge"])).toEqualTypeOf<Tier[]>();
    // @ts-expect-error - "shout" is not a key of HINT_TIERS.
    sortTiers(["shout"]);
  });

  test("review1 - Verdict is a closed set", () => {
    expectTypeOf<Verdict>().toEqualTypeOf<"pass" | "fail" | "skip">();
    // @ts-expect-error - "error" is not one of the three verdicts.
    const wrong: Verdict = "error";
  });
});
```

In plain English:

- **ex1** checks the three transitions, then checks that `Level` is exactly the
  three-literal union — `string` fails that assertion even though every value is
  right.
- **ex2** checks three lookups and one raw property (proving `as const` changed
  no values), then asserts the property type is the literal `"TypeScript"` and
  that assigning to the table is rejected.
- **ex3** checks the three labels and that `Status.Published` is `"published"` at
  runtime; the type gate then proves the enum is nominal in two places.
- **challenge** sorts three tiers and two, and asserts `Tier` equals the derived
  union — a hand-written `type Tier = "nudge" | "approach" | "almost"` passes
  this too, so the honest check is whether you *derived* it.
- **review1** maps three verdicts to three icons.

## The teaching point

The move to make in real code is "stop typing this as `string`". A status, a
role, a size, a sort direction, an event name — every one of them is a closed
set, and every one of them is usually declared `string` because that is what
JavaScript had. Changing it to a literal union costs one line and immediately
turns a class of typos into compile errors, makes autocomplete useful, and lets
`switch` tell you when you missed a case.

The second move is `as const` on configuration objects, and then deriving types
from them rather than repeating them. A hand-written union next to the object it
describes is two sources of truth that agree only until someone is in a hurry.
`keyof typeof` makes the object the single source, which is why the next two
lessons — generics, then `keyof` and friends properly — are where TypeScript
starts to feel like a tool rather than a tax.

Next: **06_generics_1**, where a function stops caring what type it is holding
without losing track of it.
