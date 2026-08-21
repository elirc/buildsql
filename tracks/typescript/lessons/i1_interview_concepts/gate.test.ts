// Gate for typescript/i1_interview_concepts. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { lengthOf } from "./ex1/solution";
import { describeJob } from "./ex2/solution";
import { describeEvent } from "./ex3/solution";
import { errorMessage } from "./ex4/solution";
import { safeGet } from "./review1/solution";

describe("i1_interview_concepts", () => {
  test("ex1 - lengthOf() checks before it acts", () => {
    expect(lengthOf("hello"), "a string's length is its character count").toBe(5);
    expect(lengthOf([1, 2, 3]), "an array's length is its element count").toBe(3);
    expect(lengthOf({ a: 1, b: 2 }), "an object's length is how many keys it has").toBe(2);
    expect(lengthOf(null), "null is not an object for this purpose - typeof lies").toBe(0);
    expect(lengthOf(42), "a number has no length: 0").toBe(0);
    expect(lengthOf(undefined), "and neither does undefined").toBe(0);
  });

  test("ex2 - describeJob() covers every state", () => {
    expect(describeJob({ status: "queued" }), "queued renders as 'queued'").toBe("queued");
    expect(describeJob({ status: "running", percent: 40 }), "running shows the percent").toBe(
      "running (40%)",
    );
    expect(describeJob({ status: "done", durationMs: 120 }), "done shows the duration").toBe(
      "done in 120ms",
    );
    expect(
      describeJob({ status: "failed", message: "gate red" }),
      "the fourth variant needs its own branch: 'failed: <message>' - a default " +
        "that returns 'unknown' is the bug this exercise is about",
    ).toBe("failed: gate red");
  });

  test("ex3 - describeEvent() sees both merged declarations", () => {
    expect(
      describeEvent("pass", { exercise: "ex1" }),
      "a pass reads 'pass <exercise>'",
    ).toBe("pass ex1");
    expect(
      describeEvent("fail", { exercise: "ex2", message: "wrong shape" }),
      "the fail event only exists if your second interface declaration merged - " +
        "'fail <exercise>: <message>'",
    ).toBe("fail ex2: wrong shape");
  });

  test("ex4 - errorMessage() survives anything a catch can hand it", () => {
    expect(errorMessage(new Error("boom")), "a real Error contributes its message").toBe("boom");
    expect(
      errorMessage(new TypeError("bad type")),
      "every built-in error subclass is still an Error",
    ).toBe("bad type");
    expect(errorMessage("just a string"), "JavaScript can throw a string, and code does").toBe(
      "just a string",
    );
    expect(errorMessage(42), "anything else falls back to a fixed message").toBe("unknown error");
    expect(errorMessage(null), "including null, which is a legal thing to throw").toBe(
      "unknown error",
    );
  });

  test("review1 - safeGet() reads a key off something unknown", () => {
    expect(safeGet({ title: "Unions" }, "title"), "a present key gives its value").toBe("Unions");
    expect(safeGet({ count: 0 }, "count"), "a falsy value is still a value").toBe(0);
    expect(safeGet({}, "title"), "a missing key is undefined").toBeUndefined();
    expect(safeGet(null, "title"), "null in gives undefined out, with no exception").toBeUndefined();
    expect(safeGet("a string", "title"), "and so does a primitive").toBeUndefined();
  });
});
