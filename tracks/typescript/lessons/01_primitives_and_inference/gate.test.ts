// Gate for typescript/01_primitives_and_inference. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { averageScore } from "./ex1/solution";
import { minMax } from "./ex2/solution";
import { sortedCopy } from "./ex3/solution";
import { zip } from "./ex4/solution";
import { splitEvery } from "./challenge/solution";
import { firstAndLast } from "./review1/solution";

describe("01_primitives_and_inference", () => {
  test("ex1 - averageScore() divides, and survives an empty list", () => {
    expect(
      averageScore([10, 20, 30]),
      "the mean of 10, 20 and 30 is 20 - sum divided by count, no rounding",
    ).toBe(20);
    expect(
      averageScore([1, 2]),
      "1.5 is the answer: do not round, do not floor - reread README ex1",
    ).toBe(1.5);
    expect(
      averageScore([]),
      "an empty list has no mean, so this course says 0 - 0/0 is NaN and NaN " +
        "is not 0, so you need a guard before the division",
    ).toBe(0);
  });

  test("ex2 - minMax() returns exactly two numbers, smallest first", () => {
    expect(
      minMax([3, 9, 4]),
      "minMax([3, 9, 4]) is [3, 9] - min in slot 0, max in slot 1",
    ).toEqual([3, 9]);
    expect(
      minMax([7]),
      "a one-element list is its own min and its own max - no special case needed " +
        "if you seed both accumulators from values[0]",
    ).toEqual([7, 7]);
    expect(
      minMax([-5, -1, -9]),
      "negatives are the test of whether you seeded from 0 instead of values[0]",
    ).toEqual([-9, -1]);
  });

  test("ex3 - sortedCopy() sorts numerically and leaves the input alone", () => {
    const original = [10, 9, 1];
    expect(
      sortedCopy(original),
      "the default sort compares as strings, so [10, 9, 1] comes back [1, 10, 9] - " +
        "pass a numeric comparator (README ex3)",
    ).toEqual([1, 9, 10]);
    expect(
      original,
      "sort() mutates the array it is called on: copy first, sort the copy",
    ).toEqual([10, 9, 1]);
  });

  test("ex4 - zip() pairs up to the shorter input", () => {
    expect(
      zip(["ada", "eli"], [90, 80]),
      "zip pairs element by element: [['ada', 90], ['eli', 80]]",
    ).toEqual([
      ["ada", 90],
      ["eli", 80],
    ]);
    expect(
      zip(["ada", "eli", "grace"], [90]),
      "extra names have no score, so they are dropped - stop at the shorter length",
    ).toEqual([["ada", 90]]);
    expect(zip([], []), "two empty inputs zip to an empty array, not undefined").toEqual([]);
  });

  test("challenge - splitEvery() chunks, including the short last chunk", () => {
    expect(
      splitEvery([1, 2, 3, 4, 5], 2),
      "the final chunk is allowed to be short: [[1,2],[3,4],[5]]",
    ).toEqual([[1, 2], [3, 4], [5]]);
    expect(
      splitEvery([1, 2, 3, 4], 2),
      "an input that divides evenly produces no trailing empty chunk",
    ).toEqual([[1, 2], [3, 4]]);
    expect(
      splitEvery([1, 2, 3], 0),
      "a size of 0 would loop forever, so the agreed answer is [] - reread the prompt",
    ).toEqual([]);
    expect(
      splitEvery([1, 2, 3], 2.5),
      "a fractional size is nonsense too, and the prompt says nonsense means []",
    ).toEqual([]);
  });

  test("review1 - firstAndLast() reads both ends of the array", () => {
    expect(
      firstAndLast(["a", "b", "c"]),
      "first is 'a', last is 'c' - index 0 and index length-1",
    ).toEqual(["a", "c"]);
    expect(
      firstAndLast(["only"]),
      "with one element the two slots are the same string - that is not a bug",
    ).toEqual(["only", "only"]);
  });
});
