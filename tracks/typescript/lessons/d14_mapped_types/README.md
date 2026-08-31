# d14 - Mapped types (drill set)

Eight problems on the mapped-type loop: modifiers on and off, values rewritten,
keys renamed, members filtered, and two ex7/ex8 tricks interviews love. They
drill lesson **09_mapped_conditional** (with lesson 08's plain loop underneath);
redo those if `[K in keyof T]` still reads like noise.

Every exercise is **type-level only** - each stub compiles and is wrong, and
there is no runtime gate: the whole gate is `gate.test-d.ts`. The
`// @ts-expect-error` lines are assertions in reverse; they pass only when your
type makes the next line illegal.

## ex1 - Nullable

`Nullable<T>` keeps every key and lets every value also be `null`:
`Nullable<{ count: number }>` is `{ count: number | null }`.

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex1
```

## ex2 - Locked

`Locked<T>` applies two modifiers in one pass: every member becomes `readonly`
**and** required. The stub already locks; it forgets to remove the question
marks.

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex2
```

## ex3 - Boxed

`Boxed<T>` wraps every value: `Boxed<{ count: number }>` is
`{ count: { value: number } }`. Same keys, new value shape.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex3
```

## ex4 - Watchers

`Watchers<T>` renames as it maps: every member `title` becomes a callback
member `titleChanged: (value: <old type>) => void`, and the original names are
gone from the result.

Edit `ex4/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex4
```

## ex5 - PickByType

`PickByType<T, V>` keeps only the members whose value type is assignable to
`V`, and deletes the rest - `PickByType<Metric, string>` has the two string
members and nothing else. Deleting means remapping the key to `never`.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex5
```

## ex6 - Toggles

`Toggles<K>` maps over a **union of names**, not over `keyof` anything:
`Toggles<"audio" | "video">` is `{ hasAudio: boolean; hasVideo: boolean }`.
One of the four intrinsic string types does the capitalising.

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex6
```

## ex7 - Invert

`Invert<T>` swaps each key with its value: `Invert<{ ok: "OK"; bad: "ERR" }>`
is `{ OK: "ok"; ERR: "bad" }`, and it works for number values too. The values
are constrained to `PropertyKey`, because they are about to become keys.

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex7
```

## ex8 - OptionalKeys

`OptionalKeys<T>` is the union of the keys a value of `T` may omit:
`OptionalKeys<{ a: number; b?: string }>` is `"b"`, and a type with nothing
optional yields `never`. The trick is asking, per key, whether `{}` satisfies
`Pick<T, K>`.

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d14_mapped_types ex8
```

## The gate

This is the entire gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d14_mapped_types. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Nullable } from "./ex1/solution";
import type { Locked } from "./ex2/solution";
import type { Boxed } from "./ex3/solution";
import type { Watchers } from "./ex4/solution";
import type { PickByType } from "./ex5/solution";
import type { Toggles } from "./ex6/solution";
import type { Invert } from "./ex7/solution";
import type { OptionalKeys } from "./ex8/solution";

interface Panel {
  title: string;
  count: number;
}

interface Prefs {
  theme?: string;
  compact?: boolean;
}

interface Metric {
  id: string;
  label: string;
  retries: number;
  active: boolean;
}

describe("d14_mapped_types", () => {
  test("ex1 - Nullable<T> lets every member be null", () => {
    expectTypeOf<Nullable<Panel>>().toEqualTypeOf<{
      title: string | null;
      count: number | null;
    }>();
    const cleared: Nullable<Panel> = { title: null, count: null };
    expectTypeOf(cleared.count).toEqualTypeOf<number | null>();
  });

  test("ex2 - Locked<T> is readonly and required at once", () => {
    expectTypeOf<Locked<Prefs>>().toEqualTypeOf<{
      readonly theme: string;
      readonly compact: boolean;
    }>();
    const locked: Locked<Panel> = { title: "runs", count: 3 };
    // @ts-expect-error - a locked member cannot be written to.
    locked.count = 4;
  });

  test("ex3 - Boxed<T> wraps every value in a box", () => {
    expectTypeOf<Boxed<Panel>>().toEqualTypeOf<{
      title: { value: string };
      count: { value: number };
    }>();
    const boxed = { title: { value: "runs" }, count: { value: 3 } } as Boxed<Panel>;
    expectTypeOf(boxed.count.value).toEqualTypeOf<number>();
  });

  test("ex4 - Watchers<T> renames keys as it maps them", () => {
    expectTypeOf<Watchers<Panel>>().toEqualTypeOf<{
      titleChanged: (value: string) => void;
      countChanged: (value: number) => void;
    }>();
    const watchers = {} as Watchers<Panel>;
    expectTypeOf(watchers.countChanged).parameters.toEqualTypeOf<[value: number]>();
    // @ts-expect-error - the original member names are gone after the remap.
    watchers.title;
  });

  test("ex5 - PickByType<T, V> keeps only matching members", () => {
    expectTypeOf<PickByType<Metric, string>>().toEqualTypeOf<{ id: string; label: string }>();
    expectTypeOf<PickByType<Metric, number>>().toEqualTypeOf<{ retries: number }>();
    const flags = {} as PickByType<Metric, boolean>;
    expectTypeOf(flags.active).toEqualTypeOf<boolean>();
    // @ts-expect-error - retries is a number, so the boolean filter dropped it.
    flags.retries;
  });

  test("ex6 - Toggles<K> builds flags from a key union", () => {
    expectTypeOf<Toggles<"audio" | "video">>().toEqualTypeOf<{
      hasAudio: boolean;
      hasVideo: boolean;
    }>();
    const toggles = { hasAudio: true, hasVideo: false } as Toggles<"audio" | "video">;
    expectTypeOf(toggles.hasVideo).toEqualTypeOf<boolean>();
    // @ts-expect-error - the raw name is not a key; only the hasX form exists.
    toggles.audio;
  });

  test("ex7 - Invert<T> swaps keys and values", () => {
    expectTypeOf<Invert<{ ok: "OK"; bad: "ERR" }>>().toEqualTypeOf<{ OK: "ok"; ERR: "bad" }>();
    expectTypeOf<Invert<{ draft: 0; live: 1 }>>().toEqualTypeOf<{ 0: "draft"; 1: "live" }>();
    const flipped = {} as Invert<{ ok: "OK"; bad: "ERR" }>;
    // @ts-expect-error - ok is a value in the inverted table, not a key.
    flipped.ok;
  });

  test("ex8 - OptionalKeys<T> extracts the optional keys", () => {
    expectTypeOf<OptionalKeys<{ a: number; b?: string; c?: boolean }>>().toEqualTypeOf<
      "b" | "c"
    >();
    expectTypeOf<OptionalKeys<Panel>>().toEqualTypeOf<never>();
    expectTypeOf<OptionalKeys<Prefs>>().toEqualTypeOf<"theme" | "compact">();
  });
});
```

`tsc` checks the whole file at once, so an unfinished exercise surfaces its
errors even on a filtered run. The per-exercise verdict printed by `dojo test`
is still exact.
