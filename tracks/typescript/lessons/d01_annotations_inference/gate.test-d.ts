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
