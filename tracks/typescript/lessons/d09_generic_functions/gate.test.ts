// Gate for typescript/d09_generic_functions. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { takeWhile } from "./ex1/solution";
import { interleave } from "./ex2/solution";
import { zipWith } from "./ex3/solution";
import { partitionWith } from "./ex4/solution";
import { rotate } from "./ex5/solution";
import { memoize } from "./ex6/solution";
import { mergeSorted } from "./ex7/solution";
import { buildForest } from "./ex8/solution";

describe("d09_generic_functions", () => {
  test("ex1 - takeWhile() stops at the first miss", () => {
    expect(
      takeWhile([1, 2, 3, 1], (n) => n < 3),
      "it stops at the 3 and never comes back, so the trailing 1 is not taken",
    ).toEqual([1, 2]);
    expect(takeWhile([5, 1], (n) => n < 3), "a first element that fails takes nothing").toEqual([]);
    expect(takeWhile(["a", "b"], () => true), "a predicate that always holds takes all").toEqual([
      "a",
      "b",
    ]);
    expect(takeWhile([], () => true), "an empty list takes nothing").toEqual([]);

    let calls = 0;
    takeWhile([1, 2, 3, 4], (n) => {
      calls += 1;
      return n < 3;
    });
    expect(
      calls,
      "the predicate runs three times: twice successfully and once to fail - " +
        "takeWhile is not filter (README ex1)",
    ).toBe(3);
  });

  test("ex2 - interleave() alternates and then drains", () => {
    expect(interleave([1, 2, 3], [4, 5]), "one from each until the shorter runs out").toEqual([
      1, 4, 2, 5, 3,
    ]);
    expect(interleave(["a"], ["b", "c", "d"]), "the longer list keeps going").toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(interleave([], [1]), "an empty first list is just the second").toEqual([1]);
    expect(interleave([1], []), "and the other way round").toEqual([1]);
    expect(interleave([], []), "two empty lists interleave to nothing").toEqual([]);
  });

  test("ex3 - zipWith() combines two element types into a third", () => {
    expect(
      zipWith([1, 2], ["a", "b"], (n, s) => `${s}${n}`),
      "the combiner sees one element from each list, in order",
    ).toEqual(["a1", "b2"]);
    expect(
      zipWith([1, 2, 3], ["a"], (n, s) => `${s}${n}`),
      "it stops at the shorter input, like every zip",
    ).toEqual(["a1"]);
    expect(
      zipWith([1, 2], [true, false], (n, flag) => (flag ? n : -n)),
      "the result type has nothing to do with either input type",
    ).toEqual([1, -2]);
    expect(zipWith([], [], () => 1), "two empty lists combine to nothing").toEqual([]);
  });

  test("ex4 - partitionWith() returns two lists in one pass", () => {
    expect(
      partitionWith([1, 2, 3, 4], (n) => n % 2 === 0),
      "kept first, dropped second, each in input order",
    ).toEqual([
      [2, 4],
      [1, 3],
    ]);
    expect(partitionWith([], () => true), "an empty input still returns two arrays").toEqual([
      [],
      [],
    ]);
    expect(partitionWith(["a", "b"], () => false), "nothing kept is not nothing returned").toEqual([
      [],
      ["a", "b"],
    ]);
    expect(
      partitionWith([0, 1], (n) => n === 0),
      "the predicate decides, not the truthiness of the value",
    ).toEqual([[0], [1]]);
  });

  test("ex5 - rotate() moves the front to the back", () => {
    const values = [1, 2, 3, 4, 5];
    expect(rotate(values, 2), "rotating left by 2 puts 1 and 2 at the end").toEqual([
      3, 4, 5, 1, 2,
    ]);
    expect(values, "the input array is not modified").toEqual([1, 2, 3, 4, 5]);
    expect(rotate([1, 2, 3], 0), "no rotation is a copy of the input").toEqual([1, 2, 3]);
    expect(rotate([1, 2, 3], -1), "a negative rotation goes the other way").toEqual([3, 1, 2]);
    expect(
      rotate([1, 2, 3], 7),
      "a rotation larger than the list wraps - 7 of 3 is the same as 1",
    ).toEqual([2, 3, 1]);
    expect(rotate([1, 2, 3], -7), "and so does a large negative one").toEqual([3, 1, 2]);
    expect(rotate([], 3), "rotating nothing is nothing, not a crash").toEqual([]);
  });

  test("ex6 - memoize() calls through once per key", () => {
    let calls = 0;
    const slowDouble = memoize(
      (n: number) => {
        calls += 1;
        return n * 2;
      },
      (n) => String(n),
    );
    expect(slowDouble(2), "the first call computes").toBe(4);
    expect(slowDouble(2), "the second call with the same key returns the cached value").toBe(4);
    expect(calls, "so the wrapped function ran once").toBe(1);
    expect(slowDouble(3), "a new key computes again").toBe(6);
    expect(calls, "twice now").toBe(2);

    let undefinedCalls = 0;
    const alwaysUndefined = memoize(
      (n: number) => {
        undefinedCalls += 1;
        return undefined;
      },
      (n) => String(n),
    );
    alwaysUndefined(1);
    alwaysUndefined(1);
    expect(
      undefinedCalls,
      "a cached undefined is still cached - ask the cache whether it HAS the " +
        "key, do not ask it for the value (README ex6)",
    ).toBe(1);

    const byLength = memoize(
      (word: string) => {
        calls += 1;
        return word.length;
      },
      (word) => String(word.length),
    );
    expect(byLength("abc"), "the key function decides what counts as the same call").toBe(3);
    expect(byLength("xyz"), "a different word with the same key is a cache hit").toBe(3);
  });

  test("ex7 - mergeSorted() merges two sorted lists stably", () => {
    expect(
      mergeSorted([1, 3, 5], [2, 4], (x, y) => x - y),
      "one merged, sorted list",
    ).toEqual([1, 2, 3, 4, 5]);
    expect(mergeSorted([], [1, 2], (x, y) => x - y), "an empty left is the right").toEqual([1, 2]);
    expect(mergeSorted([1, 2], [], (x, y) => x - y), "and an empty right is the left").toEqual([
      1, 2,
    ]);
    expect(mergeSorted([], [], (x, y) => x - y), "two empties merge to nothing").toEqual([]);
    expect(
      mergeSorted(
        [
          { n: 1, from: "a" },
          { n: 3, from: "a" },
        ],
        [
          { n: 1, from: "b" },
          { n: 2, from: "b" },
        ],
        (x, y) => x.n - y.n,
      ),
      "on a tie the element from the FIRST list comes first - that is what stable " +
        "means (README ex7)",
    ).toEqual([
      { n: 1, from: "a" },
      { n: 1, from: "b" },
      { n: 2, from: "b" },
      { n: 3, from: "a" },
    ]);
    expect(
      mergeSorted(["c", "a"], ["b"], (x, y) => (x < y ? 1 : x > y ? -1 : 0)),
      "the comparator decides the order, so a descending merge works too",
    ).toEqual(["c", "b", "a"]);
  });

  test("ex8 - buildForest() rebuilds a tree from flat rows", () => {
    const rows = [
      { id: "a", parent: null, label: "A" },
      { id: "a1", parent: "a", label: "A1" },
      { id: "b", parent: null, label: "B" },
      { id: "a2", parent: "a", label: "A2" },
      { id: "a1x", parent: "a1", label: "A1X" },
      { id: "orphan", parent: "ghost", label: "O" },
    ];
    expect(
      buildForest(
        rows,
        (row) => row.id,
        (row) => row.parent,
      ),
      "roots and children both keep input order, and a row whose parent is not " +
        "in the list becomes a root of its own",
    ).toEqual([
      {
        value: rows[0],
        children: [
          { value: rows[1], children: [{ value: rows[4], children: [] }] },
          { value: rows[3], children: [] },
        ],
      },
      { value: rows[2], children: [] },
      { value: rows[5], children: [] },
    ]);
    expect(
      buildForest(
        [],
        (row: { id: string }) => row.id,
        () => null,
      ),
      "no rows means no trees",
    ).toEqual([]);
    expect(
      buildForest(
        [{ id: "only", parent: null }],
        (row) => row.id,
        (row) => row.parent,
      ),
      "a single row is one childless root",
    ).toEqual([{ value: { id: "only", parent: null }, children: [] }]);
  });
});
