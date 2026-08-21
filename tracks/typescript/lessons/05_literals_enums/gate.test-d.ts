// Type gate for typescript/05_literals_enums. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Level } from "./ex1/solution";
import { nextLevel } from "./ex1/solution";
import { TRACK_TITLES, titleOf } from "./ex2/solution";
import { Status, statusLabel } from "./ex3/solution";
import type { Tier } from "./challenge/solution";
import { sortTiers } from "./challenge/solution";
import type { Verdict } from "./review1/solution";

describe("05_literals_enums", () => {
  test("ex1 - Level has exactly three values", () => {
    expectTypeOf<Level>().toEqualTypeOf<"beginner" | "intermediate" | "advanced">();
    expectTypeOf(nextLevel("beginner")).toEqualTypeOf<Level>();
    // @ts-expect-error - "expert" is not a level in this course.
    nextLevel("expert");
  });

  test("ex2 - as const keeps the titles literal and readonly", () => {
    expectTypeOf(TRACK_TITLES.typescript).toEqualTypeOf<"TypeScript">();
    expectTypeOf(titleOf).parameters.toEqualTypeOf<[track: "typescript" | "node" | "react"]>();
    // @ts-expect-error - as const made every property readonly.
    TRACK_TITLES.node = "Node";
    // @ts-expect-error - "csharp" is not a track this table knows.
    titleOf("csharp");
  });

  test("ex3 - a string enum is nominal", () => {
    expectTypeOf(statusLabel).parameters.toEqualTypeOf<[status: Status]>();
    // @ts-expect-error - the raw string is not assignable to the enum type.
    const sneaky: Status = "draft";
    // @ts-expect-error - and the same is true at a call site.
    statusLabel("published");
  });

  test("challenge - Tier is derived from the object keys", () => {
    expectTypeOf<Tier>().toEqualTypeOf<"nudge" | "approach" | "almost">();
    expectTypeOf(sortTiers(["nudge"])).toEqualTypeOf<Tier[]>();
    // @ts-expect-error - "shout" is not a key of HINT_TIERS.
    sortTiers(["shout"]);
  });

  test("review1 - Verdict is a closed set", () => {
    expectTypeOf<Verdict>().toEqualTypeOf<"pass" | "fail" | "skip">();
    // @ts-expect-error - "error" is not one of the three verdicts.
    const wrong: Verdict = "error";
  });
});
