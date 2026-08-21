# i3 — Interview rapid-fire

Five short rounds over the five concepts that come up most often, in shapes you
have not seen before. Nothing here is new material — that is the point. This is
the last lesson of the track, and its job is to make the ⭐⭐⭐ answers automatic.

Then it keeps doing that job. Every exercise in this lesson is fresh phrasing of
something you already learned, and `review1` feeds the spaced-review scheduler,
so `dojo review` brings this material back at three days, a week, three weeks
and two months. The ladder is the mechanism; you just have to keep showing up.

Give each round the time box in its heading. If one takes longer, the note to
write down is *which* part cost the time — the type, the edge case, or the
JavaScript.

## Round 1 — `unknown` in, narrowed out (60 seconds)

Edit `ex1/solution.ts`. Change the `any` to `unknown` and implement
`toNumber(value)`:

- `toNumber(42)` → `42`; `toNumber("42")` → `42`; `toNumber("3.5")` → `3.5`
- `toNumber("")`, `toNumber("   ")`, `toNumber("abc")` → `null`
- `toNumber(NaN)` → `null` — `typeof NaN` is `"number"`, and it is not a usable one
- `toNumber(null)`, `toNumber({ value: 1 })` → `null`

`Number("")` is `0`, which is the trap this round is built around.

```
uv run dojo test typescript i3_interview_rapidfire ex1
```

## Round 2 — close the union (90 seconds)

Edit `ex2/solution.ts`. `Level` has four members and `levelBadge` handles two,
hidden by a catch-all `default`. Add the missing cases and replace the default
with an `assertNever` call:

- `"beginner"` → `"*"`, `"intermediate"` → `"**"`, `"advanced"` → `"***"`,
  `"master"` → `"****"`

```
uv run dojo test typescript i3_interview_rapidfire ex2
```

## Round 3 — constrain the key (90 seconds)

Edit `ex3/solution.ts`. Rewrite `sortByKey` with a generic element type and a
key constrained to that element's keys, sorting a **copy** ascending:

- `sortByKey(learners, "streak")` → Grace(3), Eli(7), Ada(12)
- `sortByKey(learners, "name")` → Ada, Eli, Grace
- the input array is unchanged afterwards
- `sortByKey(learners, "nickname")` must not compile

```
uv run dojo test typescript i3_interview_rapidfire ex3
```

## Round 4 — write the utility type (90 seconds)

Edit `ex4/solution.ts`. Implement two standard-library types from scratch and
one runtime helper:

- `MyNonNullable<T>` — `MyNonNullable<string | null | undefined>` is `string`
- `MyReturnType<F>` — `MyReturnType<() => string>` is `string`
- `compact(items)` — drops `null` and `undefined` and **nothing else**:
  `compact([1, null, 2, undefined, 3])` → `[1, 2, 3]`, and
  `compact([0, "", false, null])` → `[0, "", false]`

The typed `compact` needs a type guard in the `filter` predicate; a plain
boolean predicate proves nothing to the compiler.

```
uv run dojo test typescript i3_interview_rapidfire ex4
```

## Review — `satisfies`, one more time (60 seconds)

Edit `review1/solution.ts`. The `Record<string, ...>` annotation on `ROUTES`
gave the object an index signature and widened every value. Replace it with
`as const satisfies ...`, then implement `describeRoute(name)`:

- `describeRoute("listLessons")` → `"GET /lessons"`
- `describeRoute("submitAttempt")` → `"POST /attempts"`
- `keyof typeof ROUTES` must be `"listLessons" | "submitAttempt"`, and
  `ROUTES.listLessons.path` must be the literal `"/lessons"`

```
uv run dojo test typescript i3_interview_rapidfire review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/i3_interview_rapidfire. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { toNumber } from "./ex1/solution";
import { levelBadge } from "./ex2/solution";
import { sortByKey } from "./ex3/solution";
import { compact } from "./ex4/solution";
import { ROUTES, describeRoute } from "./review1/solution";

describe("i3_interview_rapidfire", () => {
  test("ex1 - toNumber() narrows unknown into a number or null", () => {
    expect(toNumber(42), "a finite number comes back as itself").toBe(42);
    expect(toNumber("42"), "a numeric string parses").toBe(42);
    expect(toNumber("3.5"), "decimals too").toBe(3.5);
    expect(toNumber(""), "an empty string is not a number - Number('') is 0, which is the trap").toBeNull();
    expect(toNumber("   "), "and neither is whitespace").toBeNull();
    expect(toNumber("abc"), "a non-numeric string is null, not NaN").toBeNull();
    expect(toNumber(Number.NaN), "NaN is a number to typeof and not one here").toBeNull();
    expect(toNumber(null), "null, undefined, objects: all null").toBeNull();
    expect(toNumber({ value: 1 }), "an object is not a number").toBeNull();
  });

  test("ex2 - levelBadge() covers all four levels", () => {
    expect(levelBadge("beginner"), "one star").toBe("*");
    expect(levelBadge("intermediate"), "two stars").toBe("**");
    expect(
      levelBadge("advanced"),
      "three stars - the shipped code returns '?' because of a catch-all default",
    ).toBe("***");
    expect(levelBadge("master"), "four stars, and the default should now be unreachable").toBe(
      "****",
    );
  });

  test("ex3 - sortByKey() sorts a copy by a named property", () => {
    const learners = [
      { name: "Grace", streak: 3 },
      { name: "Ada", streak: 12 },
      { name: "Eli", streak: 7 },
    ];
    expect(
      sortByKey(learners, "streak").map((l) => l.name),
      "ascending by streak: Grace(3), Eli(7), Ada(12)",
    ).toEqual(["Grace", "Eli", "Ada"]);
    expect(
      sortByKey(learners, "name").map((l) => l.name),
      "strings compare alphabetically with the same comparator",
    ).toEqual(["Ada", "Eli", "Grace"]);
    expect(
      learners.map((l) => l.name),
      "the input array is untouched - sort() mutates, so copy first",
    ).toEqual(["Grace", "Ada", "Eli"]);
  });

  test("ex4 - compact() drops null and undefined", () => {
    expect(
      compact([1, null, 2, undefined, 3]),
      "only null and undefined go; everything else stays, in order",
    ).toEqual([1, 2, 3]);
    expect(
      compact([0, "", false, null]),
      "falsy is not the same question as nullish - 0, '' and false all survive",
    ).toEqual([0, "", false]);
    expect(compact([]), "an empty list stays empty").toEqual([]);
  });

  test("review1 - describeRoute() reads the frozen route table", () => {
    expect(describeRoute("listLessons"), "method, a space, then the path").toBe("GET /lessons");
    expect(describeRoute("submitAttempt"), "and the other one").toBe("POST /attempts");
    expect(ROUTES.listLessons.path, "as const changed types, not values").toBe("/lessons");
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/i3_interview_rapidfire. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { toNumber } from "./ex1/solution";
import type { Level } from "./ex2/solution";
import { levelBadge } from "./ex2/solution";
import { sortByKey } from "./ex3/solution";
import type { MyNonNullable, MyReturnType } from "./ex4/solution";
import { compact } from "./ex4/solution";
import { ROUTES } from "./review1/solution";

interface Learner {
  name: string;
  streak: number;
}

describe("i3_interview_rapidfire", () => {
  test("ex1 - toNumber() takes unknown, not any", () => {
    expectTypeOf(toNumber).parameters.toEqualTypeOf<[value: unknown]>();
    expectTypeOf(toNumber("42")).toEqualTypeOf<number | null>();
  });

  test("ex2 - levelBadge() still accepts exactly four levels", () => {
    expectTypeOf(levelBadge).parameters.toEqualTypeOf<[level: Level]>();
    // @ts-expect-error - "expert" is not a level.
    levelBadge("expert");
  });

  test("ex3 - sortByKey() constrains the key and keeps the element type", () => {
    const learners: Learner[] = [{ name: "Ada", streak: 12 }];
    expectTypeOf(sortByKey(learners, "streak")).toEqualTypeOf<Learner[]>();
    // @ts-expect-error - "nickname" is not a key of Learner.
    sortByKey(learners, "nickname");
  });

  test("ex4 - the two utility types match the built-ins", () => {
    expectTypeOf<MyNonNullable<string | null | undefined>>().toEqualTypeOf<string>();
    expectTypeOf<MyNonNullable<number | null>>().toEqualTypeOf<number>();
    expectTypeOf<MyReturnType<() => string>>().toEqualTypeOf<string>();
    expectTypeOf<MyReturnType<(a: number) => Promise<number>>>().toEqualTypeOf<Promise<number>>();
    expectTypeOf(compact([1, null, 2])).toEqualTypeOf<number[]>();
    expectTypeOf(compact(["a", undefined])).toEqualTypeOf<string[]>();
  });

  test("review1 - the route table kept its literal types", () => {
    expectTypeOf<keyof typeof ROUTES>().toEqualTypeOf<"listLessons" | "submitAttempt">();
    expectTypeOf(ROUTES.listLessons.path).toEqualTypeOf<"/lessons">();
    expectTypeOf(ROUTES.submitAttempt.method).toEqualTypeOf<"POST">();
    // @ts-expect-error - as const made every member readonly.
    ROUTES.listLessons.path = "/other";
  });
});
```

In plain English:

- **ex1** throws nine values at your function, including the three that separate
  a careful implementation from a quick one (`""`, `"   "`, `NaN`), and the type
  gate insists the parameter is `unknown`.
- **ex2** checks all four badges; the third is the one the shipped code gets
  wrong, and the `@ts-expect-error` proves the union is still closed.
- **ex3** sorts by a numeric key and a string key, then checks the input was not
  mutated. The type gate proves the key is constrained and the element type
  survives.
- **ex4** checks that only nullish values are dropped — `0`, `""` and `false`
  stay — then compares both hand-written utility types against the shapes the
  built-ins produce, and proves `compact` narrows the element type.
- **review1** checks both rendered routes and asserts `keyof typeof ROUTES`,
  two literal member types, and that the table is read-only.

## The teaching point

Five rounds, five concepts, and every one of them was already in this track:
`unknown` at the boundary, exhaustiveness with `never`, a constrained generic
with `keyof`, a utility type written from scratch, and `satisfies` on a
configuration object. If any of them needed a hint, the lesson to redo is named
in that exercise's reading section.

That is the whole design of this part. Interview readiness is not a separate
body of knowledge — it is the same knowledge, retrieved quickly and explained
clearly, which only comes from spaced repetition. You have finished the track;
now let `dojo review` do the rest, and go and be interviewed.

Where to go next: **node**, **react**, **csharp** and **dotnet** all have the
same shape, and the SQL track's Part 9 has its own interview part. Run
`uv run dojo tracks` to see where you stand across all six.
