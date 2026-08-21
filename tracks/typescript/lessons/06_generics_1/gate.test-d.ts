// Type gate for typescript/06_generics_1. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { first } from "./ex1/solution";
import { mapArray } from "./ex2/solution";
import type { Box } from "./ex3/solution";
import { box } from "./ex3/solution";
import { zipPairs } from "./ex4/solution";
import { uniqueBy } from "./challenge/solution";
import { lastOr } from "./review1/solution";

describe("06_generics_1", () => {
  test("ex1 - first() remembers the element type", () => {
    expectTypeOf(first([1, 2])).toEqualTypeOf<number | undefined>();
    expectTypeOf(first(["a"])).toEqualTypeOf<string | undefined>();
    expectTypeOf(first([{ id: 1 }])).toEqualTypeOf<{ id: number } | undefined>();
  });

  test("ex2 - mapArray() infers both ends", () => {
    expectTypeOf(mapArray([1, 2], (n) => n.toFixed(1))).toEqualTypeOf<string[]>();
    expectTypeOf(mapArray(["a"], (s) => s.length)).toEqualTypeOf<number[]>();
    // @ts-expect-error - the callback receives a number, so .toUpperCase is not on it.
    mapArray([1, 2], (n) => n.toUpperCase());
  });

  test("ex3 - Box carries its element type through map()", () => {
    expectTypeOf(box(2).value).toEqualTypeOf<number>();
    expectTypeOf(box(2).map((n) => String(n)).value).toEqualTypeOf<string>();
    expectTypeOf(box("x").map((s) => s.length)).toEqualTypeOf<Box<number>>();
    // @ts-expect-error - the boxed value is a number, so .trim() is not available.
    box(2).map((n) => n.trim());
  });

  test("ex4 - zipPairs() pairs two independent types", () => {
    expectTypeOf(zipPairs(["a"], [1])).toEqualTypeOf<[string, number][]>();
    expectTypeOf(zipPairs([true], [{ id: 1 }])).toEqualTypeOf<[boolean, { id: number }][]>();
  });

  test("challenge - uniqueBy() returns the same element type it took", () => {
    const learners = [{ id: "a" }];
    expectTypeOf(uniqueBy(learners, (l) => l.id)).toEqualTypeOf<{ id: string }[]>();
    // @ts-expect-error - the key function must produce a string.
    uniqueBy(learners, (l) => l.id.length);
  });

  test("review1 - lastOr() ties the fallback to the element type", () => {
    expectTypeOf(lastOr([1, 2], 0)).toEqualTypeOf<number>();
    expectTypeOf(lastOr(["a"], "z")).toEqualTypeOf<string>();
    // @ts-expect-error - the fallback has to be the same type as the elements.
    lastOr([1, 2], "none");
  });
});
