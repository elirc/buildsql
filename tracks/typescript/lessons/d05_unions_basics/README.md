# d05 - Unions, the basics (drill set)

Eight problems on plain unions - the ones you get handed rather than the ones
you design. They drill lesson **04_unions_narrowing**, first half; go back there
if "the members you can touch are the intersection" does not ring a bell.

Everything here is a spreadsheet importer: cells that might be text, might be a
number, might be nothing at all.

## ex1 - how wide is this cell

`cellWidth(value)` measures a `string | number`. A string is measured after
trimming; a number is measured in **digits**, so the sign and the decimal point
do not count.

- `cellWidth("  hi  ")` -> `2`, `cellWidth("")` -> `0`
- `cellWidth(1234)` -> `4`, `cellWidth(0)` -> `1`
- `cellWidth(-12.5)` -> `3`, `cellWidth(-0.5)` -> `2`

Edit `ex1/solution.ts`, where the parameter union has one member too many.

```
uv run dojo test typescript d05_unions_basics ex1
```

## ex2 - render a cell

`toCellText(value)` takes `string | number | null` and returns text. `null` is a
dash; a number renders as itself; a string is trimmed, and a string that is
empty after trimming is also a dash.

- `toCellText(null)` -> `"-"`, `toCellText("   ")` -> `"-"`
- `toCellText(0)` -> `"0"`, `toCellText("  a ")` -> `"a"`

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex2
```

## ex3 - add up only the numbers

`sumNumeric(values)` takes `readonly (string | number)[]` and returns the sum of
the members that really are numbers. A numeric-looking string is still a string.

- `[1, "2", 3]` -> `4`, `["a", "b"]` -> `0`, `[]` -> `0`

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex3
```

## ex4 - one union array, two narrow arrays

`splitCells(values)` returns `{ texts: string[], numbers: number[] }`, each in
input order. Both arrays are always present, even when empty.

Edit `ex4/solution.ts`, where the return type is still the union on both sides.

```
uv run dojo test typescript d05_unions_basics ex4
```

## ex5 - two kinds of id

`Id` is `string | number`. `idKey(id)` renders `"n:12"` for the number `12` and
`"s:12"` for the string `"12"`, and `sameId(a, b)` is true only when the keys
match - so `sameId(12, "12")` is `false`.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex5
```

## ex6 - drop the nothings

`compact(values)` takes `readonly (string | null | undefined)[]` and returns
`string[]`, keeping every string - **including** the empty one - and dropping
only `null` and `undefined`.

- `["a", null, "", undefined, "b"]` -> `["a", "", "b"]`

Edit `ex6/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex6
```

## ex7 - parse a row into cells

`Cell` is `string | number | boolean | null`. `parseCells(row)` splits on commas,
trims each field, and classifies it:

1. empty after trimming -> `null`
2. exactly `"true"` or `"false"` -> the boolean
3. a finite number -> that number
4. anything else -> the trimmed text

- `"a,1,true,,3.5"` -> `["a", 1, true, null, 3.5]`
- `" x , FALSE "` -> `["x", "FALSE"]`
- `""` -> `[null]`

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex7
```

## ex8 - what kind is each column

`ColumnKind` is `"empty" | "string" | "number" | "boolean" | "mixed"`.
`columnKinds(rows)` reports one kind per column, where the number of columns is
the longest row. Null cells (and cells missing from a short row) are ignored; a
column with nothing but those is `"empty"`; a column whose non-null cells are
all one kind is that kind; anything else is `"mixed"`.

- `[[1, "a", null], [2, "b", true]]` -> `["number", "string", "boolean"]`
- `[[1, null], ["x", null]]` -> `["mixed", "empty"]`
- `[[1], [2, "x"]]` -> `["number", "string"]`

Edit `ex8/solution.ts`.

```
uv run dojo test typescript d05_unions_basics ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
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
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
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
```

An exercise is green only when both gates agree about it.
