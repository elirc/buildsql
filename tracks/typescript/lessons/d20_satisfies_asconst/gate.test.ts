// Runtime gate for typescript/d20_satisfies_asconst. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { minMax } from "./ex2/solution";
import { tupleOf } from "./ex6/solution";
import { defaults } from "./ex8/solution";

describe("d20_satisfies_asconst", () => {
  test("ex2 - minMax() returns the pair in order", () => {
    expect(minMax([3, 1, 2]), "smallest first, largest second").toEqual([1, 3]);
    expect(minMax([5]), "one element is both ends").toEqual([5, 5]);
    expect(minMax([-4, -9]), "negatives sort the same way").toEqual([-9, -4]);
    expect(minMax([]), "Math.min() with no arguments is Infinity and Math.max() is " +
      "-Infinity, which is the documented empty case here (README ex2)").toEqual([
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]);
  });

  test("ex6 - tupleOf() hands the values straight back", () => {
    expect(tupleOf([1, "a"]), "the same values, in the same order").toEqual([1, "a"]);
    expect(tupleOf([]), "an empty list is a legal tuple").toEqual([]);
    expect(tupleOf(["only"]), "and so is a single element").toEqual(["only"]);
  });

  test("ex8 - defaults() reads the defaults out of the spec", () => {
    expect(defaults(), "one entry per flag, each holding the default from FLAGS").toEqual({
      verbose: false,
      retries: 3,
      out: "dist",
    });
    expect(defaults().retries, "read through, not retyped - a number stays a number").toBe(3);
    expect(Object.keys(defaults()).sort(), "exactly the three flags").toEqual([
      "out",
      "retries",
      "verbose",
    ]);
  });
});
