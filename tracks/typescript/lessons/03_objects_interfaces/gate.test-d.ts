// Type gate for typescript/03_objects_interfaces. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import type { Lesson } from "./ex1/solution";
import { describeLesson } from "./ex1/solution";
import type { Draft } from "./ex2/solution";
import { renameDraft } from "./ex2/solution";
import type { Tally } from "./ex3/solution";
import { resolveOptions } from "./ex4/solution";
import type { Part } from "./challenge/solution";
import { summarise } from "./challenge/solution";
import type { Learner } from "./review1/solution";
import { greetLearner } from "./review1/solution";

describe("03_objects_interfaces", () => {
  test("ex1 - Lesson has three required members and one optional one", () => {
    const lesson: Lesson = { slug: "02_functions", title: "Functions", exercises: 4 };
    expectTypeOf(lesson.title).toEqualTypeOf<string>();
    expectTypeOf(lesson.exercises).toEqualTypeOf<number>();
    expectTypeOf(lesson.challenge).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(describeLesson).returns.toEqualTypeOf<string>();
    // @ts-expect-error - exercises is a count, not a string.
    const wrong: Lesson = { slug: "x", title: "y", exercises: "4" };
  });

  test("ex2 - Draft is readonly all the way down", () => {
    const draft: Draft = { id: "d1", title: "First pass", tags: ["draft"] };
    expectTypeOf(renameDraft(draft, "next")).toEqualTypeOf<Draft>();
    // @ts-expect-error - id is readonly, so this assignment must not compile.
    draft.id = "d2";
    // @ts-expect-error - tags is a readonly array, so push is not on it.
    draft.tags.push("late");
  });

  test("ex3 - Tally accepts any slug as a key", () => {
    const tally: Tally = { "01_types": 2, "02_functions": 1 };
    expectTypeOf(tally["anything at all"]).toEqualTypeOf<number>();
    // @ts-expect-error - the values are counts, so a string is not one.
    const wrong: Tally = { "01_types": "2" };
  });

  test("ex4 - ResolvedOptions has no optional members left", () => {
    const resolved = resolveOptions({});
    expectTypeOf(resolved.retries).toEqualTypeOf<number>();
    expectTypeOf(resolved.verbose).toEqualTypeOf<boolean>();
    expectTypeOf(resolved.label).toEqualTypeOf<string>();
    // @ts-expect-error - a misspelled option is caught by the excess property check.
    resolveOptions({ retires: 2 });
  });

  test("challenge - Part nests lessons, PartSummary counts them", () => {
    const part: Part = { title: "Part 1", lessons: [{ slug: "01_types", exercises: 4 }] };
    const summary = summarise([part])[0];
    expectTypeOf(summary.title).toEqualTypeOf<string>();
    expectTypeOf(summary.lessonCount).toEqualTypeOf<number>();
    expectTypeOf(summary.exerciseCount).toEqualTypeOf<number>();
  });

  test("review1 - the Learner nickname is optional", () => {
    const learner: Learner = { name: "Ada", streak: 3 };
    expectTypeOf(learner.streak).toEqualTypeOf<number>();
    expectTypeOf(learner.nickname).toEqualTypeOf<string | undefined>();
    expectTypeOf(greetLearner).returns.toEqualTypeOf<string>();
  });
});
