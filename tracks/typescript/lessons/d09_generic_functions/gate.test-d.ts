// Type gate for typescript/d09_generic_functions. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { takeWhile } from "./ex1/solution";
import { interleave } from "./ex2/solution";
import { zipWith } from "./ex3/solution";
import { partitionWith } from "./ex4/solution";
import { rotate } from "./ex5/solution";
import { memoize } from "./ex6/solution";
import { mergeSorted } from "./ex7/solution";
import type { TreeNode } from "./ex8/solution";
import { buildForest } from "./ex8/solution";

interface Row {
  id: string;
  parent: string | null;
}

describe("d09_generic_functions", () => {
  test("ex1 - takeWhile() keeps the element type", () => {
    expectTypeOf(takeWhile([1, 2], (n) => n < 2)).toEqualTypeOf<number[]>();
    expectTypeOf(takeWhile(["a"], (s) => s.length > 0)).toEqualTypeOf<string[]>();
    takeWhile([{ id: 1 }], (item) => {
      expectTypeOf(item).toEqualTypeOf<{ id: number }>();
      return true;
    });
    // @ts-expect-error - the predicate receives the element type, which is a number.
    takeWhile([1, 2], (value: string) => value.length > 0);
  });

  test("ex2 - interleave() keeps one element type across both inputs", () => {
    expectTypeOf(interleave([1], [2])).toEqualTypeOf<number[]>();
    expectTypeOf(interleave(["a"], ["b"])).toEqualTypeOf<string[]>();
    const frozen: readonly number[] = [1];
    expectTypeOf(interleave(frozen, frozen)).toEqualTypeOf<number[]>();
    // @ts-expect-error - interleave takes two lists.
    interleave([1]);
  });

  test("ex3 - zipWith() has three independent type parameters", () => {
    expectTypeOf(zipWith([1], ["a"], (n, s) => `${s}${n}`)).toEqualTypeOf<string[]>();
    expectTypeOf(zipWith([1], ["a"], (n) => n > 0)).toEqualTypeOf<boolean[]>();
    zipWith([1], ["a"], (n, s) => {
      expectTypeOf(n).toEqualTypeOf<number>();
      expectTypeOf(s).toEqualTypeOf<string>();
      return 0;
    });
    // @ts-expect-error - the combiner receives a number and a string, in that order.
    zipWith([1], ["a"], (a: string, b: number) => a);
  });

  test("ex4 - partitionWith() returns a labelled pair of arrays", () => {
    expectTypeOf(partitionWith([1], () => true)).toEqualTypeOf<[kept: number[], dropped: number[]]>();
    expectTypeOf(partitionWith(["a"], () => true)).toEqualTypeOf<
      [kept: string[], dropped: string[]]
    >();
    // @ts-expect-error - the predicate returns a boolean, not a number.
    partitionWith([1], (n) => n);
  });

  test("ex5 - rotate() is readonly in, mutable out", () => {
    const frozen: readonly string[] = ["a", "b"];
    expectTypeOf(rotate(frozen, 1)).toEqualTypeOf<string[]>();
    expectTypeOf(rotate([1], 1)).toEqualTypeOf<number[]>();
    // @ts-expect-error - the rotation count is a number.
    rotate([1], "1");
  });

  test("ex6 - memoize() preserves the wrapped signature", () => {
    const wrapped = memoize(
      (n: number) => String(n),
      (n) => String(n),
    );
    expectTypeOf(wrapped).toEqualTypeOf<(arg: number) => string>();
    expectTypeOf(wrapped(1)).toEqualTypeOf<string>();
    // @ts-expect-error - the key function must produce a string.
    memoize((n: number) => n, (n) => n);
  });

  test("ex7 - mergeSorted() keeps the element type and takes a comparator", () => {
    expectTypeOf(mergeSorted([1], [2], (x, y) => x - y)).toEqualTypeOf<number[]>();
    mergeSorted(["a"], ["b"], (x, y) => {
      expectTypeOf(x).toEqualTypeOf<string>();
      expectTypeOf(y).toEqualTypeOf<string>();
      return 0;
    });
    // @ts-expect-error - a comparator returns a number, not a boolean.
    mergeSorted([1], [2], (x, y) => x < y);
  });

  test("ex8 - buildForest() carries the row type into the tree", () => {
    const rows: Row[] = [{ id: "a", parent: null }];
    expectTypeOf(
      buildForest(
        rows,
        (row) => row.id,
        (row) => row.parent,
      ),
    ).toEqualTypeOf<TreeNode<Row>[]>();
    expectTypeOf<TreeNode<Row>["children"]>().toEqualTypeOf<TreeNode<Row>[]>();
    // @ts-expect-error - the parent id is a string or null.
    buildForest(rows, (row) => row.id, () => 1);
  });
});
