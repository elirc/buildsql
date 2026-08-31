# d13 - Implement the utility types (drill set)

Eight built-in-style utility types, written from scratch. Lesson **08** taught
you to use `Partial`, `Pick` and friends and had you build two of them; this set
makes the rest automatic, with `infer` from lesson **09** carrying the second
half. Redo those two lessons first if mapped types still feel like syntax.

Every exercise here is **type-level only**: each stub is a deliberately weak or
wrong alias that compiles fine and proves nothing. There is no runtime gate in
this set - the whole gate is `gate.test-d.ts`, and `// @ts-expect-error` lines
in it are assertions in reverse: they pass only when your type makes the next
line illegal.

## ex1 - MyReadonly

`MyReadonly<T>` locks every member: same keys, same value types, all `readonly`.
`MyReadonly<{ name: string }>` is `{ readonly name: string }`.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex1
```

## ex2 - MyRequired

`MyRequired<T>` removes every `?`: `MyRequired<{ title?: string }>` is
`{ title: string }`. A type with nothing optional passes through unchanged.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex2
```

## ex3 - MyRecord

`MyRecord<K, V>` builds an object type with exactly the keys in `K`, each
holding a `V`. `MyRecord<"pass" | "fail", number>` is
`{ pass: number; fail: number }` - and a value missing one of those keys must
not compile. The stub's index signature is precisely what a `Record` is not.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex3
```

## ex4 - MyParameters

`MyParameters<F>` is the parameter list of the function type `F`, as a tuple -
labels, optionality and all. `MyParameters<() => void>` is `[]`.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex4
```

## ex5 - MyInstanceType

`MyInstanceType<C>` is what the construct signature `C` builds:
`MyInstanceType<typeof Beacon>` is `Beacon`, and
`MyInstanceType<new () => Map<string, number>>` is `Map<string, number>`.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex5
```

## ex6 - MyAwaited

`MyAwaited<T>` unwraps promises **recursively** - `Promise<Promise<string>>`
becomes `string` - and passes non-promises through untouched. Handed a union,
it unwraps each member separately.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex6
```

## ex7 - PartialBy

`PartialBy<T, K>` makes **only** the keys in `K` optional and leaves the rest
exactly as they were. `PartialBy<Session, "expiresAt">` still requires `user`
and `token`, no longer requires `expiresAt`, and invents no new keys. Two
built-ins you have already written by hand compose into this one.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex7
```

## ex8 - Merge

`Merge<A, B>` is one object type with every key from either shape; where both
declare a key, **B wins**. The stub is the classic wrong answer - an
intersection, which turns every disagreement into `never` instead of an
override.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d13_implement_utilities ex8
```

## The gate

This is the entire gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d13_implement_utilities. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { MyReadonly } from "./ex1/solution";
import type { MyRequired } from "./ex2/solution";
import type { MyRecord } from "./ex3/solution";
import type { MyParameters } from "./ex4/solution";
import type { MyInstanceType } from "./ex5/solution";
import type { MyAwaited } from "./ex6/solution";
import type { PartialBy } from "./ex7/solution";
import type { Merge } from "./ex8/solution";

interface Profile {
  name: string;
  tier: number;
}

interface Draft {
  title?: string;
  tags?: string[];
}

interface Session {
  user: string;
  token: string;
  expiresAt: number;
}

class Beacon {
  constructor(
    public id: string,
    public interval: number,
  ) {}
}

describe("d13_implement_utilities", () => {
  test("ex1 - MyReadonly<T> locks every member", () => {
    expectTypeOf<MyReadonly<Profile>>().toEqualTypeOf<{
      readonly name: string;
      readonly tier: number;
    }>();
    const locked: MyReadonly<Profile> = { name: "ada", tier: 2 };
    expectTypeOf(locked.name).toEqualTypeOf<string>();
    // @ts-expect-error - every member of a MyReadonly object is readonly.
    locked.tier = 3;
  });

  test("ex2 - MyRequired<T> removes every optional marker", () => {
    expectTypeOf<MyRequired<Draft>>().toEqualTypeOf<{ title: string; tags: string[] }>();
    expectTypeOf<MyRequired<Profile>>().toEqualTypeOf<Profile>();
    // @ts-expect-error - tags stopped being optional when MyRequired ran.
    const incomplete: MyRequired<Draft> = { title: "publish" };
  });

  test("ex3 - MyRecord<K, V> builds an object type from a key union", () => {
    expectTypeOf<MyRecord<"pass" | "fail", number>>().toEqualTypeOf<{
      pass: number;
      fail: number;
    }>();
    expectTypeOf<MyRecord<string, boolean>>().toEqualTypeOf<Record<string, boolean>>();
    // @ts-expect-error - every key named in K must actually be present.
    const missing: MyRecord<"up" | "down", number> = { up: 1 };
  });

  test("ex4 - MyParameters<F> reads the argument tuple with infer", () => {
    expectTypeOf<MyParameters<(slug: string, attempts: number) => boolean>>().toEqualTypeOf<
      [slug: string, attempts: number]
    >();
    expectTypeOf<MyParameters<() => void>>().toEqualTypeOf<[]>();
    // @ts-expect-error - only function types have a parameter list to read.
    type Nope = MyParameters<number>;
  });

  test("ex5 - MyInstanceType<C> reads what the constructor builds", () => {
    expectTypeOf<MyInstanceType<typeof Beacon>>().toEqualTypeOf<Beacon>();
    expectTypeOf<MyInstanceType<new () => Map<string, number>>>().toEqualTypeOf<
      Map<string, number>
    >();
    // @ts-expect-error - a plain function type is not a constructor.
    type Nope = MyInstanceType<() => Beacon>;
  });

  test("ex6 - MyAwaited<T> unwraps promises all the way down", () => {
    expectTypeOf<MyAwaited<Promise<number>>>().toEqualTypeOf<number>();
    expectTypeOf<MyAwaited<Promise<Promise<string>>>>().toEqualTypeOf<string>();
    expectTypeOf<MyAwaited<boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<MyAwaited<Promise<number> | string>>().toEqualTypeOf<number | string>();
  });

  test("ex7 - PartialBy<T, K> loosens only the named keys", () => {
    const resumed: PartialBy<Session, "token" | "expiresAt"> = { user: "ada" };
    expectTypeOf(resumed.user).toEqualTypeOf<string>();
    expectTypeOf(resumed.token).toEqualTypeOf<string | undefined>();
    const whole: PartialBy<Session, "expiresAt"> = { user: "ada", token: "t", expiresAt: 9 };
    expectTypeOf(whole.expiresAt).toEqualTypeOf<number | undefined>();
    // @ts-expect-error - the keys you did not name stay required.
    const anonymous: PartialBy<Session, "expiresAt"> = { token: "t", expiresAt: 1 };
    // @ts-expect-error - loosening keys never adds new ones.
    const padded: PartialBy<Session, "expiresAt"> = { user: "a", token: "t", ttl: 5 };
  });

  test("ex8 - Merge<A, B> lets the second shape win", () => {
    expectTypeOf<
      Merge<{ id: string; retries: number }, { retries: string; debug: boolean }>
    >().toEqualTypeOf<{ id: string; retries: string; debug: boolean }>();
    expectTypeOf<Merge<Profile, { name: "ada" }>>().toEqualTypeOf<{
      name: "ada";
      tier: number;
    }>();
    // @ts-expect-error - after the merge, retries is a string.
    const merged: Merge<{ retries: number }, { retries: string }> = { retries: 3 };
  });
});
```

One warning worth repeating from the track: `tsc` checks this whole file at
once, so an unfinished ex5 will surface its errors even on a run filtered to
ex1. The per-exercise verdict printed by `dojo test` is still exact.
