// Type gate for typescript/01_primitives_and_inference. Quoted verbatim in README.md.
// Graded by tsc, not by running it: every assertion here is about the types
// your code declares.
import { describe, expectTypeOf, test } from "vitest";

import { averageScore } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { sortedCopy } from "./ex3/solution";
import { zip } from "./ex4/solution";
import { splitEvery } from "./challenge/solution";
import { firstAndLast } from "./review1/solution";

describe("01_primitives_and_inference", () => {
  test("ex1 - averageScore() is declared to return a number", () => {
    expectTypeOf(averageScore).returns.toEqualTypeOf<number>();
    // @ts-expect-error - scores are numbers; a list of strings must not compile.
    averageScore(["10", "20"]);
  });

  test("ex2 - minMax() returns a two-slot tuple, not number[]", () => {
    expectTypeOf(minMax([1, 2])).toEqualTypeOf<[min: number, max: number]>();
    // @ts-expect-error - a two-element tuple has no index 2.
    minMax([1, 2])[2];
  });

  test("ex3 - sortedCopy() accepts a readonly array and returns a mutable one", () => {
    const frozen: readonly number[] = [3, 1, 2];
    expectTypeOf(sortedCopy).parameters.toEqualTypeOf<[values: readonly number[]]>();
    expectTypeOf(sortedCopy(frozen)).toEqualTypeOf<number[]>();
  });

  test("ex4 - zip() returns an array of [string, number] pairs", () => {
    expectTypeOf(zip(["a"], [1])).toEqualTypeOf<[string, number][]>();
    // @ts-expect-error - the second argument is a list of numbers, not strings.
    zip(["a"], ["b"]);
  });

  test("challenge - splitEvery() takes a readonly array and returns number[][]", () => {
    const frozen: readonly number[] = [1, 2, 3];
    expectTypeOf(splitEvery(frozen, 2)).toEqualTypeOf<number[][]>();
  });

  test("review1 - firstAndLast() is a readonly-in, tuple-out function", () => {
    const frozen: readonly string[] = ["a", "b"];
    expectTypeOf(firstAndLast(frozen)).toEqualTypeOf<[first: string, last: string]>();
  });
});
