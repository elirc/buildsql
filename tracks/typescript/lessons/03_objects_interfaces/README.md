# 03 — Objects and interfaces

Almost nothing in a real program is a lone `number`. It is a lesson, a draft, a
set of options, a row from an API — an object with named parts, half of which
are optional, most of which nobody should be mutating. Describing those shapes
is what you will spend most of your TypeScript life doing.

Here is the thing that surprises people arriving from C# or Java: TypeScript
does not care what your type is *called*. It cares what it *contains*. Two
types with the same members are the same type, even if they were declared in
different files by different people who never met. This is **structural
typing**, and it is the single largest difference between TypeScript and the
nominal type systems it superficially resembles.

That one rule explains a great deal of day-to-day behaviour: why an object
literal you never annotated satisfies an interface, why "it just worked" when
you passed something from another library, and — the flip side — why a
`UserId` type alias for `string` does not stop you passing a product ID.

## Concept — shapes, not names

An interface names a shape:

```ts
interface Track {
  name: string;
  lessons: number;
}

function describe(track: Track): string {
  return `${track.name} (${track.lessons})`;
}

const anything = { name: "react", lessons: 12, colour: "blue" };
describe(anything);   // fine: it has everything Track asks for
```

That last call is structural typing in one line. `anything` was never declared
as a `Track`; it has the members a `Track` needs, so it is one. The extra
`colour` is ignored — with one important exception:

```ts
describe({ name: "react", lessons: 12, colour: "blue" });
//                                     ^ Object literal may only specify known properties
```

Passing a *fresh object literal* directly triggers **excess property
checking**, a deliberate special case that catches typos where structural
typing would otherwise shrug. Assign the literal to a variable first and the
check goes away, which is a genuinely confusing rule until you know it exists.
Its real value is catching `{ retires: 2 }` when you meant `retries`.

**Optional members.** A `?` means the property may be absent, and reading it
gives you `T | undefined`:

```ts
interface Lesson {
  slug: string;
  challenge?: boolean;   // boolean | undefined
}
```

**Readonly members.** `readonly` means the property may not be reassigned
*through this type*. It is compile-time only — no `Object.freeze` is involved —
and it does not go deep: `readonly tags: string[]` still lets you `push`. For
that you need `readonly tags: readonly string[]`, which is two different
promises stacked.

**Index signatures.** When the keys come from data rather than from you:

```ts
interface Tally {
  [slug: string]: number;
}
```

Every string key now reads as a `number`. TypeScript takes that literally and
will not warn you that `tally.nope` is `undefined` at runtime — an index
signature is a promise you are making, not one the compiler verifies.

**`interface` vs `type`.** This is an interview question in every TypeScript
screen, so learn the honest answer. They are nearly interchangeable for object
shapes. `interface` can be reopened and merged (declare it twice and the
members combine — how libraries let you augment their types) and reads better
in error messages; `type` can express things an interface cannot — unions,
tuples, mapped and conditional types, primitives:

```ts
type Level = "beginner" | "advanced";   // no interface can say this
type Pair = [number, number];
interface Lesson { slug: string }       // reopenable, extendable, mergeable
```

The rule of thumb most teams settle on: `interface` for object shapes you
expect to extend, `type` for everything else. What you should never say in an
interview is "interfaces are for classes" — that is Java's answer, not this
language's.

**Spread, and why it matters here.** `{ ...draft, title }` builds a new object
with every own enumerable property of `draft`, then overrides `title`. Later
keys win, which is why order matters, and the copy is *shallow* — nested
objects and arrays are shared, not cloned.

## Exercise 1 — finish the interface, then use it

Edit `ex1/solution.ts`. Complete the `Lesson` interface so it describes the
objects the gate passes, then implement `describeLesson(lesson)`:

- `{ slug: "02_functions", title: "Functions", exercises: 4, challenge: true }`
  → `"02_functions: Functions - 4 exercises + challenge"`
- `{ slug: "05_literals_enums", title: "Literals", exercises: 3 }`
  → `"05_literals_enums: Literals - 3 exercises"`
- `{ slug: "09_mapped", title: "Mapped", exercises: 4, challenge: false }`
  → `"09_mapped: Mapped - 4 exercises"`

Three required members and one optional one — the third case is what tells you
which is which. Note that a missing `challenge` and `challenge: false` render
identically.

```
uv run dojo test typescript 03_objects_interfaces ex1
```

## Exercise 2 — a draft nobody can vandalise

Edit `ex2/solution.ts`. Mark every member of `Draft` as read-only — including
the contents of `tags` — and implement `renameDraft(draft, title)`, which
returns a **new** draft with the new title and everything else copied across.

The gate checks that the object you were handed still has its original title
afterwards, and the type gate checks that `draft.id = "d2"` and
`draft.tags.push("late")` both fail to compile.

```
uv run dojo test typescript 03_objects_interfaces ex2
```

## Exercise 3 — keys you do not know in advance

Edit `ex3/solution.ts`. Change `Tally` into a lookup from lesson slug to count,
then implement `countAttempts(slugs)`:

- `countAttempts(["01_types", "02_functions", "01_types"])`
  → `{ "01_types": 2, "02_functions": 1 }`
- `countAttempts([])` → `{}`

The slugs come from data, so no interface can list them. The first sighting of
a slug has no entry yet — decide what a missing count is worth before you add
one to it.

```
uv run dojo test typescript 03_objects_interfaces ex3
```

## Exercise 4 — optional in, required out

Edit `ex4/solution.ts`. `RunOptions` is the shape a caller may supply, and
every member of it is optional. Finish `ResolvedOptions` — the same three
members with no holes — and implement `resolveOptions(options)`:

- `resolveOptions({})` → `{ retries: 1, verbose: false, label: "run" }`
- `resolveOptions({ verbose: true, label: "nightly" })`
  → `{ retries: 1, verbose: true, label: "nightly" }`
- `resolveOptions({ retries: 0 })` → `{ retries: 0, verbose: false, label: "run" }`

That last case is the exercise. An explicit `0` is a real answer and must
survive; so would an explicit `false`. Pick the fallback operator that knows
the difference between "absent" and "falsy".

```
uv run dojo test typescript 03_objects_interfaces ex4
```

## Challenge — summarise a curriculum (moderate)

Edit `challenge/solution.ts`. Finish the `Part` and `PartSummary` interfaces
and implement `summarise(parts)`, which produces one summary per part, in
order:

```ts
summarise([
  { title: "Part 1", lessons: [{ slug: "01_types", exercises: 4 },
                               { slug: "02_functions", exercises: 4 }] },
  { title: "Part 2", lessons: [{ slug: "06_generics_1", exercises: 3 }] },
  { title: "Part 3", lessons: [] },
]);
// [ { title: "Part 1", lessonCount: 2, exerciseCount: 8 },
//   { title: "Part 2", lessonCount: 1, exerciseCount: 3 },
//   { title: "Part 3", lessonCount: 0, exerciseCount: 0 } ]
```

Honest difficulty note: the nesting is the only new thing, and the empty part
is the case that decides whether your `reduce` was written carefully.

```
uv run dojo test typescript 03_objects_interfaces challenge
```

## Review — greetLearner

Edit `review1/solution.ts`. Finish the `Learner` interface (a name, a streak,
and an optional nickname) and implement `greetLearner(learner)`:

- `{ name: "Ada", streak: 3 }` → `"Ada - 3 day streak"`
- `{ name: "Grace", nickname: "Amazing Grace", streak: 12 }`
  → `"Amazing Grace - 12 day streak"`
- `{ name: "Eli", streak: 0 }` → `"Eli - no streak yet"`

```
uv run dojo test typescript 03_objects_interfaces review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/03_objects_interfaces. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { describeLesson } from "./ex1/solution";
import { renameDraft } from "./ex2/solution";
import { countAttempts } from "./ex3/solution";
import { resolveOptions } from "./ex4/solution";
import { summarise } from "./challenge/solution";
import { greetLearner } from "./review1/solution";

describe("03_objects_interfaces", () => {
  test("ex1 - describeLesson() renders a lesson, challenge or not", () => {
    expect(
      describeLesson({ slug: "02_functions", title: "Functions", exercises: 4, challenge: true }),
      "the full form is '<slug>: <title> - <n> exercises + challenge'",
    ).toBe("02_functions: Functions - 4 exercises + challenge");
    expect(
      describeLesson({ slug: "05_literals_enums", title: "Literals", exercises: 3 }),
      "with no challenge property at all the suffix is dropped entirely",
    ).toBe("05_literals_enums: Literals - 3 exercises");
    expect(
      describeLesson({ slug: "09_mapped", title: "Mapped", exercises: 4, challenge: false }),
      "challenge: false renders exactly like a missing challenge - a truthiness " +
        "check handles both, and the property has to be optional to accept the middle case",
    ).toBe("09_mapped: Mapped - 4 exercises");
  });

  test("ex2 - renameDraft() copies instead of mutating", () => {
    const draft = { id: "d1", title: "First pass", tags: ["draft", "ts"] };
    const renamed = renameDraft(draft, "Second pass");
    expect(renamed.title, "the returned draft carries the new title").toBe("Second pass");
    expect(renamed.id, "everything else is copied across unchanged").toBe("d1");
    expect(renamed.tags, "including the tags").toEqual(["draft", "ts"]);
    expect(
      draft.title,
      "the draft you were handed still says 'First pass' - spread into a new " +
        "object, do not assign into the old one (README ex2)",
    ).toBe("First pass");
    expect(renamed, "the result is a different object, not the same reference").not.toBe(draft);
  });

  test("ex3 - countAttempts() tallies by slug", () => {
    expect(
      countAttempts(["01_types", "02_functions", "01_types"]),
      "two attempts at 01_types, one at 02_functions",
    ).toEqual({ "01_types": 2, "02_functions": 1 });
    expect(
      countAttempts([]),
      "no attempts means an empty object, not undefined and not { total: 0 }",
    ).toEqual({});
    expect(
      countAttempts(["a", "a", "a"]).a,
      "the third sighting of 'a' makes 3 - a missing count starts at 0",
    ).toBe(3);
  });

  test("ex4 - resolveOptions() fills every hole", () => {
    expect(
      resolveOptions({}),
      "an empty options object gets all three defaults: 1, false, 'run'",
    ).toEqual({ retries: 1, verbose: false, label: "run" });
    expect(
      resolveOptions({ verbose: true, label: "nightly" }),
      "supplied values win; the one you left out still gets its default",
    ).toEqual({ retries: 1, verbose: true, label: "nightly" });
    expect(
      resolveOptions({ retries: 0 }),
      "an explicit 0 means zero retries and must survive - `||` would turn it " +
        "into 1, `??` would not (README ex4)",
    ).toEqual({ retries: 0, verbose: false, label: "run" });
  });

  test("challenge - summarise() counts lessons and exercises per part", () => {
    const parts = [
      {
        title: "Part 1",
        lessons: [
          { slug: "01_types", exercises: 4 },
          { slug: "02_functions", exercises: 4 },
        ],
      },
      { title: "Part 2", lessons: [{ slug: "06_generics_1", exercises: 3 }] },
      { title: "Part 3", lessons: [] },
    ];
    expect(
      summarise(parts),
      "one summary per part, in the same order, with both counts computed from " +
        "the nested lessons array",
    ).toEqual([
      { title: "Part 1", lessonCount: 2, exerciseCount: 8 },
      { title: "Part 2", lessonCount: 1, exerciseCount: 3 },
      { title: "Part 3", lessonCount: 0, exerciseCount: 0 },
    ]);
  });

  test("review1 - greetLearner() prefers the nickname", () => {
    expect(
      greetLearner({ name: "Ada", streak: 3 }),
      "no nickname, so the real name is shown: 'Ada - 3 day streak'",
    ).toBe("Ada - 3 day streak");
    expect(
      greetLearner({ name: "Grace", nickname: "Amazing Grace", streak: 12 }),
      "a nickname replaces the name entirely",
    ).toBe("Amazing Grace - 12 day streak");
    expect(
      greetLearner({ name: "Eli", streak: 0 }),
      "a zero streak has its own wording - reread README review1",
    ).toBe("Eli - no streak yet");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/03_objects_interfaces. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { describeLesson } from "./ex1/solution";
import type { Draft } from "./ex2/solution";
import { renameDraft } from "./ex2/solution";
import type { Tally } from "./ex3/solution";
import { resolveOptions } from "./ex4/solution";
import type { Part } from "./challenge/solution";
import { summarise } from "./challenge/solution";
import type { Learner } from "./review1/solution";
import { greetLearner } from "./review1/solution";

describe("03_objects_interfaces", () => {
  test("ex1 - Lesson has three required members and one optional one", () => {
    const lesson: Lesson = { slug: "02_functions", title: "Functions", exercises: 4 };
    expectTypeOf(lesson.title).toEqualTypeOf<string>();
    expectTypeOf(lesson.exercises).toEqualTypeOf<number>();
    expectTypeOf(lesson.challenge).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(describeLesson).returns.toEqualTypeOf<string>();
    // @ts-expect-error - exercises is a count, not a string.
    const wrong: Lesson = { slug: "x", title: "y", exercises: "4" };
  });

  test("ex2 - Draft is readonly all the way down", () => {
    const draft: Draft = { id: "d1", title: "First pass", tags: ["draft"] };
    expectTypeOf(renameDraft(draft, "next")).toEqualTypeOf<Draft>();
    // @ts-expect-error - id is readonly, so this assignment must not compile.
    draft.id = "d2";
    // @ts-expect-error - tags is a readonly array, so push is not on it.
    draft.tags.push("late");
  });

  test("ex3 - Tally accepts any slug as a key", () => {
    const tally: Tally = { "01_types": 2, "02_functions": 1 };
    expectTypeOf(tally["anything at all"]).toEqualTypeOf<number>();
    // @ts-expect-error - the values are counts, so a string is not one.
    const wrong: Tally = { "01_types": "2" };
  });

  test("ex4 - ResolvedOptions has no optional members left", () => {
    const resolved = resolveOptions({});
    expectTypeOf(resolved.retries).toEqualTypeOf<number>();
    expectTypeOf(resolved.verbose).toEqualTypeOf<boolean>();
    expectTypeOf(resolved.label).toEqualTypeOf<string>();
    // @ts-expect-error - a misspelled option is caught by the excess property check.
    resolveOptions({ retires: 2 });
  });

  test("challenge - Part nests lessons, PartSummary counts them", () => {
    const part: Part = { title: "Part 1", lessons: [{ slug: "01_types", exercises: 4 }] };
    const summary = summarise([part])[0];
    expectTypeOf(summary.title).toEqualTypeOf<string>();
    expectTypeOf(summary.lessonCount).toEqualTypeOf<number>();
    expectTypeOf(summary.exerciseCount).toEqualTypeOf<number>();
  });

  test("review1 - the Learner nickname is optional", () => {
    const learner: Learner = { name: "Ada", streak: 3 };
    expectTypeOf(learner.streak).toEqualTypeOf<number>();
    expectTypeOf(learner.nickname).toEqualTypeOf<string | undefined>();
    expectTypeOf(greetLearner).returns.toEqualTypeOf<string>();
  });
});
```

In plain English:

- **ex1** renders three lessons, then reads `lesson.challenge` at the type level
  and insists it is `boolean | undefined` — a required member fails that
  assertion even though the strings are right.
- **ex2** checks the copy, checks the original, and checks that the result is a
  different object. The two `@ts-expect-error` lines are the type half: they
  pass only if the assignment and the `push` are *rejected*.
- **ex3** tallies, handles the empty case, and reads an arbitrary key at the
  type level — `tally["anything at all"]` must be a `number`, which only an
  index signature can promise.
- **ex4** exercises the `0` case that separates `??` from `||`, and the
  misspelled-option probe that excess property checking catches.
- **challenge** builds three summaries including an empty part.
- **review1** covers the nickname fallback and the zero-streak wording.

## The teaching point

Two habits from this lesson survive into every codebase you will touch.

The first is describing data at the boundary and letting inference carry it
inward. `resolveOptions` is the shape of almost every configurable thing ever
written: a wide, forgiving input type; one function that fills the holes; and a
narrow, complete type that the rest of the program can rely on without a single
`?.` or `??`. Doing that work once, at the edge, is what stops optional-chaining
from spreading through a codebase like damp.

The second is `readonly` as documentation with teeth. Nothing in ex2 changed at
runtime — the emitted JavaScript is identical — but a whole class of "who
mutated my object" bugs became impossible to write. That is the trade
TypeScript keeps offering: no runtime cost, no runtime protection, and a
compiler that refuses to let you contradict yourself.

Next: **04_unions_narrowing**, where a value gets to be one of several things
and the compiler makes you prove which one before you touch it.
