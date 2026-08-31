// Type gate for typescript/d10_generic_constraints. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { sumOf } from "./ex1/solution";
import { replaceById } from "./ex2/solution";
import { tally } from "./ex3/solution";
import { withDefaults } from "./ex4/solution";
import { makeCache } from "./ex5/solution";
import { groupToMap } from "./ex6/solution";
import { deepMerge } from "./ex7/solution";
import { VersionedStore } from "./ex8/solution";

interface Doc {
  id: string;
  version: number;
  body: string;
}

describe("d10_generic_constraints", () => {
  test("ex1 - sumOf() only accepts items with an amount", () => {
    expectTypeOf(sumOf([{ amount: 1 }])).toEqualTypeOf<number>();
    expectTypeOf(sumOf([{ sku: "a", amount: 1 }])).toEqualTypeOf<number>();
    // @ts-expect-error - a price is not an amount.
    sumOf([{ price: 1 }]);
  });

  test("ex2 - replaceById() returns the element type it took", () => {
    expectTypeOf(replaceById([{ id: "a", qty: 1 }], { id: "a", qty: 2 })).toEqualTypeOf<
      { id: string; qty: number }[]
    >();
    // @ts-expect-error - these items have no id.
    replaceById([{ sku: "a" }], { sku: "a" });
  });

  test("ex3 - tally() keys its Record by the declared buckets", () => {
    expectTypeOf(tally(["a", "b"], [])).toEqualTypeOf<Record<"a" | "b", number>>();
    expectTypeOf(tally(["only"], [])).toEqualTypeOf<Record<"only", number>>();
    // @ts-expect-error - the buckets are named with strings.
    tally([1, 2], []);
  });

  test("ex4 - withDefaults() returns the intersection", () => {
    expectTypeOf(withDefaults({ a: 1 }, { b: "x" })).toEqualTypeOf<{ a: number } & { b: string }>();
    expectTypeOf(withDefaults({ a: 1 }, { b: "x" }).b).toEqualTypeOf<string>();
    // @ts-expect-error - a number is not an object.
    withDefaults(1, {});
  });

  test("ex5 - makeCache() has a default key type", () => {
    expectTypeOf(makeCache<number>().get("a")).toEqualTypeOf<number | undefined>();
    expectTypeOf(makeCache<string, number>().get(1)).toEqualTypeOf<string | undefined>();
    expectTypeOf(makeCache<number>().size()).toEqualTypeOf<number>();
    // @ts-expect-error - with one type argument the keys are strings.
    makeCache<number>().set(1, 2);
    // @ts-expect-error - a boolean is not a usable cache key.
    makeCache<number, boolean>();
  });

  test("ex6 - groupToMap() keys the Map by the callback result", () => {
    expectTypeOf(groupToMap(["a"], (word) => word.length)).toEqualTypeOf<Map<number, string[]>>();
    expectTypeOf(groupToMap([1], (n) => (n > 0 ? "pos" : "neg"))).toEqualTypeOf<
      Map<"pos" | "neg", number[]>
    >();
    // @ts-expect-error - an object cannot be a group key here.
    groupToMap(["a"], () => ({}));
  });

  test("ex7 - deepMerge() intersects both object types", () => {
    expectTypeOf(deepMerge({ a: 1 }, { b: "x" })).toEqualTypeOf<{ a: number } & { b: string }>();
    // @ts-expect-error - a string is not an object.
    deepMerge("a", {});
  });

  test("ex8 - VersionedStore constrains its item type", () => {
    const store = new VersionedStore<Doc>();
    expectTypeOf(store.get("a")).toEqualTypeOf<Doc | undefined>();
    expectTypeOf(store.all()).toEqualTypeOf<Doc[]>();
    expectTypeOf(store.put({ id: "a", version: 1, body: "b" })).toEqualTypeOf<boolean>();
    expectTypeOf(store.size).toEqualTypeOf<number>();
    // @ts-expect-error - a stored item needs a version as well as an id.
    const broken = new VersionedStore<{ id: string }>();
  });
});
