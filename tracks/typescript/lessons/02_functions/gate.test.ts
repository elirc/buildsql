// Gate for typescript/02_functions. Quoted verbatim in README.md.
import { describe, expect, test, vi } from "vitest";

import { progressLine } from "./ex1/solution";
import { bestOf } from "./ex2/solution";
import { forEachTrack } from "./ex3/solution";
import { duplicate } from "./ex4/solution";
import { retry } from "./challenge/solution";
import { padCell } from "./review1/solution";

describe("02_functions", () => {
  test("ex1 - progressLine() defaults the total to 12", () => {
    expect(
      progressLine(3),
      "called with one argument, total has to fall back to 12: '3/12 (25%)'",
    ).toBe("3/12 (25%)");
    expect(
      progressLine(1, 3),
      "a third is 33%, not 33.333 and not 34 - Math.round, applied once",
    ).toBe("1/3 (33%)");
    expect(
      progressLine(2, 3),
      "two thirds rounds up to 67% - proof you rounded rather than truncated",
    ).toBe("2/3 (67%)");
    expect(progressLine(0, 5), "zero done is 0%, not NaN%").toBe("0/5 (0%)");
  });

  test("ex2 - bestOf() takes its scores as separate arguments", () => {
    expect(
      bestOf(4, 9, 2),
      "bestOf(4, 9, 2) is 9 - a rest parameter, not an array parameter",
    ).toBe(9);
    expect(bestOf(5), "one argument still works: the best of [5] is 5").toBe(5);
    expect(
      bestOf(),
      "no arguments at all means no scores yet, and the agreed answer is 0",
    ).toBe(0);
    expect(
      bestOf(...[1, 8, 3]),
      "spreading an array into a rest parameter is the same call - 8",
    ).toBe(8);
  });

  test("ex3 - forEachTrack() hands the callback a name and an index", () => {
    const seen: string[] = [];
    forEachTrack(["typescript", "node", "react"], (name, index) => {
      seen.push(`${index}:${name}`);
    });
    expect(
      seen,
      "the callback is called once per name, in order, with the index second",
    ).toEqual(["0:typescript", "1:node", "2:react"]);

    const visit = vi.fn();
    forEachTrack([], visit);
    expect(visit, "an empty list means the callback is never called").not.toHaveBeenCalled();
    expect(
      forEachTrack(["x"], () => {}),
      "forEachTrack returns nothing at all - its job is the side effect",
    ).toBeUndefined();
  });

  test("ex4 - duplicate() doubles a number and repeats a string", () => {
    expect(duplicate("ab"), 'duplicate("ab") concatenates: "abab"').toBe("abab");
    expect(duplicate(""), "an empty string duplicates to an empty string").toBe("");
    expect(duplicate(2), "duplicate(2) multiplies: 4, the number, not the string '22'").toBe(4);
    expect(duplicate(0), "0 doubled is 0 - check your branch, not your falsiness").toBe(0);
  });

  test("challenge - retry() re-runs a flaky action and gives up honestly", () => {
    let calls = 0;
    const flaky = () => {
      calls += 1;
      if (calls < 3) {
        throw new Error(`attempt ${calls} failed`);
      }
      return "ok";
    };
    expect(retry(5, flaky), "the third attempt succeeds, so retry returns 'ok'").toBe("ok");
    expect(calls, "retry stops as soon as the action succeeds - three calls, not five").toBe(3);

    let always = 0;
    expect(
      () =>
        retry(3, () => {
          always += 1;
          throw new Error(`boom ${always}`);
        }),
      "when every attempt fails, rethrow the LAST error rather than a new one",
    ).toThrow("boom 3");
    expect(always, "three attempts means the action ran exactly three times").toBe(3);

    expect(
      () => retry(0, () => "never"),
      "zero attempts is a caller mistake: throw with that exact message",
    ).toThrow("retry: attempts must be at least 1");
  });

  test("review1 - padCell() pads to a width with a filler", () => {
    expect(padCell("hi"), "the defaults are width 8 and filler '.'").toBe("hi......");
    expect(padCell("hi", 5), "one override, one default: 'hi...'").toBe("hi...");
    expect(padCell("hi", 5, "-"), "both overridden: 'hi---'").toBe("hi---");
    expect(
      padCell("overlong", 4),
      "text at least as wide as the cell comes back untouched - no truncation",
    ).toBe("overlong");
  });
});
