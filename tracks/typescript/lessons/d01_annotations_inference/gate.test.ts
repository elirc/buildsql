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
