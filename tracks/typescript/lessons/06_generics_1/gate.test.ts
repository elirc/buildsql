// Gate for typescript/06_generics_1. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { first } from "./ex1/solution";
import { mapArray } from "./ex2/solution";
import { box } from "./ex3/solution";
import { zipPairs } from "./ex4/solution";
import { uniqueBy } from "./challenge/solution";
import { lastOr } from "./review1/solution";

describe("06_generics_1", () => {
  test("ex1 - first() returns the head, or undefined", () => {
    expect(first([10, 20]), "the first element of [10, 20] is 10").toBe(10);
    expect(first(["only"]), "one element means that element").toBe("only");
    expect(
      first([]),
      "an empty list has no first element, so the answer is undefined - and " +
        "that has to be part of the declared return type (README ex1)",
    ).toBeUndefined();
  });

  test("ex2 - mapArray() transforms every element", () => {
    expect(
      mapArray([1, 2, 3], (n) => n * 2),
      "each element is passed through the callback, in order",
    ).toEqual([2, 4, 6]);
    expect(
      mapArray(["a", "bb"], (s, i) => `${i}:${s}`),
      "the callback's second argument is the index",
    ).toEqual(["0:a", "1:bb"]);
    expect(mapArray([], (x) => x), "an empty list maps to an empty list").toEqual([]);
  });

  test("ex3 - box() holds a value and map() changes its type", () => {
    expect(box(2).value, "the box hands back what it was given").toBe(2);
    expect(box(2).map((n) => n * 3).value, "map applies the transform: 2 * 3 = 6").toBe(6);
    expect(
      box("hello").map((s) => s.length).value,
      "a box of string maps to a box of number - the element type is not fixed",
    ).toBe(5);
    const original = box("keep");
    original.map((s) => s.toUpperCase());
    expect(original.value, "map returns a NEW box; the original is untouched").toBe("keep");
  });

  test("ex4 - zipPairs() works for any two element types", () => {
    expect(
      zipPairs(["ada", "eli"], [90, 80]),
      "the classic case: names with scores",
    ).toEqual([
      ["ada", 90],
      ["eli", 80],
    ]);
    expect(
      zipPairs([true, false], ["yes", "no"]),
      "booleans with strings works too - nothing in the body cares",
    ).toEqual([
      [true, "yes"],
      [false, "no"],
    ]);
    expect(zipPairs([1, 2, 3], ["only"]), "still stops at the shorter input").toEqual([
      [1, "only"],
    ]);
  });

  test("challenge - uniqueBy() keeps the first item per key", () => {
    const learners = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Eli" },
      { id: "a", name: "Ada again" },
    ];
    expect(
      uniqueBy(learners, (learner) => learner.id),
      "the FIRST item with each key survives, in input order - so 'Ada', not " +
        "'Ada again' (README challenge)",
    ).toEqual([
      { id: "a", name: "Ada" },
      { id: "b", name: "Eli" },
    ]);
    expect(
      uniqueBy(["a", "A", "b"], (s) => s.toLowerCase()),
      "the key function decides what 'the same' means: 'A' collides with 'a'",
    ).toEqual(["a", "b"]);
    expect(uniqueBy([], (x) => String(x)), "an empty list stays empty").toEqual([]);
  });

  test("review1 - lastOr() falls back instead of returning undefined", () => {
    expect(lastOr([1, 2, 3], 0), "the last element of [1, 2, 3] is 3").toBe(3);
    expect(lastOr(["x"], "fallback"), "one element is also the last one").toBe("x");
    expect(
      lastOr([], "fallback"),
      "an empty list yields the fallback the caller supplied, not undefined",
    ).toBe("fallback");
  });
});
