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
