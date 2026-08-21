// Gate for node/00_hello_dojo. Quoted verbatim in README.md.
// One test per exercise; the test title starts with the exercise directory
// name so `dojo test node 00_hello_dojo ex2` can select just that one.
import { describe, expect, test } from "vitest";

import { describeRuntime } from "./ex1/solution";
import { sumOfArgs } from "./ex2/solution";
import { totalOf } from "./ex3/solution";

describe("00_hello_dojo", () => {
  test("ex1 - describeRuntime() reads the process it is running in", () => {
    expect(
      describeRuntime(),
      "the string must be built from process.version and process.platform at " +
        "run time, in the exact shape given in README ex1",
    ).toBe(`Node.js ${process.version} on ${process.platform}`);
    expect(
      describeRuntime().startsWith("Node.js v"),
      "process.version already begins with a v - do not add a second one, and " +
        "do not strip the one that is there",
    ).toBe(true);
  });

  test("ex2 - sumOfArgs() skips the two entries Node puts in front", () => {
    expect(
      sumOfArgs(["/usr/bin/node", "/app/sum.js", "3", "4"]),
      "argv[0] is the node binary and argv[1] is the script - only the entries " +
        "after those two are user arguments (reread README ex2)",
    ).toBe(7);
    expect(
      sumOfArgs(["/usr/bin/node", "/app/sum.js"]),
      "no user arguments means an empty sum, which is 0 - not NaN and not undefined",
    ).toBe(0);
    expect(
      sumOfArgs(["node", "sum.js", "10", "-4", "0.5"]),
      "argv entries are always strings: Number(\"0.5\") is 0.5, but \"10\" + \"-4\" " +
        "is string concatenation, so convert before you add",
    ).toBe(6.5);
  });

  test("ex3 - totalOf() awaits every promise and adds the results", async () => {
    await expect(
      totalOf([Promise.resolve(1), Promise.resolve(2)]),
      "totalOf() must resolve to the sum of the resolved values, not to an " +
        "array and not to a promise of a promise",
    ).resolves.toBe(3);
    await expect(
      totalOf([]),
      "the sum of nothing is 0 - an empty input is a case, not an accident",
    ).resolves.toBe(0);
    // The gate keeps its own handler on this one so that an unfinished stub
    // cannot turn it into an unhandled rejection and crash the whole run.
    const failing = Promise.reject(new Error("boom"));
    failing.catch(() => {});
    await expect(
      totalOf([Promise.resolve(1), failing, Promise.resolve(3)]),
      "one rejected input must reject the whole thing with that same error - " +
        "do not swallow it and do not replace it with an error of your own",
    ).rejects.toThrow("boom");
  });
});
