// Type gate for typescript/09_mapped_conditional. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Mutable } from "./ex1/solution";
import { thaw } from "./ex1/solution";
import type { Getters } from "./ex2/solution";
import { makeGetters } from "./ex2/solution";
import type { ElementOf } from "./ex3/solution";
import { flattenOnce } from "./ex3/solution";
import type { BoxAll, BoxEach, MyExclude } from "./ex4/solution";
import { withoutValues } from "./ex4/solution";
import type { DeepReadonly } from "./challenge/solution";
import { deepFreeze } from "./challenge/solution";

interface Options {
  readonly retries: number;
  readonly label: string;
}

describe("09_mapped_conditional", () => {
  test("ex1 - Mutable<T> strips readonly from every member", () => {
    expectTypeOf<Mutable<Options>>().toEqualTypeOf<{ retries: number; label: string }>();
    const copy = thaw<Options>({ retries: 1, label: "run" });
    expectTypeOf(copy).toEqualTypeOf<{ retries: number; label: string }>();
  });

  test("ex2 - Getters<T> renames the keys and wraps the values", () => {
    expectTypeOf<Getters<{ name: string; streak: number }>>().toEqualTypeOf<{
      getName: () => string;
      getStreak: () => number;
    }>();
    expectTypeOf(makeGetters({ name: "Ada" }).getName()).toEqualTypeOf<string>();
    // @ts-expect-error - the original member name is not a key of the result.
    makeGetters({ name: "Ada" }).name;
  });

  test("ex3 - ElementOf<T> unwraps one array level with infer", () => {
    expectTypeOf<ElementOf<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<ElementOf<readonly number[]>>().toEqualTypeOf<number>();
    expectTypeOf<ElementOf<number>>().toEqualTypeOf<number>();
    expectTypeOf(flattenOnce([[1], [2]])).toEqualTypeOf<number[]>();
  });

  test("ex4 - distribution is what makes Exclude work", () => {
    expectTypeOf<MyExclude<"a" | "b" | "c", "b">>().toEqualTypeOf<"a" | "c">();
    expectTypeOf<MyExclude<string | number, number>>().toEqualTypeOf<string>();
    expectTypeOf<BoxEach<string | number>>().toEqualTypeOf<string[] | number[]>();
    expectTypeOf<BoxAll<string | number>>().toEqualTypeOf<(string | number)[]>();
    expectTypeOf(withoutValues(["a", "b"] as ("a" | "b")[], ["b"] as "b"[])).toEqualTypeOf<
      "a"[]
    >();
  });

  test("challenge - DeepReadonly<T> recurses into nested objects", () => {
    expectTypeOf<DeepReadonly<{ a: { b: number }; c: string }>>().toEqualTypeOf<{
      readonly a: { readonly b: number };
      readonly c: string;
    }>();
    const frozen = deepFreeze({ server: { port: 80 } });
    expectTypeOf(frozen.server.port).toEqualTypeOf<number>();
    // @ts-expect-error - every member is readonly, all the way down.
    frozen.server.port = 8080;
  });
});
