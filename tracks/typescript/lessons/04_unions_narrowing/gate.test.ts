// Gate for typescript/04_unions_narrowing. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { formatCell } from "./ex1/solution";
import { describeEvent } from "./ex2/solution";
import { explainFailure } from "./ex3/solution";
import { area } from "./ex4/solution";
import type { Shape } from "./ex4/solution";
import { partition, unwrapOr } from "./challenge/solution";
import { describePayment } from "./review1/solution";

describe("04_unions_narrowing", () => {
  test("ex1 - formatCell() handles all three member types", () => {
    expect(formatCell("ada"), "a string comes back untouched").toBe("ada");
    expect(
      formatCell(3),
      "numbers get exactly one decimal place: toFixed(1) turns 3 into '3.0'",
    ).toBe("3.0");
    expect(formatCell(9.96), "9.96 to one decimal place rounds up to '10.0'").toBe("10.0");
    expect(formatCell(true), "true renders as 'yes'").toBe("yes");
    expect(
      formatCell(false),
      "false renders as 'no' - and note this is the branch a truthiness check " +
        "on the wrong variable would get wrong",
    ).toBe("no");
  });

  test("ex2 - describeEvent() renders each variant of the union", () => {
    expect(
      describeEvent({ kind: "pass", exercise: "ex2", attempts: 3 }),
      "a pass reads '<exercise> passed after <n> attempts'",
    ).toBe("ex2 passed after 3 attempts");
    expect(
      describeEvent({ kind: "fail", exercise: "ex2", message: "wrong shape" }),
      "a fail reads '<exercise> failed: <message>'",
    ).toBe("ex2 failed: wrong shape");
    expect(
      describeEvent({ kind: "hint", exercise: "ex1", tier: 2 }),
      "a hint reads '<exercise> revealed hint <tier>' - reread README ex2",
    ).toBe("ex1 revealed hint 2");
  });

  test("ex3 - explainFailure() narrows without a discriminant", () => {
    expect(
      explainFailure(new Error("boom")),
      "an Error is recognised with instanceof, and only its message is used",
    ).toBe("caught: boom");
    expect(
      explainFailure({ code: 404, detail: "not found" }),
      "the HTTP-shaped object reads 'http <code>: <detail>' - lowercase http",
    ).toBe("http 404: not found");
    expect(
      explainFailure({ timeoutMs: 250 }),
      "the timeout object reads 'timed out after <n>ms'",
    ).toBe("timed out after 250ms");
  });

  test("ex4 - area() covers every shape, and says so when it cannot", () => {
    expect(area({ kind: "square", side: 3 }), "a square of side 3 has area 9").toBe(9);
    expect(area({ kind: "rect", width: 3, height: 4 }), "3 by 4 is 12").toBe(12);
    expect(
      area({ kind: "circle", radius: 2 }),
      "pi r squared - use Math.PI, not 3.14",
    ).toBeCloseTo(12.566, 3);
    const smuggled = { kind: "triangle", base: 3, height: 4 } as unknown as Shape;
    expect(
      () => area(smuggled),
      "a variant the type system never allowed still has to fail loudly at " +
        "runtime: assertNever throws 'unhandled variant: ...' (README ex4)",
    ).toThrow(/unhandled variant/);
  });

  test("challenge - Result narrows on a boolean discriminant", () => {
    expect(
      unwrapOr({ ok: true, value: "green" }, "fallback"),
      "a success unwraps to its value",
    ).toBe("green");
    expect(
      unwrapOr({ ok: false, error: "boom" }, "fallback"),
      "a failure produces the fallback, never the error text",
    ).toBe("fallback");
    expect(
      partition([
        { ok: true, value: "a" },
        { ok: false, error: "x" },
        { ok: true, value: "b" },
      ]),
      "partition keeps both lists in input order: values ['a','b'], errors ['x']",
    ).toEqual({ values: ["a", "b"], errors: ["x"] });
    expect(
      partition([]),
      "an empty input still returns both arrays, empty - not undefined",
    ).toEqual({ values: [], errors: [] });
  });

  test("review1 - describePayment() renders three methods", () => {
    expect(describePayment({ method: "cash" }), "cash carries no extra data").toBe("cash");
    expect(
      describePayment({ method: "card", last4: "4242" }),
      "a card reads 'card ending <last4>'",
    ).toBe("card ending 4242");
    expect(
      describePayment({ method: "transfer", iban: "DE89 3704 0044" }),
      "a transfer reads 'transfer to <iban>'",
    ).toBe("transfer to DE89 3704 0044");
  });
});
