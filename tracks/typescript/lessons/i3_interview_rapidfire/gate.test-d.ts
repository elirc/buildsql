// Type gate for typescript/i3_interview_rapidfire. Quoted verbatim in README.md.
import { describe, expectTypeOf, test } from "vitest";

import { toNumber } from "./ex1/solution";
import type { Level } from "./ex2/solution";
import { levelBadge } from "./ex2/solution";
import { sortByKey } from "./ex3/solution";
import type { MyNonNullable, MyReturnType } from "./ex4/solution";
import { compact } from "./ex4/solution";
import { ROUTES } from "./review1/solution";

interface Learner {
  name: string;
  streak: number;
}

describe("i3_interview_rapidfire", () => {
  test("ex1 - toNumber() takes unknown, not any", () => {
    expectTypeOf(toNumber).parameters.toEqualTypeOf<[value: unknown]>();
    expectTypeOf(toNumber("42")).toEqualTypeOf<number | null>();
  });

  test("ex2 - levelBadge() still accepts exactly four levels", () => {
    expectTypeOf(levelBadge).parameters.toEqualTypeOf<[level: Level]>();
    // @ts-expect-error - "expert" is not a level.
    levelBadge("expert");
  });

  test("ex3 - sortByKey() constrains the key and keeps the element type", () => {
    const learners: Learner[] = [{ name: "Ada", streak: 12 }];
    expectTypeOf(sortByKey(learners, "streak")).toEqualTypeOf<Learner[]>();
    // @ts-expect-error - "nickname" is not a key of Learner.
    sortByKey(learners, "nickname");
  });

  test("ex4 - the two utility types match the built-ins", () => {
    expectTypeOf<MyNonNullable<string | null | undefined>>().toEqualTypeOf<string>();
    expectTypeOf<MyNonNullable<number | null>>().toEqualTypeOf<number>();
    expectTypeOf<MyReturnType<() => string>>().toEqualTypeOf<string>();
    expectTypeOf<MyReturnType<(a: number) => Promise<number>>>().toEqualTypeOf<Promise<number>>();
    expectTypeOf(compact([1, null, 2])).toEqualTypeOf<number[]>();
    expectTypeOf(compact(["a", undefined])).toEqualTypeOf<string[]>();
  });

  test("review1 - the route table kept its literal types", () => {
    expectTypeOf<keyof typeof ROUTES>().toEqualTypeOf<"listLessons" | "submitAttempt">();
    expectTypeOf(ROUTES.listLessons.path).toEqualTypeOf<"/lessons">();
    expectTypeOf(ROUTES.submitAttempt.method).toEqualTypeOf<"POST">();
    // @ts-expect-error - as const made every member readonly.
    ROUTES.listLessons.path = "/other";
  });
});
