// Type gate for typescript/i1_interview_concepts. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { lengthOf } from "./ex1/solution";
import type { JobState } from "./ex2/solution";
import { describeJob } from "./ex2/solution";
import type { DojoEvents } from "./ex3/solution";
import { describeEvent } from "./ex3/solution";
import { errorMessage } from "./ex4/solution";
import { safeGet } from "./review1/solution";

describe("i1_interview_concepts", () => {
  test("ex1 - lengthOf() takes unknown, not any", () => {
    expectTypeOf(lengthOf).parameters.toEqualTypeOf<[value: unknown]>();
    expectTypeOf(lengthOf).returns.toEqualTypeOf<number>();
  });

  test("ex2 - describeJob() still accepts every state", () => {
    expectTypeOf(describeJob).parameters.toEqualTypeOf<[job: JobState]>();
    // @ts-expect-error - "paused" is not one of the four states.
    describeJob({ status: "paused" });
  });

  test("ex3 - the merged interface has both events", () => {
    expectTypeOf<keyof DojoEvents>().toEqualTypeOf<"pass" | "fail">();
    expectTypeOf<DojoEvents["fail"]>().toEqualTypeOf<{ exercise: string; message: string }>();
    // @ts-expect-error - a fail payload needs a message.
    describeEvent("fail", { exercise: "ex2" });
    // @ts-expect-error - "skip" was never declared.
    describeEvent("skip", { exercise: "ex2" });
  });

  test("ex4 - errorMessage() accepts anything, because throw does", () => {
    expectTypeOf(errorMessage).parameters.toEqualTypeOf<[error: unknown]>();
    expectTypeOf(errorMessage).returns.toEqualTypeOf<string>();
  });

  test("review1 - safeGet() hands back unknown, not any", () => {
    expectTypeOf(safeGet).parameters.toEqualTypeOf<[source: unknown, key: string]>();
    expectTypeOf(safeGet({}, "k")).toEqualTypeOf<unknown>();
    // @ts-expect-error - the result is unknown until you narrow it.
    safeGet({}, "k").length;
  });
});
