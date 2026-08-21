// Gate for typescript/09_mapped_conditional. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { thaw } from "./ex1/solution";
import { makeGetters } from "./ex2/solution";
import { flattenOnce } from "./ex3/solution";
import { withoutValues } from "./ex4/solution";
import { deepFreeze } from "./challenge/solution";

describe("09_mapped_conditional", () => {
  test("ex1 - thaw() hands back a writable copy", () => {
    const frozen: Readonly<{ retries: number; label: string }> = { retries: 1, label: "run" };
    const copy = thaw(frozen);
    expect(copy, "every member is copied across unchanged").toEqual({ retries: 1, label: "run" });
    expect(copy, "the copy is a new object, not the same reference").not.toBe(frozen);
    copy.label = "nightly";
    expect(copy.label, "and the copy really is writable at runtime").toBe("nightly");
  });

  test("ex2 - makeGetters() builds one getter per member", () => {
    const getters = makeGetters({ name: "Ada", streak: 12 });
    expect(getters.getName(), "the name member becomes getName()").toBe("Ada");
    expect(getters.getStreak(), "the streak member becomes getStreak()").toBe(12);
    expect(
      Object.keys(makeGetters({ name: "x" })),
      "only the renamed keys exist - the original member names are gone",
    ).toEqual(["getName"]);
  });

  test("ex3 - flattenOnce() flattens exactly one level", () => {
    expect(
      flattenOnce([
        [1, 2],
        [3],
      ]),
      "arrays are spread into the result, in order",
    ).toEqual([1, 2, 3]);
    expect(
      flattenOnce([1, 2]),
      "elements that are not arrays are passed through untouched",
    ).toEqual([1, 2]);
    expect(
      flattenOnce([[[1]], [2]]),
      "one level only: the inner [1] survives as an array (README ex3)",
    ).toEqual([[1], 2]);
    expect(flattenOnce([]), "nothing in, nothing out").toEqual([]);
  });

  test("ex4 - withoutValues() removes the listed values", () => {
    expect(
      withoutValues(["a", "b", "c"], ["b"]),
      "'b' is dropped, order is preserved",
    ).toEqual(["a", "c"]);
    expect(
      withoutValues(["a", "b", "a"], ["a"]),
      "every occurrence goes, not just the first",
    ).toEqual(["b"]);
    expect(withoutValues(["a"], []), "removing nothing keeps everything").toEqual(["a"]);
  });

  test("challenge - deepFreeze() freezes all the way down", () => {
    const config = { server: { host: "localhost", ports: { http: 80 } }, debug: false };
    const frozen = deepFreeze(config);
    expect(Object.isFrozen(frozen), "the top level is frozen").toBe(true);
    expect(
      Object.isFrozen(config.server),
      "and so is the nested object - Object.freeze on its own is shallow",
    ).toBe(true);
    expect(
      Object.isFrozen(config.server.ports),
      "and the one below that: the recursion has to reach every level",
    ).toBe(true);
    expect(frozen, "the values are untouched; only writability changed").toEqual({
      server: { host: "localhost", ports: { http: 80 } },
      debug: false,
    });
  });
});
