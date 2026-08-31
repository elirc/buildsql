# d01 - Annotations and inference (drill set)

Eight problems that drill what you write down and what you let the compiler
work out for itself - lesson **01_primitives_and_inference**; redo that lesson
first if this set feels like guessing. Half of these ship with a deliberately
wrong or missing return annotation: fixing the type is part of the exercise,
and the type gate is what marks it.

## ex1 - format a reading

`formatReading(station, celsius)` returns `"<station> <celsius>C"` with the
temperature at exactly one decimal place, rounded.

- `formatReading("roof", 21.53)` -> `"roof 21.5C"`
- `formatReading("roof", 21)` -> `"roof 21.0C"`
- `formatReading("cellar", -3.24)` -> `"cellar -3.2C"`

Edit `ex1/solution.ts`.

```
uv run dojo test typescript d01_annotations_inference ex1
```

## ex2 - a clock label

`clockLabel(seconds)` returns `mm:ss`, each half padded to two digits. Minutes
are **not** capped at 59. A fractional input never rounds up into a second that
has not happened; a negative input is clamped to zero.

- `clockLabel(65)` -> `"01:05"`, `clockLabel(3600)` -> `"60:00"`
- `clockLabel(7325)` -> `"122:05"`, `clockLabel(90.9)` -> `"01:30"`
- `clockLabel(-10)` -> `"00:00"`

Edit `ex2/solution.ts`.

```
uv run dojo test typescript d01_annotations_inference ex2
```

## ex3 - split a station id

`splitStationId(id)` returns the tuple `[site: string, index: number]`, split at
the **last** dash. If there is no dash, or the tail after it is not made only of
digits, the whole id is the site and the index is `0`.

- `"roof-3"` -> `["roof", 3]`, `"north-wall-12"` -> `["north-wall", 12]`
- `"roof"` -> `["roof", 0]`, `"roof-x"` -> `["roof-x", 0]`, `"roof-"` -> `["roof-", 0]`

The shipped return annotation is `string[]`. That is the bug.

Edit `ex3/solution.ts`.

```
uv run dojo test typescript d01_annotations_inference ex3
```

## ex4 - the highest readings, without touching the input

`topReadings(values, count)` returns the `count` largest values, largest first,
as a **readonly** array. `count <= 0` returns nothing; a count larger than the
input returns everything. The caller's array must come back unmodified.

Edit `ex4/solution.ts`. The shipped return annotation hands back a mutable
array - tighten it.

```
uv run dojo test typescript d01_annotations_inference ex4
```

## ex5 - one object, three numbers

`summarise(values)` returns `{ count, mean, spread }`, where `spread` is the
largest value minus the smallest. An empty list returns all three as `0`.

- `[2, 4, 9]` -> `{ count: 3, mean: 5, spread: 7 }`
- `[4]` -> `{ count: 1, mean: 4, spread: 0 }`
- `[]` -> `{ count: 0, mean: 0, spread: 0 }`

The stub has **no** return annotation at all. Write it.

Edit `ex5/solution.ts`.

```
uv run dojo test typescript d01_annotations_inference ex5
```

## ex6 - parse one CSV row

`parseCsvRow(row)` returns `[station: string, celsius: number, ok: boolean]`.
Fields are separated by commas and trimmed. A temperature that is missing,
empty or not a finite number becomes `0`; the flag is `true` only for the exact
lowercase text `true`.

- `"roof,21.5,true"` -> `["roof", 21.5, true]`
- `"roof,warm,true"` -> `["roof", 0, true]`
- `"roof,21,TRUE"` -> `["roof", 21, false]`

Edit `ex6/solution.ts`. The shipped annotation is `(string | number | boolean)[]`,
which is close and still wrong.

```
uv run dojo test typescript d01_annotations_inference ex6
```

## ex7 - a moving average

`movingAverage(values, window)` returns the average of every **full** window of
`window` consecutive values, left to right. A window that is not a positive
integer, or is longer than the input, produces `[]`.

- `([1, 2, 3, 4], 2)` -> `[1.5, 2.5, 3.5]`
- `([1, 2, 3], 3)` -> `[2]`, `([1, 2, 3], 4)` -> `[]`
- `([1, 2, 3], 2.5)` -> `[]`

Edit `ex7/solution.ts`.

```
uv run dojo test typescript d01_annotations_inference ex7
```

## ex8 - run-length pairs

`runLengths(values)` collapses each run of consecutive equal values into a
`[value: number, count: number]` pair, in input order. Runs are consecutive:
this is not a tally.

- `[1, 1, 2, 3, 3, 3]` -> `[[1, 2], [2, 1], [3, 3]]`
- `[1, 2, 1]` -> `[[1, 1], [2, 1], [1, 1]]`
- `[]` -> `[]`

Edit `ex8/solution.ts`. The shipped annotation `number[][]` says far less than
you know.

```
uv run dojo test typescript d01_annotations_inference ex8
```

## The gate

This is the entire runtime gate, `gate.test.ts`:

```ts
// Gate for typescript/d01_annotations_inference. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { formatReading } from "./ex1/solution";
import { clockLabel } from "./ex2/solution";
import { splitStationId } from "./ex3/solution";
import { topReadings } from "./ex4/solution";
import { summarise } from "./ex5/solution";
import { parseCsvRow } from "./ex6/solution";
import { movingAverage } from "./ex7/solution";
import { runLengths } from "./ex8/solution";

describe("d01_annotations_inference", () => {
  test("ex1 - formatReading() renders one decimal place", () => {
    expect(
      formatReading("roof", 21.53),
      "one decimal place and a C suffix: roof 21.5C - toFixed(1) rounds for you",
    ).toBe("roof 21.5C");
    expect(
      formatReading("roof", 21),
      "a whole number still shows its decimal: 21.0C, not 21C",
    ).toBe("roof 21.0C");
    expect(
      formatReading("cellar", -3.24),
      "negatives keep their sign and round the same way",
    ).toBe("cellar -3.2C");
    expect(formatReading("mast", 0), "zero is a reading like any other").toBe("mast 0.0C");
  });

  test("ex2 - clockLabel() pads both halves to two digits", () => {
    expect(clockLabel(0), "zero seconds is 00:00, not 0:0").toBe("00:00");
    expect(clockLabel(65), "65 seconds is one minute and five: 01:05").toBe("01:05");
    expect(clockLabel(3599), "one second short of an hour is 59:59").toBe("59:59");
    expect(
      clockLabel(3600),
      "minutes are NOT capped at 59 - an hour reads 60:00 (README ex2)",
    ).toBe("60:00");
    expect(clockLabel(7325), "and two hours plus reads 122:05").toBe("122:05");
    expect(
      clockLabel(90.9),
      "a fractional input must not invent a second that has not happened: 01:30",
    ).toBe("01:30");
    expect(
      clockLabel(-10),
      "a negative count of seconds is clamped to zero, not rendered with a minus",
    ).toBe("00:00");
  });

  test("ex3 - splitStationId() splits at the last dash", () => {
    expect(splitStationId("roof-3"), "site and index, in that order").toEqual(["roof", 3]);
    expect(
      splitStationId("north-wall-12"),
      "the LAST dash is the split point, so the site keeps its own dash",
    ).toEqual(["north-wall", 12]);
    expect(splitStationId("roof"), "no dash at all means index 0").toEqual(["roof", 0]);
    expect(
      splitStationId("roof-x"),
      "a non-numeric tail is part of the site name, not an index - reread README ex3",
    ).toEqual(["roof-x", 0]);
    expect(splitStationId("roof-"), "a dash with nothing after it is the same case").toEqual([
      "roof-",
      0,
    ]);
  });

  test("ex4 - topReadings() copies, sorts numerically and slices", () => {
    const values = [5, 1, 9, 3];
    expect(topReadings(values, 2), "the two highest, highest first").toEqual([9, 5]);
    expect(
      values,
      "the caller array is untouched - sort() mutates, so copy before you sort",
    ).toEqual([5, 1, 9, 3]);
    expect(
      topReadings(values, 10),
      "a count larger than the data returns everything, still sorted",
    ).toEqual([9, 5, 3, 1]);
    expect(topReadings(values, 0), "a count of zero returns nothing").toEqual([]);
    expect(topReadings(values, -1), "and so does a negative count").toEqual([]);
    expect(topReadings([], 3), "an empty input has no top anything").toEqual([]);
    expect(
      topReadings([4, 4, 1], 2),
      "ties are not deduplicated - two 4s are two readings",
    ).toEqual([4, 4]);
    expect(
      topReadings([9, 10], 2),
      "the default sort compares as strings, so 10 would come first without a " +
        "numeric comparator",
    ).toEqual([10, 9]);
  });

  test("ex5 - summarise() reports count, mean and spread", () => {
    expect(summarise([2, 4, 9]), "count 3, mean 5, spread 9 minus 2").toEqual({
      count: 3,
      mean: 5,
      spread: 7,
    });
    expect(summarise([4]), "one value has no spread at all").toEqual({
      count: 1,
      mean: 4,
      spread: 0,
    });
    expect(
      summarise([-3, -1]),
      "negatives are the test of whether you seeded min and max from values[0]",
    ).toEqual({ count: 2, mean: -2, spread: 2 });
    expect(
      summarise([]),
      "an empty list has no mean, so this drill says three zeroes - a guard " +
        "before the division, not NaN (README ex5)",
    ).toEqual({ count: 0, mean: 0, spread: 0 });
  });

  test("ex6 - parseCsvRow() returns three slots of three types", () => {
    expect(parseCsvRow("roof,21.5,true"), "text, number, boolean - in that order").toEqual([
      "roof",
      21.5,
      true,
    ]);
    expect(parseCsvRow("cellar,-3,false"), "a negative temperature parses too").toEqual([
      "cellar",
      -3,
      false,
    ]);
    expect(
      parseCsvRow(" roof , 21.5 , true "),
      "every field is trimmed before it is used",
    ).toEqual(["roof", 21.5, true]);
    expect(
      parseCsvRow("roof"),
      "missing fields fall back to 0 and false rather than undefined",
    ).toEqual(["roof", 0, false]);
    expect(
      parseCsvRow("roof,warm,true"),
      "Number(warm) is NaN, and NaN is not a temperature - fall back to 0",
    ).toEqual(["roof", 0, true]);
    expect(
      parseCsvRow("roof,,true"),
      "an empty temperature field is also 0, even though Number() would say 0 anyway",
    ).toEqual(["roof", 0, true]);
    expect(
      parseCsvRow("roof,21,TRUE"),
      "the flag is true only for the exact lowercase text true",
    ).toEqual(["roof", 21, false]);
  });

  test("ex7 - movingAverage() slides a full window", () => {
    expect(
      movingAverage([1, 2, 3, 4], 2),
      "three full windows of two: 1.5, 2.5, 3.5",
    ).toEqual([1.5, 2.5, 3.5]);
    expect(movingAverage([1, 2, 3], 3), "one window that covers everything").toEqual([2]);
    expect(
      movingAverage([1, 2, 3], 1),
      "a window of one is the input back again, as averages",
    ).toEqual([1, 2, 3]);
    expect(
      movingAverage([1, 2, 3], 4),
      "a window longer than the data yields no full window, so nothing",
    ).toEqual([]);
    expect(movingAverage([1, 2, 3], 0), "a window of zero is nonsense: []").toEqual([]);
    expect(movingAverage([1, 2, 3], -2), "and so is a negative window").toEqual([]);
    expect(
      movingAverage([1, 2, 3], 2.5),
      "a fractional window is nonsense too - reread README ex7",
    ).toEqual([]);
    expect(movingAverage([], 1), "no data means no averages").toEqual([]);
  });

  test("ex8 - runLengths() collapses each run into a pair", () => {
    expect(
      runLengths([1, 1, 2, 3, 3, 3]),
      "three runs, each a [value, count] pair, in input order",
    ).toEqual([
      [1, 2],
      [2, 1],
      [3, 3],
    ]);
    expect(runLengths([]), "no values means no runs").toEqual([]);
    expect(runLengths([5]), "a single value is a run of one").toEqual([[5, 1]]);
    expect(runLengths([7, 7, 7]), "one run that covers everything").toEqual([[7, 3]]);
    expect(
      runLengths([1, 2, 1]),
      "runs are consecutive, so the two 1s are two separate runs - not a tally",
    ).toEqual([
      [1, 1],
      [2, 1],
      [1, 1],
    ]);
  });
});
```

And this is the entire type gate, `gate.test-d.ts`:

```ts
// Type gate for typescript/d01_annotations_inference. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { formatReading } from "./ex1/solution";
import { clockLabel } from "./ex2/solution";
import { splitStationId } from "./ex3/solution";
import { topReadings } from "./ex4/solution";
import { summarise } from "./ex5/solution";
import { parseCsvRow } from "./ex6/solution";
import { movingAverage } from "./ex7/solution";
import { runLengths } from "./ex8/solution";

describe("d01_annotations_inference", () => {
  test("ex1 - formatReading() is (string, number) => string", () => {
    expectTypeOf(formatReading).parameters.toEqualTypeOf<[station: string, celsius: number]>();
    expectTypeOf(formatReading).returns.toEqualTypeOf<string>();
    // @ts-expect-error - a temperature is a number, not the text of one.
    formatReading("roof", "21.5");
  });

  test("ex2 - clockLabel() takes exactly one number", () => {
    expectTypeOf(clockLabel).parameters.toEqualTypeOf<[seconds: number]>();
    expectTypeOf(clockLabel).returns.toEqualTypeOf<string>();
    // @ts-expect-error - the parameter is required, so a bare call is an error.
    clockLabel();
  });

  test("ex3 - splitStationId() returns a labelled two-slot tuple", () => {
    expectTypeOf(splitStationId("roof-3")).toEqualTypeOf<[site: string, index: number]>();
    // @ts-expect-error - a two-slot tuple has no index 2.
    splitStationId("roof-3")[2];
  });

  test("ex4 - topReadings() gives back a readonly array", () => {
    expectTypeOf(topReadings([1, 2], 1)).toEqualTypeOf<readonly number[]>();
    const frozen: readonly number[] = [3, 1];
    expectTypeOf(topReadings(frozen, 1)).toEqualTypeOf<readonly number[]>();
    // @ts-expect-error - the result is readonly, so push is not on it.
    topReadings([1, 2], 1).push(3);
  });

  test("ex5 - summarise() returns exactly three number members", () => {
    expectTypeOf(summarise([1])).toEqualTypeOf<{
      count: number;
      mean: number;
      spread: number;
    }>();
    // @ts-expect-error - this summary has no median.
    summarise([1]).median;
  });

  test("ex6 - parseCsvRow() returns a three-slot mixed tuple", () => {
    expectTypeOf(parseCsvRow("roof,21,true")).toEqualTypeOf<
      [station: string, celsius: number, ok: boolean]
    >();
    // @ts-expect-error - a three-slot tuple has no index 3.
    parseCsvRow("roof,21,true")[3];
  });

  test("ex7 - movingAverage() is readonly in, mutable out", () => {
    const frozen: readonly number[] = [1, 2, 3];
    expectTypeOf(movingAverage(frozen, 2)).toEqualTypeOf<number[]>();
    // @ts-expect-error - the window is a number, not the text of one.
    movingAverage([1, 2], "2");
  });

  test("ex8 - runLengths() returns an array of labelled pairs", () => {
    expectTypeOf(runLengths([1, 1])).toEqualTypeOf<[value: number, count: number][]>();
    // @ts-expect-error - these runs are runs of numbers.
    runLengths(["a", "a"]);
  });
});
```

Both gates run on every `dojo test` for this lesson, and an exercise is green
only when **both** agree. `tsc` checks a whole file at once, so an unfinished
ex7 will surface its type error even on a run filtered to `ex1` - the
per-exercise verdict line is still exact.
