// Gate for typescript/03_objects_interfaces. Quoted verbatim in README.md.
import { describe, expect, test } from "vitest";

import { describeLesson } from "./ex1/solution";
import { renameDraft } from "./ex2/solution";
import { countAttempts } from "./ex3/solution";
import { resolveOptions } from "./ex4/solution";
import { summarise } from "./challenge/solution";
import { greetLearner } from "./review1/solution";

describe("03_objects_interfaces", () => {
  test("ex1 - describeLesson() renders a lesson, challenge or not", () => {
    expect(
      describeLesson({ slug: "02_functions", title: "Functions", exercises: 4, challenge: true }),
      "the full form is '<slug>: <title> - <n> exercises + challenge'",
    ).toBe("02_functions: Functions - 4 exercises + challenge");
    expect(
      describeLesson({ slug: "05_literals_enums", title: "Literals", exercises: 3 }),
      "with no challenge property at all the suffix is dropped entirely",
    ).toBe("05_literals_enums: Literals - 3 exercises");
    expect(
      describeLesson({ slug: "09_mapped", title: "Mapped", exercises: 4, challenge: false }),
      "challenge: false renders exactly like a missing challenge - a truthiness " +
        "check handles both, and the property has to be optional to accept the middle case",
    ).toBe("09_mapped: Mapped - 4 exercises");
  });

  test("ex2 - renameDraft() copies instead of mutating", () => {
    const draft = { id: "d1", title: "First pass", tags: ["draft", "ts"] };
    const renamed = renameDraft(draft, "Second pass");
    expect(renamed.title, "the returned draft carries the new title").toBe("Second pass");
    expect(renamed.id, "everything else is copied across unchanged").toBe("d1");
    expect(renamed.tags, "including the tags").toEqual(["draft", "ts"]);
    expect(
      draft.title,
      "the draft you were handed still says 'First pass' - spread into a new " +
        "object, do not assign into the old one (README ex2)",
    ).toBe("First pass");
    expect(renamed, "the result is a different object, not the same reference").not.toBe(draft);
  });

  test("ex3 - countAttempts() tallies by slug", () => {
    expect(
      countAttempts(["01_types", "02_functions", "01_types"]),
      "two attempts at 01_types, one at 02_functions",
    ).toEqual({ "01_types": 2, "02_functions": 1 });
    expect(
      countAttempts([]),
      "no attempts means an empty object, not undefined and not { total: 0 }",
    ).toEqual({});
    expect(
      countAttempts(["a", "a", "a"]).a,
      "the third sighting of 'a' makes 3 - a missing count starts at 0",
    ).toBe(3);
  });

  test("ex4 - resolveOptions() fills every hole", () => {
    expect(
      resolveOptions({}),
      "an empty options object gets all three defaults: 1, false, 'run'",
    ).toEqual({ retries: 1, verbose: false, label: "run" });
    expect(
      resolveOptions({ verbose: true, label: "nightly" }),
      "supplied values win; the one you left out still gets its default",
    ).toEqual({ retries: 1, verbose: true, label: "nightly" });
    expect(
      resolveOptions({ retries: 0 }),
      "an explicit 0 means zero retries and must survive - `||` would turn it " +
        "into 1, `??` would not (README ex4)",
    ).toEqual({ retries: 0, verbose: false, label: "run" });
  });

  test("challenge - summarise() counts lessons and exercises per part", () => {
    const parts = [
      {
        title: "Part 1",
        lessons: [
          { slug: "01_types", exercises: 4 },
          { slug: "02_functions", exercises: 4 },
        ],
      },
      { title: "Part 2", lessons: [{ slug: "06_generics_1", exercises: 3 }] },
      { title: "Part 3", lessons: [] },
    ];
    expect(
      summarise(parts),
      "one summary per part, in the same order, with both counts computed from " +
        "the nested lessons array",
    ).toEqual([
      { title: "Part 1", lessonCount: 2, exerciseCount: 8 },
      { title: "Part 2", lessonCount: 1, exerciseCount: 3 },
      { title: "Part 3", lessonCount: 0, exerciseCount: 0 },
    ]);
  });

  test("review1 - greetLearner() prefers the nickname", () => {
    expect(
      greetLearner({ name: "Ada", streak: 3 }),
      "no nickname, so the real name is shown: 'Ada - 3 day streak'",
    ).toBe("Ada - 3 day streak");
    expect(
      greetLearner({ name: "Grace", nickname: "Amazing Grace", streak: 12 }),
      "a nickname replaces the name entirely",
    ).toBe("Amazing Grace - 12 day streak");
    expect(
      greetLearner({ name: "Eli", streak: 0 }),
      "a zero streak has its own wording - reread README review1",
    ).toBe("Eli - no streak yet");
  });
});
