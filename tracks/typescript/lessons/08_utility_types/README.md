# 08 — Utility types

Every type you have written so far, you wrote out. Lesson 03's `RunOptions` and
`ResolvedOptions` were the same three members typed twice — once optional, once
required — and the moment someone adds a fourth, one of them is wrong.

TypeScript ships a small standard library of **utility types** that derive one
type from another: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`,
`Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`. They
are not compiler magic. Every one of them is a few lines of ordinary type code
built from `keyof`, `T[K]`, and one construct you have not formally met yet —
the **mapped type**, which this README teaches inline because you cannot
implement `Partial` without it.

The habit to leave with: describe one type, derive the rest.

## Concept — a `for` loop over keys

A mapped type walks the keys of one type and produces a member for each:

```ts
type Copy<T> = { [K in keyof T]: T[K] };          // an exact clone of T
type Optional<T> = { [K in keyof T]?: T[K] };     // every member optional
type Frozen<T> = { readonly [K in keyof T]: T[K] };
```

`[K in keyof T]` is the loop; `T[K]` is the value type at that key; `?` and
`readonly` are modifiers you can add (and, with `-?` and `-readonly`, remove).
`Partial`, `Required` and `Readonly` are exactly that pattern with one modifier
each — which is why writing them yourself is a five-token exercise rather than a
feat.

The key set does not have to be `keyof T`. Any union of keys works, and that is
what `Pick` and `Record` are built on:

```ts
type Record<K extends keyof any, V> = { [P in K]: V };

type Board = Record<"pass" | "fail", number>;   // { pass: number; fail: number }
```

`Omit` is `Pick` over the keys you did *not* name, and the subtraction is done
by `Exclude`, which filters a union:

```ts
type Rest = Exclude<"id" | "email" | "secret", "secret">;   // "id" | "email"
```

Lesson 09 explains how `Exclude` is implemented; here it is enough to know what
it does.

The three function helpers work the same way but read a *function* type apart:

```ts
type Loader = (id: string) => Promise<User>;

type A = Parameters<Loader>;              // [id: string]
type B = ReturnType<Loader>;              // Promise<User>
type C = Awaited<ReturnType<Loader>>;     // User
```

`Awaited<T>` unwraps a promise — recursively, and harmlessly on a non-promise —
which makes it the right way to say "whatever this async function eventually
produces".

Worked example, putting several together:

```ts
interface Lesson {
  slug: string;
  title: string;
  exercises: number;
}

type LessonDraft = Partial<Lesson>;                  // everything optional
type LessonCard = Pick<Lesson, "slug" | "title">;    // just two members
type LessonIndex = Record<string, Lesson>;           // a lookup table
type LessonWithoutTitle = Omit<Lesson, "title">;

function save(draft: LessonDraft): Lesson { /* ... */ }
```

None of these repeat a member name that is already written down once. Rename
`title` in `Lesson` and every derived type follows.

## Exercise 1 — Partial

Edit `ex1/solution.ts`. Change `applyPatch`'s second parameter so a patch may
name any subset of the object's members, and implement it:

- `applyPatch({retries: 1, label: "run", verbose: false}, {label: "nightly"})`
  → `{retries: 1, label: "nightly", verbose: false}`
- `applyPatch(base, {verbose: true, retries: 0})` → the `0` survives
- `applyPatch(base, {label: undefined})` → the base's label survives: a patch
  value of `undefined` means "no opinion"
- the base object itself is never modified

That third rule is why `{ ...base, ...patch }` is not quite the answer.

```
uv run dojo test typescript 08_utility_types ex1
```

## Exercise 2 — Pick and Omit

Edit `ex2/solution.ts`. Derive both aliases from `User` and implement both
functions:

- `PublicUser` is a `User` without `passwordHash`
- `UserSummary` is exactly `id` and `email`
- `toPublicUser(user)` returns an object with **no** `passwordHash` key —
  `"passwordHash" in result` must be `false`
- `toSummary(user)` returns the two-member summary
- neither modifies its input

```
uv run dojo test typescript 08_utility_types ex2
```

## Exercise 3 — write two of them yourself

Edit `ex3/solution.ts`. Implement `MyPartial<T>` and `MyPick<T, K>` as mapped
types, then implement `pickKeys(source, keys)` returning `MyPick<T, K>`:

- `pickKeys(user, ["id", "email"])` → `{ id: "u1", email: "ada@example.com" }`
- `pickKeys(user, [])` → `{}`
- only the named keys appear — no `undefined` placeholders

The type gate checks your two types against the shapes the built-ins produce.
For the body you will want `{} as MyPick<T, K>` as the accumulator; the reading
explains why an honest version is so painful.

```
uv run dojo test typescript 08_utility_types ex3
```

## Exercise 4 — types derived from functions

Edit `ex4/solution.ts`. Two changes:

1. `Loaded` should be what the loader's promise resolves to —
   `{ id: string; title: string }`, not the `Promise` wrapping it.
2. Make `once` generic so the function it returns has the same parameters and
   return type as the one it was given.

```ts
const memo = once((a: number, b: number) => a + b);
memo(2, 3);     // 5, and the wrapped function ran
memo(10, 10);   // 5 again - the first result is cached; the function did not run
memo("2", 3);   // must not compile
```

```
uv run dojo test typescript 08_utility_types ex4
```

## Challenge — MyOmit and the runtime half (harder)

Edit `challenge/solution.ts`. Implement `MyOmit<T, K>` as a mapped type over the
*remaining* keys — `Exclude` is allowed, and the Concept section shows what it
does — then implement `omitKeys(source, keys)`:

- `omitKeys(user, ["passwordHash", "createdAt"])` → `{ id, email }`, and
  `"passwordHash" in result` is `false`
- `omitKeys(user, [])` → a copy of everything
- the source object is untouched

Honest difficulty note: the type is one line; the *runtime* half is where this
bites. `delete obj.prop` only compiles for optional properties, so you will need
one deliberate, documented cast — which is a real lesson about where the type
system's honesty ends.

```
uv run dojo test typescript 08_utility_types challenge
```

## Review — Record

Edit `review1/solution.ts`. Replace the index signature on `ScoreBoard` with a
`Record` over the three verdicts, then implement `tallyVerdicts(verdicts)`:

- `tallyVerdicts(["pass", "fail", "pass"])` → `{ pass: 2, fail: 1, skip: 0 }`
- `tallyVerdicts([])` → `{ pass: 0, fail: 0, skip: 0 }`

Every verdict appears in the result, even at zero — and with `Record` the
compiler is what makes sure of it.

```
uv run dojo test typescript 08_utility_types review1
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/08_utility_types. Quoted verbatim in README.md.
import { describe, expect, test, vi } from "vitest";

import { applyPatch } from "./ex1/solution";
import { toPublicUser, toSummary } from "./ex2/solution";
import { pickKeys } from "./ex3/solution";
import { once } from "./ex4/solution";
import { omitKeys } from "./challenge/solution";
import { tallyVerdicts } from "./review1/solution";

const user = {
  id: "u1",
  email: "ada@example.com",
  passwordHash: "not-a-real-hash",
  createdAt: "2026-01-01",
};

describe("08_utility_types", () => {
  test("ex1 - applyPatch() overrides only what the patch names", () => {
    const base = { retries: 1, label: "run", verbose: false };
    expect(
      applyPatch(base, { label: "nightly" }),
      "one member replaced, the rest copied across",
    ).toEqual({ retries: 1, label: "nightly", verbose: false });
    expect(
      applyPatch(base, { verbose: true, retries: 0 }),
      "an explicit 0 is a real value and must land in the result",
    ).toEqual({ retries: 0, label: "run", verbose: true });
    expect(
      applyPatch(base, { label: undefined }),
      "a patch value of undefined means 'no opinion', so the base survives - " +
        "this is the case a plain { ...base, ...patch } gets wrong (README ex1)",
    ).toEqual({ retries: 1, label: "run", verbose: false });
    expect(base.label, "the base object itself is never modified").toBe("run");
  });

  test("ex2 - toPublicUser() and toSummary() drop what they should", () => {
    const publicUser = toPublicUser(user);
    expect(
      "passwordHash" in publicUser,
      "the password hash must not be on the public object at all - not " +
        "undefined, not empty: absent",
    ).toBe(false);
    expect(publicUser, "everything else survives").toEqual({
      id: "u1",
      email: "ada@example.com",
      createdAt: "2026-01-01",
    });
    expect(toSummary(user), "the summary is exactly id and email").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(user.passwordHash, "the input is not modified on the way through").toBe(
      "not-a-real-hash",
    );
  });

  test("ex3 - pickKeys() copies just the named members", () => {
    expect(pickKeys(user, ["id", "email"]), "two keys in, two members out").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(pickKeys(user, []), "no keys means an empty object").toEqual({});
    expect(
      Object.keys(pickKeys(user, ["createdAt"])),
      "only the named key is present - no undefined placeholders",
    ).toEqual(["createdAt"]);
  });

  test("ex4 - once() calls through exactly one time", () => {
    const spy = vi.fn((a: number, b: number) => a + b);
    const memo = once(spy);
    expect(memo(2, 3), "the first call runs the function and returns its result").toBe(5);
    expect(
      memo(10, 10),
      "every later call returns the FIRST result, whatever the arguments",
    ).toBe(5);
    expect(spy, "the wrapped function ran exactly once").toHaveBeenCalledTimes(1);
  });

  test("challenge - omitKeys() removes the named members", () => {
    const trimmed = omitKeys(user, ["passwordHash", "createdAt"]);
    expect(trimmed, "two keys removed, two kept").toEqual({
      id: "u1",
      email: "ada@example.com",
    });
    expect(
      "passwordHash" in trimmed,
      "removed means absent - a delete, not an assignment to undefined",
    ).toBe(false);
    expect(omitKeys(user, []), "omitting nothing returns a copy of everything").toEqual(user);
    expect(user.createdAt, "the source object is untouched").toBe("2026-01-01");
  });

  test("review1 - tallyVerdicts() always returns all three counters", () => {
    expect(
      tallyVerdicts(["pass", "fail", "pass"]),
      "two passes, one fail, and skip is present at zero",
    ).toEqual({ pass: 2, fail: 1, skip: 0 });
    expect(
      tallyVerdicts([]),
      "an empty run still reports all three keys - that is what Record buys you",
    ).toEqual({ pass: 0, fail: 0, skip: 0 });
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/08_utility_types. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { applyPatch } from "./ex1/solution";
import type { PublicUser, User, UserSummary } from "./ex2/solution";
import { toPublicUser } from "./ex2/solution";
import type { MyPartial, MyPick } from "./ex3/solution";
import { pickKeys } from "./ex3/solution";
import type { Loaded } from "./ex4/solution";
import { once } from "./ex4/solution";
import type { MyOmit } from "./challenge/solution";
import { omitKeys } from "./challenge/solution";
import type { ScoreBoard } from "./review1/solution";

interface Options {
  retries: number;
  label: string;
}

describe("08_utility_types", () => {
  test("ex1 - applyPatch() takes a Partial and returns a whole", () => {
    const base: Options = { retries: 1, label: "run" };
    expectTypeOf(applyPatch(base, { label: "nightly" })).toEqualTypeOf<Options>();
    expectTypeOf(applyPatch(base, {})).toEqualTypeOf<Options>();
    // @ts-expect-error - a patch may omit members, but not invent them.
    applyPatch(base, { nope: 1 });
  });

  test("ex2 - PublicUser and UserSummary are derived from User", () => {
    expectTypeOf<PublicUser>().toEqualTypeOf<Omit<User, "passwordHash">>();
    expectTypeOf<UserSummary>().toEqualTypeOf<{ id: string; email: string }>();
    const publicUser = toPublicUser({
      id: "u1",
      email: "a@b.c",
      passwordHash: "h",
      createdAt: "2026-01-01",
    });
    // @ts-expect-error - the hash is gone from the type, not just from the value.
    publicUser.passwordHash;
  });

  test("ex3 - MyPartial and MyPick behave like the built-ins", () => {
    expectTypeOf<MyPartial<Options>>().toEqualTypeOf<{ retries?: number; label?: string }>();
    expectTypeOf<MyPick<Options, "label">>().toEqualTypeOf<{ label: string }>();
    const picked = pickKeys({ retries: 1, label: "run" }, ["label"]);
    expectTypeOf(picked).toEqualTypeOf<{ label: string }>();
    // @ts-expect-error - "nope" is not a key of the source object.
    pickKeys({ retries: 1 }, ["nope"]);
  });

  test("ex4 - Awaited, Parameters and ReturnType carry the shapes through", () => {
    expectTypeOf<Loaded>().toEqualTypeOf<{ id: string; title: string }>();
    const memo = once((a: number, b: number) => a + b);
    expectTypeOf(memo).parameters.toEqualTypeOf<[a: number, b: number]>();
    expectTypeOf(memo).returns.toEqualTypeOf<number>();
    // @ts-expect-error - the wrapped function takes two numbers.
    memo("2", 3);
  });

  test("challenge - MyOmit is Pick over the remaining keys", () => {
    expectTypeOf<MyOmit<Options, "retries">>().toEqualTypeOf<{ label: string }>();
    expectTypeOf(omitKeys({ retries: 1, label: "run" }, ["retries"])).toEqualTypeOf<{
      label: string;
    }>();
    // @ts-expect-error - you can only omit keys the object has.
    omitKeys({ retries: 1 }, ["missing"]);
  });

  test("review1 - ScoreBoard has exactly three required counters", () => {
    expectTypeOf<ScoreBoard>().toEqualTypeOf<{ pass: number; fail: number; skip: number }>();
    // @ts-expect-error - a board missing a verdict is not a ScoreBoard.
    const partialBoard: ScoreBoard = { pass: 1, fail: 0 };
  });
});
```

In plain English:

- **ex1** checks the merge, the surviving `0`, the `undefined`-means-nothing rule
  and the untouched base; the type gate proves the patch is a `Partial` (an
  empty patch compiles) and that unknown members are still rejected.
- **ex2** checks that `passwordHash` is *absent*, not blanked, and the type gate
  proves it is gone from the type too — reading `publicUser.passwordHash` must
  not compile.
- **ex3** exercises `pickKeys` with two keys, none, and one, then compares your
  `MyPartial` and `MyPick` against the shapes the built-ins produce.
- **ex4** proves `once` calls through exactly one time and caches, then checks
  the wrapper's parameters and return type came from the wrapped function.
- **challenge** checks the removal, the empty case and the untouched source, and
  the type-level equality of `MyOmit`.
- **review1** checks both tallies and asserts `ScoreBoard` has three *required*
  members.

## The teaching point

Utility types are how a codebase keeps one description of a thing. The `User`
interface is written once; `PublicUser`, `UserSummary`, the patch type used by
the update endpoint, and the row type used by the cache are all derived from
it. When a member is added, the derived types get it automatically; when one is
renamed, the derived types fail to compile in exactly the places that need
attention. That is the difference between types that describe your program and
types that duplicate it.

The second thing worth carrying is that none of this is magic. `Partial<T>` is
five tokens of mapped type; `Omit` is `Pick` plus `Exclude`. You just wrote two
of them yourself, and when you meet a library type you do not recognise —
`Awaited`, `NoInfer`, `ThisParameterType` — the move is to hover it, read the
definition, and see that it is made of the same three parts.

Next: **09_mapped_conditional**, where mapped types get key remapping and
conditional types get `infer`, and the type system starts to look uncomfortably
like a programming language.
