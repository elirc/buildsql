// Gate for typescript/d05_unions_basics. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { cellWidth } from "./ex1/solution";
import { toCellText } from "./ex2/solution";
import { sumNumeric } from "./ex3/solution";
import { splitCells } from "./ex4/solution";
import { idKey, sameId } from "./ex5/solution";
import { compact } from "./ex6/solution";
import { parseCells } from "./ex7/solution";
import { columnKinds } from "./ex8/solution";

describe("d05_unions_basics", () => {
  test("ex1 - cellWidth() measures each member its own way", () => {
    expect(cellWidth("  hi  "), "a string is measured after trimming: 2").toBe(2);
    expect(cellWidth(""), "an empty string has width 0").toBe(0);
    expect(cellWidth(1234), "a number is measured in digits: 4").toBe(4);
    expect(cellWidth(0), "zero is one digit, not none").toBe(1);
    expect(
      cellWidth(-12.5),
      "the sign and the decimal point are not digits, so -12.5 is 3 wide",
    ).toBe(3);
    expect(cellWidth(-0.5), "and -0.5 is 2 - the leading zero counts").toBe(2);
  });

  test("ex2 - toCellText() renders every member, including null", () => {
    expect(toCellText(null), "an empty cell renders as a dash").toBe("-");
    expect(toCellText(0), "zero is a value: it renders as 0, not as a dash").toBe("0");
    expect(toCellText(-2.5), "negatives render as they are").toBe("-2.5");
    expect(toCellText("  a "), "text is trimmed").toBe("a");
    expect(
      toCellText("   "),
      "text that is only whitespace is an empty cell too - reread README ex2",
    ).toBe("-");
  });

  test("ex3 - sumNumeric() adds only the number members", () => {
    expect(sumNumeric([1, "2", 3]), "the text 2 is not a number: 1 + 3").toBe(4);
    expect(sumNumeric([]), "nothing to add is 0, not undefined").toBe(0);
    expect(sumNumeric(["a", "b"]), "no numbers at all is still 0").toBe(0);
    expect(
      sumNumeric([1.5, "1.5"]),
      "a numeric-looking string is still a string - do not coerce it",
    ).toBe(1.5);
    expect(sumNumeric([-1, 1]), "negatives are numbers too").toBe(0);
  });

  test("ex4 - splitCells() separates the union into two arrays", () => {
    expect(
      splitCells(["a", 1, "b", 2]),
      "both lists keep the order they had in the input",
    ).toEqual({ texts: ["a", "b"], numbers: [1, 2] });
    expect(splitCells([]), "an empty input still returns both arrays, empty").toEqual({
      texts: [],
      numbers: [],
    });
    expect(splitCells([1, 2]), "all numbers means an empty texts array").toEqual({
      texts: [],
      numbers: [1, 2],
    });
    expect(
      splitCells(["", 0]),
      "the empty string and the zero are values, and both belong in a list",
    ).toEqual({ texts: [""], numbers: [0] });
  });

  test("ex5 - idKey() and sameId() keep the two members apart", () => {
    expect(idKey(12), "a numeric id is tagged n:").toBe("n:12");
    expect(idKey("12"), "a string id is tagged s:").toBe("s:12");
    expect(sameId(12, 12), "the same number twice is the same id").toBe(true);
    expect(sameId("a", "a"), "and so is the same string twice").toBe(true);
    expect(
      sameId(12, "12"),
      "12 and the text 12 are DIFFERENT ids - that is the point of the tag " +
        "(README ex5)",
    ).toBe(false);
    expect(sameId(1, 2), "two different numbers are two different ids").toBe(false);
  });

  test("ex6 - compact() removes the empty members and nothing else", () => {
    expect(
      compact(["a", null, "", undefined, "b"]),
      "null and undefined go; the empty string stays, because it is a string",
    ).toEqual(["a", "", "b"]);
    expect(compact([]), "an empty input compacts to an empty array").toEqual([]);
    expect(compact([null, undefined]), "nothing survives, and that is []").toEqual([]);
    expect(
      compact(["  "]),
      "a whitespace string is not empty in the union sense - it survives",
    ).toEqual(["  "]);
  });

  test("ex7 - parseCells() classifies every field of a row", () => {
    expect(
      parseCells("a,1,true,,3.5"),
      "text, number, boolean, empty and a decimal - five different members",
    ).toEqual(["a", 1, true, null, 3.5]);
    expect(parseCells("0,-2.5,1e3"), "0, a negative and exponent notation are all numbers").toEqual(
      [0, -2.5, 1000],
    );
    expect(
      parseCells(" x , FALSE "),
      "fields are trimmed, and only the exact lowercase true and false are booleans",
    ).toEqual(["x", "FALSE"]);
    expect(parseCells("false"), "the exact text false IS the boolean").toEqual([false]);
    expect(
      parseCells(""),
      "an empty row is one empty field, so one null - not an empty array",
    ).toEqual([null]);
    expect(parseCells("  ,  "), "two whitespace fields are two empty cells").toEqual([null, null]);
  });

  test("ex8 - columnKinds() reports one kind per column", () => {
    expect(
      columnKinds([
        [1, "a", null],
        [2, "b", true],
      ]),
      "one kind per column, read down the rows",
    ).toEqual(["number", "string", "boolean"]);
    expect(
      columnKinds([
        [1, null],
        ["x", null],
      ]),
      "a column with two different kinds is mixed; a column with only nulls is empty",
    ).toEqual(["mixed", "empty"]);
    expect(
      columnKinds([[1], [2, "x"]]),
      "ragged rows are padded with nothing: the missing cell counts as empty",
    ).toEqual(["number", "string"]);
    expect(columnKinds([]), "no rows means no columns").toEqual([]);
    expect(columnKinds([[null, null]]), "every column of nulls is empty").toEqual([
      "empty",
      "empty",
    ]);
    expect(
      columnKinds([[1], ["a"], [true]]),
      "three kinds in one column is still just mixed, not a list of them",
    ).toEqual(["mixed"]);
  });
});
