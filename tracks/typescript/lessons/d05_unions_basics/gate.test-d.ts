// Type gate for typescript/d05_unions_basics. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { cellWidth } from "./ex1/solution";
import { toCellText } from "./ex2/solution";
import { sumNumeric } from "./ex3/solution";
import { splitCells } from "./ex4/solution";
import type { Id } from "./ex5/solution";
import { idKey, sameId } from "./ex5/solution";
import { compact } from "./ex6/solution";
import type { Cell } from "./ex7/solution";
import { parseCells } from "./ex7/solution";
import type { ColumnKind } from "./ex8/solution";
import { columnKinds } from "./ex8/solution";

describe("d05_unions_basics", () => {
  test("ex1 - cellWidth() accepts exactly two member types", () => {
    expectTypeOf(cellWidth).parameters.toEqualTypeOf<[value: string | number]>();
    expectTypeOf(cellWidth("a")).toEqualTypeOf<number>();
    // @ts-expect-error - a boolean is not a cell value here.
    cellWidth(true);
  });

  test("ex2 - toCellText() adds null to the union and nothing else", () => {
    expectTypeOf(toCellText).parameters.toEqualTypeOf<[value: string | number | null]>();
    expectTypeOf(toCellText(null)).toEqualTypeOf<string>();
    // @ts-expect-error - an empty cell is null, never undefined.
    toCellText(undefined);
  });

  test("ex3 - sumNumeric() takes an array of the union", () => {
    expectTypeOf(sumNumeric).returns.toEqualTypeOf<number>();
    const frozen: readonly (string | number)[] = [1, "a"];
    expectTypeOf(sumNumeric(frozen)).toEqualTypeOf<number>();
    // @ts-expect-error - booleans are not in this union.
    sumNumeric([true]);
  });

  test("ex4 - splitCells() turns one union array into two narrow ones", () => {
    expectTypeOf(splitCells([])).toEqualTypeOf<{ texts: string[]; numbers: number[] }>();
    // @ts-expect-error - null is not one of the two members.
    splitCells([null]);
  });

  test("ex5 - Id is exactly string or number", () => {
    expectTypeOf<Id>().toEqualTypeOf<string | number>();
    expectTypeOf(idKey(1)).toEqualTypeOf<string>();
    expectTypeOf(sameId(1, "1")).toEqualTypeOf<boolean>();
    // @ts-expect-error - a boolean is not an id.
    sameId(1, true);
  });

  test("ex6 - compact() drops null and undefined from the element type", () => {
    expectTypeOf(compact([])).toEqualTypeOf<string[]>();
    expectTypeOf(compact(["a", null, undefined])).toEqualTypeOf<string[]>();
    // @ts-expect-error - these cells are strings.
    compact([1]);
  });

  test("ex7 - Cell is the four-member union", () => {
    expectTypeOf<Cell>().toEqualTypeOf<string | number | boolean | null>();
    expectTypeOf(parseCells("a")).toEqualTypeOf<Cell[]>();
    // @ts-expect-error - parseCells reads a row of text.
    parseCells(["a"]);
  });

  test("ex8 - ColumnKind is a closed set of five", () => {
    expectTypeOf<ColumnKind>().toEqualTypeOf<
      "empty" | "string" | "number" | "boolean" | "mixed"
    >();
    expectTypeOf(columnKinds([])).toEqualTypeOf<ColumnKind[]>();
    // @ts-expect-error - a missing cell is null, not undefined.
    columnKinds([[undefined]]);
  });
});
