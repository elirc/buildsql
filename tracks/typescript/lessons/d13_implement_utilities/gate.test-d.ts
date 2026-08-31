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
